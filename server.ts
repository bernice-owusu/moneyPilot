import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

function generateFallbackInsights(
  transactions: any[] = [],
  monthlyIncome: number = 6000,
  budgets: any[] = [],
  goals: any[] = [],
  debts: any[] = [],
  currency: string = ""
) {
  const insights: any[] = [];
  const now = new Date().toISOString();
  const today = new Date();
  const currentDay = today.getDate();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const daysRemaining = Math.max(1, daysInMonth - currentDay);

  // 1. Calculate spending breakdown
  let totalExpenses = 0;
  let totalSavings = 0;
  const categoryTotals: Record<string, number> = {};
  transactions.forEach((tx) => {
    const amt = Number(tx.amount || 0);
    if (tx.type === "expense") {
      totalExpenses += amt;
      const cat = tx.category || "Other";
      categoryTotals[cat] = (categoryTotals[cat] || 0) + amt;
    } else if (tx.type === "transfer" || tx.category === "Savings & Investment") {
      totalSavings += amt;
    }
  });

  const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
  const topCat = sortedCategories[0];
  const remaining = monthlyIncome - totalExpenses - totalSavings;
  const dailySafeSpend = Math.max(0, Math.round(remaining / daysRemaining));
  const burnRate = monthlyIncome > 0 ? (totalExpenses / monthlyIncome) * 100 : 0;

  // 1. Realistic Daily Cash Flow Pacing
  insights.push({
    id: `ins-fallback-pacing-${Date.now()}-1`,
    title: remaining > 0 ? `Safe Daily Pace: ${currency}${dailySafeSpend}/day for ${daysRemaining} days` : `Cash Deficit Warning`,
    observation: remaining > 0 
      ? `You have ${currency}${remaining.toLocaleString()} uncommitted across the remaining ${daysRemaining} days before payday.`
      : `Current expenses and allocations exceed this month's income by ${currency}${Math.abs(remaining).toLocaleString()}.`,
    whyExplanation: `Real-life budgeting fails when spent in lumps early in the month. Knowing your exact daily threshold (${currency}${dailySafeSpend}/day) prevents unintentional end-of-month cash pinches without requiring rigid austerity.`,
    actionableStep: remaining > 0 
      ? `Keep discretionary spending (dining, rides, outings) under ${currency}${dailySafeSpend}/day to reach payday with surplus.`
      : `Pause discretionary purchases for the next 7 days to stabilize your cash balance.`,
    categoryTag: "Cash Flow",
    impactType: remaining > 0 ? "positive" : "alert",
    metricHighlight: `${currency}${dailySafeSpend}/day`,
    timestamp: now
  });

  // 2. Realistic Top Category Optimization (Pragmatic 10-15% tweak, not 100% elimination)
  if (topCat && topCat[1] > 0) {
    const pct = totalExpenses > 0 ? Math.round((topCat[1] / totalExpenses) * 100) : 0;
    const realisticSavingsTarget = Math.round(topCat[1] * 0.15);
    insights.push({
      id: `ins-fallback-topcat-${Date.now()}-2`,
      title: `${topCat[0]}: 15% optimization frees ${currency}${realisticSavingsTarget}/mo`,
      observation: `You've spent ${currency}${topCat[1].toLocaleString()} (${pct}% of all spending) on ${topCat[0]}.`,
      whyExplanation: `Extreme cuts rarely last. A realistic 15% trim (e.g. swapping 2 taxi trips for shared transit or preparing lunch twice weekly) frees ${currency}${realisticSavingsTarget} without hurting your lifestyle.`,
      actionableStep: `Target a monthly cap of ${currency}${Math.round(topCat[1] - realisticSavingsTarget).toLocaleString()} for ${topCat[0]}.`,
      categoryTag: topCat[0],
      impactType: pct > 30 ? "warning" : "opportunity",
      metricHighlight: `Save ${currency}${realisticSavingsTarget}/mo`,
      timestamp: now
    });
  }

  // 3. Realistic Emergency Cushion Assessment
  const essentialBurn = (categoryTotals['Housing & Rent'] || 0) + (categoryTotals['Utilities'] || 0) + (categoryTotals['Food & Dining'] || 0);
  const estimatedMonthlyEssentials = essentialBurn > 0 ? Math.max(essentialBurn, monthlyIncome * 0.45) : monthlyIncome * 0.5;
  const currentEmergencySavings = goals.find(g => g.name.toLowerCase().includes('emergency') || g.name.toLowerCase().includes('vault'))?.currentAmount || totalSavings;
  const monthsOfBuffer = estimatedMonthlyEssentials > 0 ? (currentEmergencySavings / estimatedMonthlyEssentials).toFixed(1) : "0";

  insights.push({
    id: `ins-fallback-emergency-${Date.now()}-3`,
    title: `Emergency Buffer: ${monthsOfBuffer} months of essential expenses`,
    observation: `Your liquid safety reserve is ~${currency}${currentEmergencySavings.toLocaleString()} against essential baseline costs of ~${currency}${Math.round(estimatedMonthlyEssentials).toLocaleString()}/month.`,
    whyExplanation: `In real financial planning, unexpected medical bills, car repairs, or family emergencies occur 2-3 times per year. Having at least 1 month of true living expenses prevents high-interest borrowing.`,
    actionableStep: Number(monthsOfBuffer) < 1 
      ? `Prioritize routing ${currency}${Math.min(300, Math.round(monthlyIncome * 0.08))}/month into your Emergency Vault before funding luxury goals.`
      : `Maintain this buffer while focusing extra cash on high-yield savings or debt reduction.`,
    categoryTag: "Safety Vault",
    impactType: Number(monthsOfBuffer) < 1 ? "warning" : "positive",
    metricHighlight: `${monthsOfBuffer} mo buffer`,
    timestamp: now
  });

  // 4. Realistic Debt Avalanche Plan
  if (debts && debts.length > 0) {
    const highestDebt = [...debts].sort((a, b) => (b.interestRate || 0) - (a.interestRate || 0))[0];
    const totalDebt = debts.reduce((sum, d) => sum + Number(d.currentBalance || 0), 0);
    insights.push({
      id: `ins-fallback-debt-${Date.now()}-4`,
      title: `Debt Strategy: Attack ${highestDebt.lender} (${highestDebt.interestRate}% APR)`,
      observation: `Total balance is ${currency}${totalDebt.toLocaleString()}. ${highestDebt.lender} carries the highest finance charge.`,
      whyExplanation: `Paying minimums on all loans while adding just ${currency}100-${currency}150 extra towards ${highestDebt.lender} accelerates total payoff by months and saves real interest fees.`,
      actionableStep: `Automate minimum payments on all accounts, and put an extra ${currency}100 towards ${highestDebt.lender} on payday.`,
      categoryTag: "Debt Repayment",
      impactType: "opportunity",
      metricHighlight: `${highestDebt.interestRate}% interest`,
      timestamp: now
    });
  }

  // 5. Realistic Goal Timeline
  if (goals && goals.length > 0) {
    const primaryGoal = goals[0];
    const remainingToTarget = Math.max(0, primaryGoal.targetAmount - primaryGoal.currentAmount);
    const realisticMonthlyContribution = Math.max(100, Math.round(monthlyIncome * 0.15));
    const realisticMonths = Math.ceil(remainingToTarget / Math.max(1, realisticMonthlyContribution));

    insights.push({
      id: `ins-fallback-goal-${Date.now()}-5`,
      title: `Realistic Roadmap for "${primaryGoal.name}": ~${realisticMonths} months`,
      observation: `${currency}${remainingToTarget.toLocaleString()} left to target. At a sustainable ${currency}${realisticMonthlyContribution}/month pace, you will reach this without cash flow stress.`,
      whyExplanation: `Setting an aggressive target that requires 50% of your income leads to goal fatigue and abandonment. Steady, automated monthly transfers ensure completion.`,
      actionableStep: `Set an automated transfer of ${currency}${realisticMonthlyContribution} on the 1st of every month.`,
      categoryTag: "Savings Goal",
      impactType: "positive",
      metricHighlight: `~${realisticMonths} months`,
      timestamp: now
    });
  }

  return insights;
}

