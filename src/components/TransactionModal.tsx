import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Sparkles, 
  PlusCircle, 
  Smartphone, 
  CreditCard, 
  Building2, 
  Banknote, 
  ArrowUpRight, 
  ArrowDownLeft, 
  RefreshCcw,
  Check,
  AlertCircle,
  Loader2,
  Calendar,
  Layers,
  Mic,
  MicOff,
  Volume2,
  Edit3
} from 'lucide-react';
import { Transaction, ExpenseCategory, PaymentMethod } from '../types';
import { ALL_CATEGORIES, CATEGORY_COLORS, parseTransactionLocally } from '../utils/finance';
import { learnCategoryRule, loadCategoryRules } from '../utils/storage';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTransaction: (tx: Transaction) => void;
  currency: string;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onAddTransaction,
  currency
}) => {
  const [activeTab, setActiveTab] = useState<'ai' | 'manual' | 'momo_feed'>('ai');

  // AI Prompt State
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiParsing, setIsAiParsing] = useState(false);
  const [aiParseResult, setAiParseResult] = useState<Partial<Transaction> | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  // Voice recognition state
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  // Manual Form State
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<Transaction['type']>('expense');
  const [category, setCategory] = useState<ExpenseCategory>('Food & Dining');
  const [description, setDescription] = useState('');
  const [merchant, setMerchant] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('MTN MoMo');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  // Clean up speech recognition on unmount or tab switch
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // ignore
        }
      }
    };
  }, []);

  const startListening = () => {
    const SpeechRecognitionAPI = 
      typeof window !== 'undefined' 
        ? ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)
        : null;

    if (!SpeechRecognitionAPI) {
      setSpeechError('Microphone speech recognition is not supported in this browser. You can type or tap a sample below.');
      return;
    }

    setSpeechError(null);

    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // ignore
        }
      }

      const recognition = new SpeechRecognitionAPI();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        if (currentTranscript) {
          setAiPrompt(currentTranscript);
          // Parse live as speech is recognized
          const localParsed = parseTransactionLocally(currentTranscript);
          setAiParseResult(localParsed);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setSpeechError('Microphone permission was denied. Please allow microphone access in your browser settings.');
        } else if (event.error === 'no-speech') {
          setSpeechError('No speech detected. Please tap the mic and speak clearly.');
        } else {
          setSpeechError(`Voice input error (${event.error}). Try again or type below.`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        // Automatically trigger AI parse on final transcript if available
        if (aiPrompt.trim()) {
          handleAiParse(undefined, aiPrompt);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.error('Failed to start speech recognition:', err);
      setIsListening(false);
      setSpeechError('Could not start voice recognition. Please try typing instead.');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
    }
    setIsListening(false);
  };

  // MoMo Mock Feed for Auto-Import Simulation
  const [pendingMoMoAlerts, setPendingMoMoAlerts] = useState([
    {
      id: 'momo-feed-1',
      sender: 'MTN MobileMoney',
      text: 'Payment received for 65.00 to Papaye Osu from 0244123456. Ref: 4892019. Fee: 0.00.',
      amount: 65,
      type: 'expense' as const,
      category: 'Food & Dining' as ExpenseCategory,
      merchant: 'Papaye Fast Foods Osu',
      description: 'Papaye Lunch & Drink',
      paymentMethod: 'MTN MoMo' as PaymentMethod,
      time: '12 mins ago'
    },
    {
      id: 'momo-feed-2',
      sender: 'ECG PowerApp',
      text: 'Prepaid Token Generated. Amount: 250.00. Meter: 04291823901. Token: 9812-4019-3321.',
      amount: 250,
      type: 'expense' as const,
      category: 'Utilities' as ExpenseCategory,
      merchant: 'Electricity Company of Ghana',
      description: 'ECG Prepaid Electricity',
      paymentMethod: 'MTN MoMo' as PaymentMethod,
      time: '1 hour ago'
    },
    {
      id: 'momo-feed-3',
      sender: 'Bolt Ride Receipt',
      text: 'Trip Completed: East Legon to Airport Terminal 3. Total: 54.00 charged to MTN MoMo.',
      amount: 54,
      type: 'expense' as const,
      category: 'Transport & Fuel' as ExpenseCategory,
      merchant: 'Bolt Ghana',
      description: 'Bolt Ride East Legon to Airport',
      paymentMethod: 'MTN MoMo' as PaymentMethod,
      time: '3 hours ago'
    }
  ]);

  if (!isOpen) return null;

  const handleAiParse = async (e?: React.FormEvent, customPrompt?: string) => {
    if (e) e.preventDefault();
    const promptToParse = customPrompt !== undefined ? customPrompt : aiPrompt;
    if (!promptToParse.trim()) return;

    setIsAiParsing(true);
    setAiError(null);

    try {
      // Call server-side Gemini API
      const res = await fetch('/api/ai/parse-transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: promptToParse })
      });

      const json = await res.json();
      if (json.success && json.data) {
        setAiParseResult({
          amount: json.data.amount,
          type: json.data.type || 'expense',
          category: (json.data.category as ExpenseCategory) || 'Other',
          description: json.data.description || promptToParse,
          merchant: json.data.merchant || '',
          paymentMethod: (json.data.paymentMethod as PaymentMethod) || 'MTN MoMo',
          date: new Date().toISOString().split('T')[0],
          notes: json.data.confidenceNote
        });
      } else {
        // Fallback local heuristic
        const local = parseTransactionLocally(promptToParse);
        setAiParseResult(local);
      }
    } catch (err: any) {
      console.warn('Using local parser fallback due to network/server response:', err);
      const local = parseTransactionLocally(promptToParse);
      setAiParseResult(local);
    } finally {
      setIsAiParsing(false);
    }
  };

  const handleSelectSample = (sampleText: string) => {
    setAiPrompt(sampleText);
    const parsed = parseTransactionLocally(sampleText);
    setAiParseResult(parsed);
    // Also trigger server parse for highest fidelity
    handleAiParse(undefined, sampleText);
  };

  const confirmAiTransaction = () => {
    if (!aiParseResult) return;
    const finalAmount = Number(aiParseResult.amount);
    if (isNaN(finalAmount) || finalAmount <= 0) {
      setAiError('Please enter a valid amount greater than 0.');
      return;
    }

    const newTx: Transaction = {
      id: `tx-ai-${Date.now()}`,
      amount: finalAmount,
      type: aiParseResult.type || 'expense',
      category: aiParseResult.category || 'Food & Dining',
      description: aiParseResult.description || aiPrompt || `${aiParseResult.category} transaction`,
      merchant: aiParseResult.merchant,
      paymentMethod: aiParseResult.paymentMethod || 'MTN MoMo',
      date: aiParseResult.date || new Date().toISOString().split('T')[0],
      isAutoImported: false,
      notes: aiParseResult.notes
    };

    if (aiParseResult.merchant && aiParseResult.category) {
      learnCategoryRule(aiParseResult.merchant, aiParseResult.category);
    }

    onAddTransaction(newTx);
    resetModal();
    onClose();
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) return;

    const newTx: Transaction = {
      id: `tx-manual-${Date.now()}`,
      amount: numAmount,
      type,
      category,
      description: description.trim() || `${category} payment`,
      merchant: merchant.trim() || undefined,
      paymentMethod,
      date: date || new Date().toISOString().split('T')[0],
      isAutoImported: false
    };

    if (merchant && category) {
      learnCategoryRule(merchant, category);
    }

    onAddTransaction(newTx);
    resetModal();
    onClose();
  };

  const handleImportMoMoAlert = (alertItem: typeof pendingMoMoAlerts[0]) => {
    const newTx: Transaction = {
      id: `tx-momo-${Date.now()}`,
      amount: alertItem.amount,
      type: alertItem.type,
      category: alertItem.category,
      description: alertItem.description,
      merchant: alertItem.merchant,
      paymentMethod: alertItem.paymentMethod,
      date: new Date().toISOString().split('T')[0],
      isAutoImported: true
    };

    onAddTransaction(newTx);
    setPendingMoMoAlerts(prev => prev.filter(a => a.id !== alertItem.id));
  };

  const resetModal = () => {
    setAiPrompt('');
    setAiParseResult(null);
    setAiError(null);
    setSpeechError(null);
    setAmount('');
    setDescription('');
    setMerchant('');
  };

  const quickPrompts = [
    "Spent 50 on lunch at Papaye",
    "Paid 300 for ECG prepaid power with MoMo",
    "Spent 45 on Bolt ride to Osu",
    "Received 1,200 freelance consulting income",
    "Bought 150 groceries at Melcom Plus",
    "Sent 200 momo upkeep for mom"
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-white border border-ink/10 rounded-sm w-full max-w-xl shadow-2xl overflow-hidden text-ink max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-ink/10 flex items-center justify-between bg-white">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-sm bg-hero-blue/15 text-deep-blue flex items-center justify-center shrink-0">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-ink">Record Transaction</h2>
              <p className="text-[11px] sm:text-xs text-muted-gray">Add spending or income via Voice, AI, or Manual entry</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-sm text-muted-gray hover:text-ink/80 hover:bg-soft-gray transition touch-manipulation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-ink/10 bg-soft-gray/80/50 px-3 sm:px-6 pt-2 overflow-x-auto no-scrollbar gap-1 sm:gap-2">
          <button
            onClick={() => setActiveTab('ai')}
            className={`flex items-center space-x-1.5 pb-2.5 px-2.5 sm:px-3 text-xs font-bold border-b-2 transition whitespace-nowrap touch-manipulation ${
              activeTab === 'ai'
                ? 'border-emerald-600 text-deep-blue'
                : 'border-transparent text-muted-gray hover:text-ink'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span>AI Natural & Voice</span>
            <span className="text-[10px] bg-hero-blue/15 text-deep-blue px-1.5 py-0.2 rounded font-semibold">Fast</span>
          </button>

          <button
            onClick={() => setActiveTab('manual')}
            className={`flex items-center space-x-1.5 pb-2.5 px-2.5 sm:px-3 text-xs font-bold border-b-2 transition whitespace-nowrap touch-manipulation ${
              activeTab === 'manual'
                ? 'border-emerald-600 text-deep-blue'
                : 'border-transparent text-muted-gray hover:text-ink'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5 shrink-0" />
            <span>Quick Manual</span>
          </button>

          <button
            onClick={() => setActiveTab('momo_feed')}
            className={`flex items-center space-x-1.5 pb-2.5 px-2.5 sm:px-3 text-xs font-bold border-b-2 transition whitespace-nowrap touch-manipulation ${
              activeTab === 'momo_feed'
                ? 'border-emerald-600 text-deep-blue'
                : 'border-transparent text-muted-gray hover:text-ink'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5 shrink-0" />
            <span>MoMo Feed ({pendingMoMoAlerts.length})</span>
          </button>
        </div>

        {/* Body content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          
          {/* TAB 1: AI Natural Language & Voice */}
          {activeTab === 'ai' && (
            <div className="space-y-4">
              
              {/* Voice & Text Input Box */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-ink/80">
                    Speak or type what you spent or received:
                  </label>
                  {isListening && (
                    <span className="flex items-center space-x-1 text-[11px] font-bold text-rose-600 animate-pulse">
                      <span className="w-2 h-2 rounded-full bg-rose-600" />
                      <span>Listening...</span>
                    </span>
                  )}
                </div>

                <div className="relative">
                  <textarea
                    id="ai-transaction-input"
                    value={aiPrompt}
                    onChange={(e) => {
                      const newText = e.target.value;
                      setAiPrompt(newText);
                      if (newText.trim()) {
                        // Keep parsed state in sync
                        const local = parseTransactionLocally(newText);
                        setAiParseResult(local);
                      }
                    }}
                    placeholder="e.g. Spent 50 on lunch at Papaye, or Received 1200 freelance consulting..."
                    className={`w-full h-24 px-3.5 py-2.5 bg-soft-gray/80 border ${
                      isListening ? 'border-rose-400 ring-2 ring-rose-200 bg-rose-50/20' : 'border-ink/10'
                    } rounded-sm text-ink placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none font-medium transition`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleAiParse();
                      }
                    }}
                  />

                  {/* Actions bar inside input area */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mt-2">
                    {/* Voice Microphone Trigger */}
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        id="voice-mic-btn"
                        onClick={isListening ? stopListening : startListening}
                        className={`px-3 py-1.5 rounded-sm text-xs font-bold flex items-center space-x-1.5 transition touch-manipulation shadow-xs ${
                          isListening 
                            ? 'bg-rose-600 text-white hover:bg-rose-700 animate-pulse' 
                            : 'bg-hero-blue/10 text-deep-blue hover:bg-hero-blue/15 border border-hero-blue/30'
                        }`}
                        title={isListening ? "Stop listening" : "Click and speak your transaction"}
                      >
                        {isListening ? (
                          <>
                            <MicOff className="w-4 h-4" />
                            <span>Stop Speaking</span>
                          </>
                        ) : (
                          <>
                            <Mic className="w-4 h-4 text-deep-blue" />
                            <span>Speak to Track</span>
                          </>
                        )}
                      </button>

                      {aiPrompt && (
                        <button
                          type="button"
                          onClick={() => {
                            setAiPrompt('');
                            setAiParseResult(null);
                          }}
                          className="text-[11px] text-muted-gray hover:text-ink/80 underline"
                        >
                          Clear
                        </button>
                      )}
                    </div>

                    <button
                      type="button"
                      id="parse-ai-btn"
                      onClick={() => handleAiParse()}
                      disabled={isAiParsing || !aiPrompt.trim()}
                      className="px-4 py-1.5 rounded-sm bg-hero-blue/100 hover:bg-hero-blue disabled:opacity-50 text-slate-950 text-xs font-bold flex items-center space-x-1.5 transition shadow-sm"
                    >
                      {isAiParsing ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>AI Parsing...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Parse with AI</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Speech Error Banner */}
                {speechError && (
                  <div className="mt-2 p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start space-x-2">
                    <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <span>{speechError}</span>
                  </div>
                )}
              </div>

              {/* Quick sample prompt chips */}
              <div>
                <p className="text-[11px] font-semibold text-muted-gray uppercase tracking-wider mb-2">
                  Sample Prompts (Click to select & edit amount):
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {quickPrompts.map((p, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleSelectSample(p)}
                      className={`px-3 py-1.5 rounded-full text-[11px] font-medium border transition ${
                        aiPrompt === p 
                          ? 'bg-hero-blue/100 text-slate-950 border-emerald-600 font-bold shadow-xs' 
                          : 'bg-soft-gray hover:bg-soft-gray text-ink/80 border-ink/10'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* AI Parsed Result Preview Card with Inline Editing */}
              {aiParseResult && (
                <div className="p-4 rounded-sm bg-soft-gray/80 border border-hero-blue/30 shadow-sm space-y-3 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-hero-blue/100 animate-pulse" />
                      <h4 className="text-xs font-bold text-deep-blue uppercase tracking-wider">
                        AI Categorization Preview
                      </h4>
                    </div>
                    <span className="text-[11px] text-muted-gray font-medium">Verify or edit details below:</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    
                    {/* Amount & Type (Directly editable) */}
                    <div className="p-2.5 rounded-lg bg-white border border-ink/10">
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[10px] font-semibold text-muted-gray">Amount & Type</label>
                        <span className="text-[10px] text-deep-blue font-bold flex items-center space-x-0.5">
                          <Edit3 className="w-2.5 h-2.5" />
                          <span>Editable</span>
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          id="parsed-amount-input"
                          type="number"
                          step="0.01"
                          min="0"
                          value={aiParseResult.amount !== undefined ? aiParseResult.amount : ''}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            setAiParseResult(prev => prev ? ({ ...prev, amount: isNaN(val) ? 0 : val }) : null);
                          }}
                          className="w-28 font-extrabold text-base text-ink bg-soft-gray/80 border border-ink/10 rounded px-2 py-1 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          placeholder="0.00"
                        />
                        <select
                          value={aiParseResult.type || 'expense'}
                          onChange={(e) => {
                            setAiParseResult(prev => prev ? ({ ...prev, type: e.target.value as any }) : null);
                          }}
                          className={`text-xs font-bold px-2 py-1 rounded border border-ink/10 focus:outline-none ${
                            aiParseResult.type === 'income' 
                              ? 'bg-hero-blue/15 text-deep-blue' 
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          <option value="expense">Expense</option>
                          <option value="income">Income</option>
                          <option value="transfer">Savings Vault</option>
                        </select>
                      </div>
                    </div>

                    {/* Assigned Category (Directly editable dropdown) */}
                    <div className="p-2.5 rounded-lg bg-white border border-ink/10">
                      <label className="text-[10px] font-semibold text-muted-gray block mb-1">Category</label>
                      <select
                        value={aiParseResult.category || 'Food & Dining'}
                        onChange={(e) => {
                          setAiParseResult(prev => prev ? ({ ...prev, category: e.target.value as ExpenseCategory }) : null);
                        }}
                        className="w-full font-bold text-xs text-deep-blue bg-soft-gray/80 border border-ink/10 rounded px-2 py-1.5 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      >
                        {ALL_CATEGORIES.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    {/* Description */}
                    <div className="p-2.5 rounded-lg bg-white border border-ink/10">
                      <label className="text-[10px] font-semibold text-muted-gray block mb-1">Description</label>
                      <input
                        type="text"
                        value={aiParseResult.description || ''}
                        onChange={(e) => {
                          setAiParseResult(prev => prev ? ({ ...prev, description: e.target.value }) : null);
                        }}
                        className="w-full text-xs font-medium text-ink bg-soft-gray/80 border border-ink/10 rounded px-2 py-1 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        placeholder="Description"
                      />
                    </div>

                    {/* Payment Channel */}
                    <div className="p-2.5 rounded-lg bg-white border border-ink/10">
                      <label className="text-[10px] font-semibold text-muted-gray block mb-1">Payment Method</label>
                      <select
                        value={aiParseResult.paymentMethod || 'MTN MoMo'}
                        onChange={(e) => {
                          setAiParseResult(prev => prev ? ({ ...prev, paymentMethod: e.target.value as PaymentMethod }) : null);
                        }}
                        className="w-full text-xs font-medium text-ink bg-soft-gray/80 border border-ink/10 rounded px-2 py-1 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      >
                        <option value="MTN MoMo">MTN MoMo</option>
                        <option value="Telecel Cash">Telecel Cash</option>
                        <option value="AT Money">AT Money</option>
                        <option value="Bank Account">Bank Account</option>
                        <option value="Debit Card">Debit Card</option>
                        <option value="Cash Wallet">Cash Wallet</option>
                      </select>
                    </div>
                  </div>

                  {aiParseResult.notes && (
                    <p className="text-[11px] text-muted-gray italic">
                      💡 {aiParseResult.notes}
                    </p>
                  )}

                  {aiError && (
                    <p className="text-xs text-rose-600 font-semibold">
                      {aiError}
                    </p>
                  )}

                  <button
                    type="button"
                    id="confirm-ai-tx-btn"
                    onClick={confirmAiTransaction}
                    className="w-full py-2.5 rounded-sm bg-hero-blue/100 hover:bg-hero-blue text-slate-950 font-bold text-sm shadow-sm flex items-center justify-center space-x-1.5 transition active:scale-98"
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Confirm & Save ({Number(aiParseResult.amount || 0).toLocaleString()})</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Quick Manual Entry */}
          {activeTab === 'manual' && (
            <form onSubmit={handleManualSubmit} className="space-y-4">
              
              {/* Type Switcher */}
              <div className="grid grid-cols-3 gap-2 p-1 bg-soft-gray rounded-sm border border-ink/10">
                <button
                  type="button"
                  onClick={() => setType('expense')}
                  className={`py-1.5 text-xs font-bold rounded-lg transition ${
                    type === 'expense'
                      ? 'bg-rose-500 text-white shadow-xs'
                      : 'text-muted-gray hover:text-ink'
                  }`}
                >
                  Expense
                </button>
                <button
                  type="button"
                  onClick={() => setType('income')}
                  className={`py-1.5 text-xs font-bold rounded-lg transition ${
                    type === 'income'
                      ? 'bg-hero-blue/100 text-slate-950 shadow-xs'
                      : 'text-muted-gray hover:text-ink'
                  }`}
                >
                  Income
                </button>
                <button
                  type="button"
                  onClick={() => setType('transfer')}
                  className={`py-1.5 text-xs font-bold rounded-lg transition ${
                    type === 'transfer'
                      ? 'bg-teal-500 text-slate-950 shadow-xs'
                      : 'text-muted-gray hover:text-ink'
                  }`}
                >
                  Savings Vault
                </button>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-xs font-semibold text-ink/80 mb-1">
                  Amount {currency ? `(${currency})` : ''} *
                </label>
                <div className="relative">
                  {currency && (
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-gray font-bold text-sm">
                      {currency}
                    </span>
                  )}
                  <input
                    id="manual-amount-input"
                    type="number"
                    step="0.01"
                    min="0.1"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className={`w-full ${currency ? 'pl-12' : 'pl-4'} pr-4 py-2 bg-soft-gray/80 border border-ink/10 rounded-sm text-lg font-bold text-ink focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                  />
                </div>
              </div>

              {/* Category Grid */}
              <div>
                <label className="block text-xs font-semibold text-ink/80 mb-1.5">
                  Category *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-36 overflow-y-auto p-1 bg-soft-gray/80 rounded-sm border border-ink/10">
                  {ALL_CATEGORIES.map((cat) => {
                    const isSelected = category === cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCategory(cat)}
                        className={`text-left px-2.5 py-1.5 rounded-lg text-xs font-medium truncate transition ${
                          isSelected
                            ? 'bg-hero-blue/100 text-slate-950 font-bold shadow-xs'
                            : 'bg-white text-ink/80 hover:bg-soft-gray border border-ink/10'
                        }`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Description & Merchant */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-ink/80 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g. Lunch at Papaye, Bolt to Osu"
                    className="w-full px-3 py-2 bg-soft-gray/80 border border-ink/10 rounded-sm text-xs text-ink focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink/80 mb-1">
                    Merchant / Provider (Optional)
                  </label>
                  <input
                    type="text"
                    value={merchant}
                    onChange={(e) => setMerchant(e.target.value)}
                    placeholder="e.g. Melcom, Papaye, ECG"
                    className="w-full px-3 py-2 bg-soft-gray/80 border border-ink/10 rounded-sm text-xs text-ink focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                  />
                </div>
              </div>

              {/* Payment Method & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-ink/80 mb-1">
                    Account / Channel
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full px-3 py-2 bg-soft-gray/80 border border-ink/10 rounded-sm text-xs text-ink focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                  >
                    <option value="MTN MoMo">MTN MoMo</option>
                    <option value="Telecel Cash">Telecel Cash</option>
                    <option value="AT Money">AT Money</option>
                    <option value="Bank Account">Stanbic Bank / Bank</option>
                    <option value="Debit Card">Debit Card (Visa/Mastercard)</option>
                    <option value="Cash Wallet">Cash Wallet</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink/80 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 bg-soft-gray/80 border border-ink/10 rounded-sm text-xs text-ink focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-sm bg-hero-blue/100 hover:bg-hero-blue text-slate-950 font-bold text-sm shadow-sm transition active:scale-98"
              >
                Save Transaction (Under 5s)
              </button>
            </form>
          )}

          {/* TAB 3: MoMo / Bank Live Import Feed */}
          {activeTab === 'momo_feed' && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-sm bg-hero-blue/10 border border-hero-blue/25 flex items-start space-x-2.5">
                <Smartphone className="w-5 h-5 text-deep-blue shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-bold text-deep-blue">Connected Wallet Sync Active</p>
                  <p className="text-muted-gray">
                    MoneyPilot automatically scans incoming SMS / API alerts from MTN MoMo and bank accounts and auto-categorizes them for one-tap import.
                  </p>
                </div>
              </div>

              {pendingMoMoAlerts.length === 0 ? (
                <div className="text-center py-8 bg-soft-gray/80 rounded-sm border border-ink/10">
                  <Check className="w-8 h-8 text-deep-blue mx-auto mb-2" />
                  <p className="text-xs font-bold text-ink">All Mobile Money alerts imported!</p>
                  <p className="text-[11px] text-muted-gray mt-1">
                    New transactions from MTN MoMo or Telecel will appear here automatically.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  <p className="text-[11px] font-bold text-muted-gray uppercase tracking-wider">
                    Unimported Transactions ({pendingMoMoAlerts.length}):
                  </p>
                  
                  {pendingMoMoAlerts.map((alert) => (
                    <div 
                      key={alert.id}
                      className="p-3.5 rounded-sm bg-white border border-ink/10 hover:border-slate-300 shadow-sm transition flex items-center justify-between"
                    >
                      <div className="space-y-1 max-w-[70%]">
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            {alert.sender}
                          </span>
                          <span className="text-[10px] text-muted-gray">{alert.time}</span>
                        </div>
                        <p className="text-xs font-semibold text-ink truncate">
                          {alert.description}
                        </p>
                        <p className="text-[11px] text-muted-gray">
                          Auto-category: <span className="text-deep-blue font-semibold">{alert.category}</span>
                        </p>
                      </div>

                      <div className="text-right space-y-1.5">
                        <p className="text-sm font-black text-ink">
                          {currency}{alert.amount.toFixed(2)}
                        </p>
                        <button
                          onClick={() => handleImportMoMoAlert(alert)}
                          className="px-3 py-1 rounded-lg bg-hero-blue/100 hover:bg-hero-blue text-slate-950 font-bold text-xs flex items-center space-x-1 shadow-sm transition"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Import</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
