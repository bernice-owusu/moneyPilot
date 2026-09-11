import React from 'react';
import { 
  X, 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  ShieldCheck, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { FinancialHealthScore } from '../types';

interface HealthScoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  healthScore: FinancialHealthScore;
  currency: string;
}

export const HealthScoreModal: React.FC<HealthScoreModalProps> = ({
  isOpen,
  onClose,
  healthScore,
  currency
}) => {
  if (!isOpen) return null;

  const pillars = [
    {
      name: 'Savings Rate & Discipline',
      score: healthScore.metrics.savingsRateScore,
      max: 25,
      description: 'Percentage of income allocated to wealth accumulation.',
      benchmark: 'Target: 20%+ savings rate'
    },
    {
      name: 'Expense Control & Budget Adherence',
      score: healthScore.metrics.budgetAdherenceScore,
      max: 25,
      description: 'Keeping total monthly expenses well below gross earnings.',
      benchmark: 'Target: < 70% burn rate'
    },
    {
      name: 'Debt-to-Income & Leverage Risk',
      score: healthScore.metrics.debtToIncomeScore,
      max: 20,
      description: 'Monthly loan repayments relative to net earnings.',
      benchmark: 'Target: < 20% DTI ratio'
    },
    {
      name: 'Emergency Buffer Cushion',
      score: healthScore.metrics.emergencyBufferScore,
      max: 20,
      description: 'Liquid cash reserves available for unexpected emergencies.',
      benchmark: 'Target: 3-6 months living expenses'
    },
    {
      name: 'Goal Momentum & Spending Consistency',
      score: healthScore.metrics.spendingConsistencyScore,
      max: 10,
      description: 'Consistent funding of active savings targets and stable buffer.',
      benchmark: 'Target: Active on-pace contributions'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div 
        className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden text-slate-900 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-200 flex items-center justify-between bg-white">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900">Financial Health Score</h2>
              <p className="text-[11px] sm:text-xs text-slate-500">Holistic 5-Pillar Assessment</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition touch-manipulation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-5 flex-1">
          
          {/* Main Score Dial */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between shadow-xs">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Overall Financial Wellness
              </span>
              <div className="flex items-baseline space-x-2 mt-1">
                <span className="text-4xl font-black text-slate-900">{healthScore.score}</span>
                <span className="text-sm font-semibold text-slate-400">/ 100</span>
              </div>
              <p className="text-xs text-emerald-700 font-bold mt-1">
                {healthScore.rating} • Stronger than 68% of peers
              </p>
            </div>

            <div className="w-20 h-20 rounded-full border-4 border-emerald-100 flex items-center justify-center relative">
              <div 
                className="w-16 h-16 rounded-full border-4 border-emerald-500 flex items-center justify-center font-black text-lg text-slate-900"
              >
                {healthScore.score}
              </div>
            </div>
          </div>

          {/* 5 Pillars Breakdown */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Score Breakdown Across 5 Pillars:
            </h3>

            {pillars.map((p, idx) => {
              const percent = (p.score / p.max) * 100;
              return (
                <div key={idx} className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1.5 shadow-xs">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900">{p.name}</span>
                    <span className="font-extrabold text-emerald-700">
                      {p.score} <span className="text-slate-400 font-normal">/ {p.max} pts</span>
                    </span>
                  </div>

                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                    <div 
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span>{p.description}</span>
                    <span className="text-slate-700 font-semibold">{p.benchmark}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Strengths & Improvements */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1.5 text-xs">
              <div className="flex items-center space-x-1.5 text-emerald-800 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Financial Strengths</span>
              </div>
              <ul className="space-y-1 text-[11px] text-slate-700">
                {healthScore.strengths.map((s, i) => (
                  <li key={i} className="flex items-start space-x-1">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 space-y-1.5 text-xs">
              <div className="flex items-center space-x-1.5 text-amber-800 font-bold">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Areas to Improve</span>
              </div>
              <ul className="space-y-1 text-[11px] text-slate-700">
                {healthScore.improvements.map((imp, i) => (
                  <li key={i} className="flex items-start space-x-1">
                    <span className="text-amber-600 font-bold">•</span>
                    <span>{imp}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold transition shadow-sm"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