function parseFallbackTransaction(input: string) {
  const text = input.trim();
  const lower = text.toLowerCase();

  let amount = 50;
  const amountMatch = text.match(/(?:gh[¢c]?|gbs|g|rs|\$|usd|eur|gbp|kes|ngn)?\s*(\d+(?:,\d{3})*(?:\.\d{1,2})?)/i);
  if (amountMatch) {
    amount = parseFloat(amountMatch[1].replace(/,/g, ''));
  }

  let type: 'expense' | 'income' | 'transfer' = 'expense';
  if (lower.includes('salary') || lower.includes('received') || lower.includes('earned') || lower.includes('got paid') || lower.includes('income') || lower.includes('deposit')) {
    type = 'income';
  } else if (lower.includes('saved') || lower.includes('transfer to vault') || lower.includes('invested')) {
    type = 'transfer';
  }

  let category = 'Other';
  let paymentMethod = 'MTN MoMo';

  if (lower.includes('momo') || lower.includes('mtn')) paymentMethod = 'MTN MoMo';
  else if (lower.includes('telecel') || lower.includes('vodafone')) paymentMethod = 'Telecel Cash';
  else if (lower.includes('card') || lower.includes('pos')) paymentMethod = 'Debit Card';
  else if (lower.includes('bank') || lower.includes('transfer') || lower.includes('stanbic') || lower.includes('gcb')) paymentMethod = 'Bank Account';
  else if (lower.includes('cash')) paymentMethod = 'Cash Wallet';

  if (lower.includes('lunch') || lower.includes('dinner') || lower.includes('breakfast') || lower.includes('food') || lower.includes('papaye') || lower.includes('kfc') || lower.includes('buka') || lower.includes('chop bar') || lower.includes('restaurant') || lower.includes('coffee') || lower.includes('burger') || lower.includes('pizza') || lower.includes('waakye') || lower.includes('jollof')) {
    category = 'Food & Dining';
  } else if (lower.includes('bolt') || lower.includes('uber') || lower.includes('yango') || lower.includes('trotro') || lower.includes('fuel') || lower.includes('petrol') || lower.includes('diesel') || lower.includes('total') || lower.includes('shell') || lower.includes('goil') || lower.includes('transport') || lower.includes('taxi')) {
    category = 'Transport & Fuel';
  } else if (lower.includes('ecg') || lower.includes('electricity') || lower.includes('light bill') || lower.includes('water') || lower.includes('gwcl') || lower.includes('utilities') || lower.includes('trash') || lower.includes('zoomlion')) {
    category = 'Utilities';
  } else if (lower.includes('airtime') || lower.includes('data') || lower.includes('bundle') || lower.includes('fibre') || lower.includes('internet') || lower.includes('wifi')) {
    category = 'Airtime & Data';
  } else if (lower.includes('melcom') || lower.includes('groceries') || lower.includes('supermarket') || lower.includes('shoprite') || lower.includes('palace') || lower.includes('clothes') || lower.includes('shoes') || lower.includes('shopping')) {
    category = 'Shopping & Goods';
  } else if (lower.includes('cinema') || lower.includes('movie') || lower.includes('netflix') || lower.includes('spotify') || lower.includes('drinks') || lower.includes('party') || lower.includes('club') || lower.includes('outing')) {
    category = 'Entertainment & Leisure';
  } else if (lower.includes('rent') || lower.includes('landlord') || lower.includes('apartment') || lower.includes('service charge')) {
    category = 'Housing & Rent';
  }

  return {
    amount,
    type,
    category,
    description: input,
    merchant: category,
    paymentMethod,
    confidenceNote: 'Parsed with intelligent pattern matching'
  };
}

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function generateFallbackChatReply(message: string, financialContext: any = {}) {
  const currency = financialContext.currency || "";
  const monthlyIncome = financialContext.monthlyIncome || 6000;
  const totalExpenses = financialContext.totalExpenses || 0;
  const totalSavings = financialContext.totalSavings || 0;
  const remaining = financialContext.remaining ?? (monthlyIncome - totalExpenses - totalSavings);
  const topCatObj = financialContext.topCategories?.[0];
  const topCatName = topCatObj?.category || "Food & Dining";
  const topCatAmount = topCatObj?.amount ? `${currency}${topCatObj.amount.toLocaleString()}` : "";
  const goals = financialContext.goals || [];
  const debts = financialContext.debts || [];

  const today = new Date();
  const currentDay = today.getDate();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const daysRemaining = Math.max(1, daysInMonth - currentDay);
  const dailySafeSpend = Math.max(0, Math.round(remaining / daysRemaining));

  const lower = (message || "").toLowerCase();

  // 1. Realistic Affordability Query ("Can I afford X?")
  if (lower.includes("afford") || lower.includes("buy") || lower.includes("phone") || lower.includes("purchase") || lower.includes("get")) {
    const amountMatch = message.match(/(?:gh[¢c]?|gbs|\$)?\s*(\d+(?:,\d{3})*(?:\.\d{1,2})?)/i);
    const cost = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, '')) : 1500;
    
    // Realistic safety reserve: keep at least 15% of income or 35/day for basic living expenses until next payday
    const minimumSafetyBuffer = Math.max(300, daysRemaining * 35);
    const safeSurplus = remaining - cost;
    const canAffordSafely = safeSurplus >= minimumSafetyBuffer;
    const canAffordBarely = safeSurplus >= 0 && safeSurplus < minimumSafetyBuffer;

    if (canAffordSafely) {
      return {
        text: `### Realistic Affordability Analysis\n\n- **Target Purchase**: **${currency}${cost.toLocaleString()}**\n- **Current Unspent Cash**: **${currency}${remaining.toLocaleString()}**\n- **Remaining Buffer After Purchase**: **${currency}${safeSurplus.toLocaleString()}** (~${currency}${Math.round(safeSurplus / daysRemaining)}/day for ${daysRemaining} days)\n\n✅ **Yes, you can realistically afford this outright.**\nEven after paying ${currency}${cost.toLocaleString()}, you will still maintain a safe daily spending buffer of **${currency}${Math.round(safeSurplus / daysRemaining)}/day** to comfortably cover fuel, food, and utilities until payday.`,
        financialBreakdown: [
          { label: "Purchase Cost", value: `${currency}${cost.toLocaleString()}` },
          { label: "Remaining Balance", value: `${currency}${safeSurplus.toLocaleString()}` },
          { label: "Daily Cushion", value: `${currency}${Math.round(safeSurplus / daysRemaining)}/day` },
          { label: "Risk Level", value: "Low / Safe" }
        ],
        actionableSuggestion: "Proceed with the purchase using debit or MoMo, ensuring your emergency buffer remains intact in your savings vault.",
        suggestedPrompts: [
          "How much can I safely spend per day?",
          "What can I cut from my spending?",
          "How much should I save this month?"
        ]
      };
    } else if (canAffordBarely) {
      return {
        text: `### Realistic Affordability Analysis\n\n- **Target Purchase**: **${currency}${cost.toLocaleString()}**\n- **Current Unspent Cash**: **${currency}${remaining.toLocaleString()}**\n- **Remaining Buffer After Purchase**: **${currency}${safeSurplus.toLocaleString()}** (~${currency}${Math.round(safeSurplus / daysRemaining)}/day for ${daysRemaining} days)\n\n⚠️ **You have the cash, but buying it right now is risky.**\nPaying ${currency}${cost.toLocaleString()} all at once leaves you with only **${currency}${safeSurplus.toLocaleString()}** for the next ${daysRemaining} days (**${currency}${Math.round(safeSurplus / daysRemaining)}/day**). Any unexpected bill, MoMo transfer, or emergency could put you into a deficit before payday.\n\n**Pragmatic Recommendation:**\nDeposit **${currency}${Math.round(cost / 2)}** this month into a short-term vault, and purchase it next month right after your next salary arrives.`,
        financialBreakdown: [
          { label: "Purchase Cost", value: `${currency}${cost.toLocaleString()}` },
          { label: "Remaining If Bought", value: `${currency}${safeSurplus.toLocaleString()}` },
          { label: "Tight Daily Buffer", value: `${currency}${Math.round(safeSurplus / daysRemaining)}/day` },
          { label: "Safer 2-Mo Plan", value: `${currency}${Math.round(cost / 2)}/mo` }
        ],
        actionableSuggestion: `Split the purchase into a 2-month goal of ${currency}${Math.round(cost / 2)}/month to buy stress-free without draining your safety buffer.`,
        suggestedPrompts: [
          "How do I set up a savings goal for this?",
          "How much can I safely spend per day?",
          "What can I cut from my spending?"
        ]
      };
    } else {
      const deficit = Math.abs(safeSurplus);
      const realisticMonths = Math.max(2, Math.ceil(cost / Math.max(200, monthlyIncome * 0.15)));
      const monthlyPace = Math.round(cost / realisticMonths);

      return {
        text: `### Realistic Affordability Assessment\n\n- **Target Item Cost**: **${currency}${cost.toLocaleString()}**\n- **Current Disposable Cash**: **${currency}${remaining.toLocaleString()}**\n\n❌ **Not recommended right now — would cause a ${currency}${deficit.toLocaleString()} deficit.**\nAttempting to buy this today would exhaust your monthly funds and force reliance on expensive short-term debt or overdrafts.\n\n**Realistic Savings Roadmap:**\nBy allocating **${currency}${monthlyPace}/month** (about 15% of income) into a dedicated target envelope, you will comfortably purchase it in **${realisticMonths} months** completely debt-free.`,
        financialBreakdown: [
          { label: "Item Cost", value: `${currency}${cost.toLocaleString()}` },
          { label: "Current Deficit", value: `-${currency}${deficit.toLocaleString()}` },
          { label: "Sustainable Pace", value: `${currency}${monthlyPace}/month` },
          { label: "Timeline", value: `${realisticMonths} Months` }
        ],
        actionableSuggestion: `Create a ${realisticMonths}-month savings goal for ${currency}${cost.toLocaleString()} with a monthly target of ${currency}${monthlyPace}.`,
        suggestedPrompts: [
          "Why am I always broke before payday?",
          "How much can I safely spend this weekend?",
          "What can I cut from my spending?"
        ]
      };
    }
  }

  // 2. Realistic Cash Crunch Query ("Why am I broke before payday?")
  if (lower.includes("broke") || lower.includes("payday") || lower.includes("why") || lower.includes("expenses increase") || lower.includes("deficit")) {
    const topCatPct = totalExpenses > 0 && topCatObj?.amount ? Math.round((topCatObj.amount / totalExpenses) * 100) : 35;
    const weeklySafePace = Math.round((dailySafeSpend * 7));

    return {
      text: `### Realistic Cash Flow Breakdown\n\nLooking at your actual spending cadence:\n- **Monthly Income**: **${currency}${monthlyIncome.toLocaleString()}**\n- **Total Expenses Logged**: **${currency}${totalExpenses.toLocaleString()}** (${monthlyIncome > 0 ? Math.round((totalExpenses / monthlyIncome) * 100) : 0}% burn rate)\n- **Remaining for Next ${daysRemaining} Days**: **${currency}${remaining.toLocaleString()}** (**${currency}${dailySafeSpend}/day**)\n\n**Why Mid-Month Shortages Happen in Real Life:**\n1. **Lump-Sum Early Outflows**: Paying rent, utilities, and large bulk grocery runs early in the cycle leaves a smaller buffer for the second half of the month.\n2. **Frequent Micro-Transfers**: Small daily transactions (e.g. ${currency}30-${currency}80 on MoMo food orders and quick ride trips) add up to **${topCatAmount || `${currency}800+`}** on **${topCatName}** alone (${topCatPct}% of all spend).\n\n**Sustainable Adjustment (No Extreme Austerity):**\n- Instead of stopping dining out completely, reduce restaurant frequency by just 2 meals a week (~${currency}180/mo saved).\n- Set a **daily pacing limit of ${currency}${dailySafeSpend}** for variable expenses.`,
      financialBreakdown: [
        { label: "Monthly Income", value: `${currency}${monthlyIncome.toLocaleString()}` },
        { label: "Total Spent", value: `${currency}${totalExpenses.toLocaleString()}` },
        { label: "Safe Daily Pace", value: `${currency}${dailySafeSpend}/day` },
        { label: "Top Outflow", value: `${topCatName} (${topCatPct}%)` }
      ],
      actionableSuggestion: `Cap non-essential daily spending at ${currency}${dailySafeSpend}/day for the remaining ${daysRemaining} days to finish the month cash-positive.`,
      suggestedPrompts: [
        "How much can I safely spend this weekend?",
        "Can I afford a 1,500 phone?",
        "How do I clear my debt faster?"
      ]
    };
  }

  // 3. Realistic Debt Management Query
  if (lower.includes("debt") || lower.includes("clear") || lower.includes("loan") || lower.includes("avalanche") || lower.includes("snowball")) {
    const totalDebt = debts.reduce((sum: number, d: any) => sum + Number(d.balance || d.currentBalance || 0), 0);
    const highestDebt = [...debts].sort((a, b) => (b.interestRate || 0) - (a.interestRate || 0))[0] || { lender: "Highest Rate Loan", interestRate: 24, currentBalance: 2000 };
    const extraPayment = Math.max(100, Math.min(300, Math.round(monthlyIncome * 0.05)));

    return {
      text: `### Realistic Debt Repayment Strategy\n\n- **Total Outstanding Debt**: **${currency}${totalDebt.toLocaleString()}**\n- **Priority Target**: **${highestDebt.lender}** (${highestDebt.interestRate}% APR)\n\n**The Realistic Action Plan:**\n1. **Never skip minimums**: Keep paying standard minimum payments on all loans on time to protect your credit and avoid penalty fees.\n2. **Avalanche Extra Principle**: Channel a realistic extra **${currency}${extraPayment}/month** exclusively towards **${highestDebt.lender}**.\n3. **Do not drain emergency savings**: Keep at least ${currency}500-${currency}1,000 in your liquid vault so unexpected expenses don't force you to take new high-interest loans.`,
      financialBreakdown: [
        { label: "Total Debt", value: `${currency}${totalDebt.toLocaleString()}` },
        { label: "Priority Account", value: highestDebt.lender },
        { label: "Interest Rate", value: `${highestDebt.interestRate}%` },
        { label: "Realistic Extra", value: `${currency}${extraPayment}/month` }
      ],
      actionableSuggestion: `Set an automated transfer of ${currency}${extraPayment} to ${highestDebt.lender} the day your paycheck lands.`,
      suggestedPrompts: [
        "Why am I always broke before payday?",
        "How much should I save this month?",
        "Can I afford a 1,500 phone?"
      ]
    };
  }

  // 4. Realistic Savings & General Query
  const realisticSavingsTarget = Math.max(150, Math.round(monthlyIncome * 0.15));
  return {
    text: `### Financial Overview & Daily Pacing\n\n- **Monthly Income**: **${currency}${monthlyIncome.toLocaleString()}**\n- **Expenses to Date**: **${currency}${totalExpenses.toLocaleString()}**\n- **Savings Vault**: **${currency}${totalSavings.toLocaleString()}**\n- **Remaining Safe-to-Spend**: **${currency}${remaining.toLocaleString()}** (**${currency}${dailySafeSpend}/day** for the remaining ${daysRemaining} days)\n\n**Realistic Guidance for This Period:**\nYour current largest spending area is **${topCatName}** ${topCatAmount ? `(${topCatAmount})` : ""}. A sustainable target is allocating **${currency}${realisticSavingsTarget}/month** (15% of income) into verified savings while maintaining your daily variable spending below **${currency}${dailySafeSpend}/day**.`,
    financialBreakdown: [
      { label: "Income", value: `${currency}${monthlyIncome.toLocaleString()}` },
      { label: "Total Expenses", value: `${currency}${totalExpenses.toLocaleString()}` },
      { label: "Safe Daily Pace", value: `${currency}${dailySafeSpend}/day` },
      { label: "Target Savings", value: `${currency}${realisticSavingsTarget}/mo` }
    ],
    actionableSuggestion: `Keep logging your transactions daily to ensure your safe pacing threshold stays above ${currency}${dailySafeSpend}/day.`,
    suggestedPrompts: [
      "Can I afford a 1,500 phone?",
      "Why am I always broke before payday?",
      "How do I clear my debt faster?"
    ]
  };
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", service: "MoneyPilot Backend" });
  });

  // 1. Natural Language Transaction Parser
  app.post("/api/ai/parse-transaction", async (req, res) => {
    const { input } = req.body;
    if (!input || typeof input !== "string") {
      return res.status(400).json({ error: "Missing or invalid 'input' parameter" });
    }

    try {
      const ai = getGeminiClient();
      if (!ai) {
        return res.json({
          success: true,
          source: "local-heuristic",
          data: parseFallbackTransaction(input)
        });
      }

      const prompt = `You are the AI Transaction Parser for MoneyPilot, a Ghanaian personal finance application.
Parse this user input into a single structured financial transaction:
User input: "${input}"

Context:
- Default currency unit is Ghanaian Cedis (numeric values formatted clearly without prefix symbols if not specified).
- Available payment methods: "MTN MoMo", "Telecel Cash", "AT Money", "Bank Account", "Debit Card", "Cash Wallet".
- Available Categories: "Food & Dining", "Transport & Fuel", "Housing & Rent", "Utilities", "Airtime & Data", "Shopping & Goods", "Entertainment & Leisure", "Health & Medical", "Education", "Family & Support", "Debt Repayment", "Savings & Investment", "Income & Salary", "Freelance & Business", "Other".
- Common Ghanaian entities: Papaye / KFC / Buka / Chop bar -> Food & Dining; ECG / GWCL / Electricity -> Utilities; Bolt / Uber / Yango / Fuel / Shell / Total -> Transport & Fuel; Melcom / Shoprite / Palace -> Shopping & Goods; MTN / Telecel bundle / airtime -> Airtime & Data.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              amount: { type: Type.NUMBER, description: "Numeric amount (e.g. 50, 350.50)" },
              type: { type: Type.STRING, enum: ["expense", "income", "transfer"], description: "Type of transaction" },
              category: { type: Type.STRING, description: "One of the standard categories" },
              description: { type: Type.STRING, description: "Clean, human-readable description (e.g. Lunch at Papaye)" },
              merchant: { type: Type.STRING, description: "Merchant, recipient, or provider name if identifiable" },
              paymentMethod: { type: Type.STRING, description: "Detected or inferred payment method" },
              confidenceNote: { type: Type.STRING, description: "Brief explanation of how this was parsed" }
            },
            required: ["amount", "type", "category", "description", "paymentMethod"]
          }
        }
      });

      const parsedData = JSON.parse(response.text || "{}");
      res.json({ success: true, source: "gemini-3.7-flash", data: parsedData });
    } catch (error: any) {
      console.warn("Gemini parse failed, using fallback heuristic:", error.message);
      res.json({
        success: true,
        source: "local-heuristic-fallback",
        data: parseFallbackTransaction(input)
      });
    }
  });

  // 2. AI Financial Insights Generator
  app.post("/api/ai/insights", async (req, res) => {
    const { transactions = [], monthlyIncome = 6000, budgets = [], goals = [], debts = [], currency = "" } = req.body;

    try {
      const ai = getGeminiClient();

      if (!ai) {
        const fallbackInsights = generateFallbackInsights(transactions, monthlyIncome, budgets, goals, debts, currency);
        return res.json({ success: true, fallback: true, insights: fallbackInsights });
      }

      const prompt = `You are the lead AI Financial Advisor for MoneyPilot, a Ghanaian personal finance assistant.
Analyze the user's financial profile with deep realism and practical empathy:
- Monthly Income: ${currency}${monthlyIncome}
- Currency: ${currency}
- Total Transactions (${transactions?.length || 0}): ${JSON.stringify((transactions || []).slice(0, 15))}
- Budgets: ${JSON.stringify(budgets || [])}
- Savings Goals: ${JSON.stringify(goals || [])}
- Debts: ${JSON.stringify(debts || [])}

Realism Guidelines:
1. NEVER recommend extreme or unsustainable austerity (e.g. cutting 100% of entertainment, transport, or dining). Suggest realistic 10-15% optimizations.
2. Ground all calculations in real math: calculate daily pacing, burn rate, and timeline feasibility.
3. Prioritize establishing an emergency safety cushion (1-3 months of essential baseline) and tackling high-interest debt before luxury goals.
4. ALWAYS explain 'WHY' the observation matters and provide a specific, doable action step.
5. Ensure amounts use the currency formatting ${currency}.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING, description: "Snappy headline" },
                observation: { type: Type.STRING, description: "What the data shows clearly" },
                whyExplanation: { type: Type.STRING, description: "Deep explanation of why this matters" },
                actionableStep: { type: Type.STRING, description: "Exact step user should take" },
                categoryTag: { type: Type.STRING, description: "Category name or Goal/Debt/Budget" },
                impactType: { type: Type.STRING, enum: ["positive", "warning", "opportunity", "alert"] },
                metricHighlight: { type: Type.STRING, description: "Short metric badge" }
              },
              required: ["title", "observation", "whyExplanation", "actionableStep", "categoryTag", "impactType"]
            }
          }
        }
      });

      const rawInsights = JSON.parse(response.text || "[]");
      const sanitizedInsights = (Array.isArray(rawInsights) ? rawInsights : []).map((ins: any, idx: number) => ({
        id: ins.id || `ins-gemini-${Date.now()}-${idx}`,
        title: ins.title || "Financial Observation",
        observation: ins.observation || "",
        whyExplanation: ins.whyExplanation || "",
        actionableStep: ins.actionableStep || "",
        categoryTag: ins.categoryTag || "General",
        impactType: ins.impactType || "opportunity",
        metricHighlight: ins.metricHighlight || "",
        timestamp: new Date().toISOString()
      }));

      if (sanitizedInsights.length === 0) {
        const fallbackInsights = generateFallbackInsights(transactions, monthlyIncome, budgets, goals, debts, currency);
        return res.json({ success: true, fallback: true, insights: fallbackInsights });
      }

      res.json({ success: true, insights: sanitizedInsights });
    } catch (error: any) {
      console.warn("Gemini insights API failed, serving dynamic fallback:", error.message);
      const fallbackInsights = generateFallbackInsights(transactions, monthlyIncome, budgets, goals, debts, currency);
      res.json({ success: true, fallback: true, insights: fallbackInsights });
    }
  });

  // 3. AI Financial Advisor Chat
  app.post("/api/ai/chat", async (req, res) => {
    const { message, history = [], financialContext = {} } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Missing 'message'" });
    }

    try {
      const ai = getGeminiClient();
      if (!ai) {
        const fallback = generateFallbackChatReply(message, financialContext);
        return res.json({
          success: true,
          reply: fallback.text,
          financialBreakdown: fallback.financialBreakdown,
          actionableSuggestion: fallback.actionableSuggestion,
          suggestedPrompts: fallback.suggestedPrompts
        });
      }

      const systemInstruction = `You are MoneyPilot's AI Financial Companion.
Your promise: "Know where your money goes. Know what to do next."
Target user: Young working adults in Ghana (salaried, freelancers, entrepreneurs) using Mobile Money (MTN MoMo, Telecel Cash), Banks, and Cash.
Tone: Warm, encouraging, mathematically precise, practical, empathetic, and non-judgmental.

User's Real Financial Context:
- Monthly Income: ${financialContext.currency || ""}${financialContext.monthlyIncome || 0}
- Current Month Total Expenses: ${financialContext.currency || ""}${financialContext.totalExpenses || 0}
- Current Month Savings Allocated: ${financialContext.currency || ""}${financialContext.totalSavings || 0}
- Remaining Safe to Spend: ${financialContext.currency || ""}${financialContext.remaining || 0}
- Financial Health Score: ${financialContext.healthScore || 72}/100
- Active Goals: ${JSON.stringify(financialContext.goals || [])}
- Active Debts: ${JSON.stringify(financialContext.debts || [])}
- Budgets: ${JSON.stringify(financialContext.budgets || [])}
- Top Spending Categories: ${JSON.stringify(financialContext.topCategories || [])}

Core Realism Principles (Crucial):
1. **Never Give Unrealistic or Extreme Advice**: Never tell users to cut 100% of social life, dining out, or transport. Recommend sustainable 10-15% optimizations (e.g. cutting 2 takeout meals a week or setting a weekly category cap).
2. **Deep Affordability Checks ("Can I afford X?")**:
   - Don't just check if item cost <= balance.
   - Calculate post-purchase liquidity: will the remaining cash comfortably support daily essentials until next payday?
   - If buying outright leaves an uncomfortably low daily buffer (< 35/day), declare it "Risky outright" and provide a realistic 2-3 month installment savings roadmap.
3. **Cash-Flow Pacing**: Always communicate in terms of realistic daily safe spend pace (Remaining buffer ÷ days left in month) to prevent mid-month panics.
4. **Prioritize Real Emergencies & High-Interest Debt**: Recommend building a 1-month liquid emergency cushion before aggressive luxury goal funding, and target high-interest debt (Avalanche) while maintaining minimums.
5. **Always provide clear arithmetic**: Cite their actual numbers, provide a short financial breakdown table, and suggest 2-3 natural follow-up questions.`;

      const prompt = `Conversation history:
${history.map((h: any) => `${h.role === 'user' ? 'User' : 'MoneyPilot'}: ${h.text}`).join('\n')}

User: ${message}

Respond in structured JSON format with:
- "text": The main markdown response
- "financialBreakdown": (optional) array of { "label": string, "value": string } with relevant calculation numbers
- "actionableSuggestion": (optional) a single clear next step
- "suggestedPrompts": array of 2-3 short follow-up prompts the user can ask next`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              text: { type: Type.STRING, description: "Detailed, empathetic response in markdown format" },
              actionableSuggestion: { type: Type.STRING, description: "Key takeaway recommendation" },
              financialBreakdown: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    label: { type: Type.STRING },
                    value: { type: Type.STRING }
                  },
                  required: ["label", "value"]
                }
              },
              suggestedPrompts: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: ["text", "suggestedPrompts"]
          }
        }
      });

      const parsed = JSON.parse(response.text || "{}");
      res.json({
        success: true,
        reply: parsed.text,
        actionableSuggestion: parsed.actionableSuggestion,
        financialBreakdown: parsed.financialBreakdown,
        suggestedPrompts: parsed.suggestedPrompts || []
      });
    } catch (error: any) {
      console.warn("Gemini chat failed, serving fallback:", error.message);
      const fallback = generateFallbackChatReply(message, financialContext);
      res.json({
        success: true,
        reply: fallback.text,
        financialBreakdown: fallback.financialBreakdown,
        actionableSuggestion: fallback.actionableSuggestion,
        suggestedPrompts: fallback.suggestedPrompts
      });
    }
  });

  // Vite integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`MoneyPilot server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
