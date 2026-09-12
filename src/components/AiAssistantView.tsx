import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Sparkles, 
  Send, 
  RefreshCw, 
  MessageSquare, 
  HelpCircle, 
  ArrowRight, 
  Check, 
  AlertTriangle, 
  TrendingUp, 
  Loader2, 
  DollarSign,
  ChevronDown,
  Layers,
  Lightbulb
} from 'lucide-react';
import { 
  FinancialInsight, 
  ChatMessage, 
  UserProfile, 
  Transaction, 
  Budget, 
  SavingsGoal, 
  DebtItem,
  FinancialHealthScore 
} from '../types';
import { calculateSummary } from '../utils/finance';

interface AiAssistantViewProps {
  profile: UserProfile;
  transactions: Transaction[];
  budgets: Budget[];
  goals: SavingsGoal[];
  debts: DebtItem[];
  insights: FinancialInsight[];
  healthScore: FinancialHealthScore;
  onRefreshInsights: () => Promise<void>;
  isRefreshingInsights: boolean;
}

export const AiAssistantView: React.FC<AiAssistantViewProps> = ({
  profile,
  transactions,
  budgets,
  goals,
  debts,
  insights,
  healthScore,
  onRefreshInsights,
  isRefreshingInsights
}) => {
  const [activeTab, setActiveTab] = useState<'insights' | 'chat'>('insights');
  const [expandedInsightId, setExpandedInsightId] = useState<string | null>(null);

  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'ai',
      text: `Hello ${profile.name.split(' ')[0]}! I'm your MoneyPilot AI financial advisor. I'm actively tracking your **${profile.currency}${profile.monthlyIncome.toLocaleString()}** monthly income across Mobile Money and bank accounts.\n\nAsk me anything about your spending patterns, goal timelines, or what adjustments to make next!`,
      timestamp: 'Just now',
      suggestedPrompts: [
        "Why am I always broke before payday?",
        "Can I afford a 1,500 phone?",
        "How much did I spend on food this month?",
        "How do I clear my debt faster?"
      ]
    }
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isAiReplying, setIsAiReplying] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeTab === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeTab]);

  const currency = profile.currency || '';
  const summary = calculateSummary(transactions, profile.monthlyIncome);

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputPrompt;
    if (!query.trim() || isAiReplying) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query.trim(),
      timestamp: 'Just now'
    };

    setMessages(prev => [...prev, userMsg]);
    setInputPrompt('');
    setIsAiReplying(true);

    try {
      const financialContext = {
        monthlyIncome: profile.monthlyIncome,
        totalExpenses: summary.totalExpenses,
        totalSavings: summary.totalSavings,
        remaining: summary.remaining,
        currency,
        healthScore: healthScore.score,
        goals: goals.map(g => ({ name: g.name, target: g.targetAmount, current: g.currentAmount })),
        debts: debts.map(d => ({ lender: d.lender, balance: d.currentBalance, rate: d.interestRate })),
        budgets: budgets.map(b => ({ category: b.category, limit: b.monthlyLimit })),
        topCategories: summary.spendingList.slice(0, 4)
      };

      const historyPayload = messages.slice(-6).map(m => ({
        role: m.sender === 'user' ? 'user' : 'model',
        text: m.text
      }));

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          history: historyPayload,
          financialContext
        })
      });

      const data = await res.json();
      if (data.success && data.reply) {
        const aiMsg: ChatMessage = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: data.reply,
          timestamp: 'Just now',
          actionableSuggestion: data.actionableSuggestion,
          financialBreakdown: data.financialBreakdown,
          suggestedPrompts: data.suggestedPrompts || [
            "What can I cut from my spending?",
            "How long to reach my laptop goal?",
            "How much money do I have left for the month?"
          ]
        };
        setMessages(prev => [...prev, aiMsg]);
      } else {
        throw new Error(data.error || 'No response from AI');
      }
    } catch (err: any) {
      console.warn('AI chat error, using local advisor fallback:', err);
      // Fallback local intelligent generator
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: `Based on your August ledger, your total spending is **${currency}${summary.totalExpenses.toLocaleString()}** against **${currency}${summary.effectiveIncome.toLocaleString()}** income. You have **${currency}${summary.remaining.toLocaleString()}** left before payday. Your highest expense category is **${summary.spendingList[0]?.category || 'Food & Dining'}** (${summary.spendingList[0]?.amount ? `${currency}${summary.spendingList[0].amount}` : ''}).\n\nCutting dining out by 150 would give you extra cushion for your emergency fund.`,
        timestamp: 'Just now',
        suggestedPrompts: [
          "Can I afford a 1,500 phone?",
          "Why did my expenses increase?",
          "How much should I save this month?"
        ]
      };
      setMessages(prev => [...prev, aiMsg]);
    } finally {
      setIsAiReplying(false);
    }
  };

  const sampleQuestions = [
    "How much can I safely spend per day?",
    "Can I afford a 1,500 phone?",
    "Why am I always broke before payday?",
    "What realistic 15% cuts can I make in spending?",
    "How much should I realistically save this month?",
    "How long will it take to reach my goal sustainably?",
    "How do I clear my highest-interest debt faster?",
    "How many months of emergency buffer do I have?"
  ];

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Banner with Tab Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 bg-white p-4 sm:p-5 dash-card">
        <div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-sm bg-hero-blue/15 text-deep-blue flex items-center justify-center shrink-0">
              <Bot className="w-5 h-5" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-ink">
              AI Financial Intelligence
            </h2>
          </div>
          <p className="text-[11px] sm:text-xs text-muted-gray mt-1">
            MoneyPilot doesn't just record transactions. It tells you what to do next with your money.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="grid grid-cols-2 sm:flex sm:items-center gap-1 sm:space-x-2 bg-soft-gray p-1 rounded-sm border border-ink/10">
          <button
            onClick={() => setActiveTab('insights')}
            className={`flex items-center justify-center space-x-1.5 px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition touch-manipulation ${
              activeTab === 'insights'
                ? 'bg-white text-ink shadow-xs'
                : 'text-muted-gray hover:text-ink'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-deep-blue shrink-0" />
            <span className="truncate">Observations ({insights.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center justify-center space-x-1.5 px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition touch-manipulation ${
              activeTab === 'chat'
                ? 'bg-white text-ink shadow-xs'
                : 'text-muted-gray hover:text-ink'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-deep-blue shrink-0" />
            <span className="truncate">AI Advisor</span>
          </button>
        </div>
      </div>

      {/* ===================== TAB 1: PROACTIVE INSIGHTS ===================== */}
      {activeTab === 'insights' && (
        <div className="space-y-4">
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-ink">Personalized Observations & Action Plan</h3>
              <p className="text-xs text-muted-gray">
                Generated from your real spending habits, budget limits, and savings goals.
              </p>
            </div>

            <button
              onClick={onRefreshInsights}
              disabled={isRefreshingInsights}
              className="px-3.5 py-1.5 rounded-sm bg-white hover:bg-soft-gray/80 disabled:opacity-50 text-ink/80 border border-ink/10 text-xs font-semibold flex items-center space-x-1.5 transition shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-deep-blue ${isRefreshingInsights ? 'animate-spin' : ''}`} />
              <span>{isRefreshingInsights ? 'Analyzing...' : 'Refresh AI Analysis'}</span>
            </button>
          </div>

          <div className="space-y-3">
            {insights.map((ins, idx) => {
              const isWarning = ins.impactType === 'warning' || ins.impactType === 'alert';
              const isOpportunity = ins.impactType === 'opportunity';
              const insightKey = ins.id || `insight-item-${idx}-${(ins.title || '').slice(0, 15)}`;

              return (
                <div 
                  key={insightKey}
                  className="p-5 dash-card bg-white hover:border-slate-300 shadow-sm transition space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className={`w-2 h-2 rounded-full ${isWarning ? 'bg-amber-500' : isOpportunity ? 'bg-teal-500' : 'bg-hero-blue/100'}`} />
                        <span className="text-[11px] font-bold text-muted-gray uppercase tracking-wider">
                          {ins.categoryTag}
                        </span>
                        {ins.metricHighlight && (
                          <span className="px-2 py-0.2 rounded text-[10px] font-bold bg-soft-gray text-deep-blue border border-ink/10">
                            {ins.metricHighlight}
                          </span>
                        )}
                      </div>
                      <h4 className="text-base font-bold text-ink">
                        {ins.title}
                      </h4>
                    </div>

                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full capitalize ${
                      isWarning ? 'bg-amber-50 text-amber-800 border border-amber-200' : isOpportunity ? 'bg-teal-50 text-teal-800 border border-teal-200' : 'bg-hero-blue/10 text-deep-blue border border-hero-blue/25'
                    }`}>
                      {ins.impactType}
                    </span>
                  </div>

                  <p className="text-xs text-muted-gray leading-relaxed">
                    {ins.observation}
                  </p>

                  {/* "Why" Explanation Box */}
                  <div className="p-3.5 rounded-sm bg-soft-gray/80 border border-ink/10 text-xs text-ink/80 space-y-1">
                    <p className="font-bold text-deep-blue flex items-center space-x-1.5">
                      <Lightbulb className="w-3.5 h-3.5" />
                      <span>Why this observation matters:</span>
                    </p>
                    <p className="text-[11px] text-muted-gray leading-relaxed pl-5">
                      {ins.whyExplanation}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-ink/8 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div className="flex items-center space-x-1.5 text-deep-blue font-semibold">
                      <Check className="w-4 h-4 text-deep-blue shrink-0" />
                      <span>Action Step: {ins.actionableStep}</span>
                    </div>

                    <button
                      onClick={() => {
                        setActiveTab('chat');
                        handleSendMessage(`Tell me more about this recommendation: "${ins.title}". How can I implement this in my budget?`);
                      }}
                      className="text-xs text-deep-blue hover:text-deep-blue hover:underline flex items-center space-x-1 font-bold self-start sm:self-auto"
                    >
                      <span>Ask AI to build a plan</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* ===================== TAB 2: INTERACTIVE AI FINANCIAL CHAT ===================== */}
      {activeTab === 'chat' && (
        <div className="space-y-4">
          
          {/* Preset Questions Slider */}
          <div className="p-4 dash-card bg-white shadow-sm space-y-2">
            <p className="text-[11px] font-bold text-muted-gray uppercase tracking-wider flex items-center space-x-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-deep-blue" />
              <span>Recommended Questions for your Wallet:</span>
            </p>
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {sampleQuestions.map((q, i) => (
                <button
                  key={`sample-q-${i}-${q.slice(0, 10)}`}
                  onClick={() => handleSendMessage(q)}
                  className="px-3 py-1.5 rounded-sm bg-soft-gray/80 hover:bg-soft-gray text-ink/80 text-xs whitespace-nowrap border border-ink/10 transition font-medium"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Chat Messages Stream */}
          <div className="h-[480px] bg-soft-gray/80 border border-ink/10 rounded-sm p-4 overflow-y-auto space-y-4">
            {messages.map((msg, msgIdx) => {
              const isUser = msg.sender === 'user';
              const messageKey = msg.id || `chat-msg-${msgIdx}-${msg.timestamp}`;

              return (
                <div 
                  key={messageKey}
                  className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] sm:max-w-[75%] rounded-sm p-4 space-y-2.5 text-xs shadow-sm ${
                    isUser
                      ? 'bg-hero-blue/100 text-slate-950 font-medium rounded-tr-none'
                      : 'bg-white text-ink border border-ink/10 rounded-tl-none'
                  }`}>
                    <div className="flex items-center justify-between text-[10px] opacity-75">
                      <span className="font-bold uppercase tracking-wider">
                        {isUser ? 'You' : 'MoneyPilot AI'}
                      </span>
                      <span>{msg.timestamp}</span>
                    </div>

                    <div className="leading-relaxed whitespace-pre-line text-xs sm:text-[13px]">
                      {msg.text}
                    </div>

                    {/* Financial Breakdown Metric Card */}
                    {msg.financialBreakdown && msg.financialBreakdown.length > 0 && (
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-ink/8">
                        {msg.financialBreakdown.map((item, idx) => (
                          <div key={`fb-${idx}-${item.label}`} className="p-2 rounded-lg bg-soft-gray/80 border border-ink/10">
                            <p className="text-[10px] text-muted-gray truncate">{item.label}</p>
                            <p className="text-xs font-extrabold text-deep-blue">{item.value}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Suggested follow up prompts */}
                    {msg.suggestedPrompts && msg.suggestedPrompts.length > 0 && (
                      <div className="pt-2 border-t border-ink/8 space-y-1.5">
                        <p className="text-[10px] font-bold text-muted-gray uppercase">Suggested next question:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {msg.suggestedPrompts.map((p, idx) => (
                            <button
                              key={`sp-${idx}-${p.slice(0, 10)}`}
                              onClick={() => handleSendMessage(p)}
                              className="text-[11px] text-left px-2.5 py-1 rounded-lg bg-hero-blue/10 hover:bg-hero-blue/15 text-deep-blue border border-hero-blue/25 transition font-medium"
                            >
                              💬 {p}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {isAiReplying && (
              <div className="flex justify-start">
                <div className="bg-white border border-ink/10 rounded-sm rounded-tl-none p-4 text-xs text-muted-gray flex items-center space-x-2 shadow-sm">
                  <Loader2 className="w-4 h-4 animate-spin text-deep-blue" />
                  <span>MoneyPilot is analyzing your finances...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Field */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center space-x-2"
          >
            <input
              id="ai-chat-input"
              type="text"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              placeholder="Ask about your budget, debts, Papaye spending, or laptop goal..."
              className="flex-1 px-4 py-3 bg-white border border-ink/10 rounded-sm text-xs text-ink placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
            />

            <button
              type="submit"
              disabled={isAiReplying || !inputPrompt.trim()}
              className="px-5 py-3 rounded-sm bg-hero-blue/100 hover:bg-hero-blue disabled:opacity-50 text-slate-950 text-xs font-bold flex items-center space-x-1.5 shadow-sm transition"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

        </div>
      )}

    </div>
  );
};
