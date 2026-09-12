MoneyPilot — Product & Architecture Guide
MoneyPilot is an intelligent, full-stack personal finance platform designed around a single guiding principle: "Know where your money goes. Know
what to do next.
"
Unlike traditional budgeting apps that passively record transactions in static spreadsheets, MoneyPilot combines real-time cash pacing, audited
savings verification, envelope budgeting, debt payoff optimization, and a grounded AI Financial Advisor to help users make proactive, stress-free
money decisions.
1. Executive Summary & Core Philosophy
Most budgeting applications suffer from three fundamental flaws:
1. The "Leftover Illusion": Declaring unspent money as "savings" even when it is still sitting in a daily spending account, where it quickly gets
spent before month's end.
2. Post-Mortem Analytics: Telling users they overspent after the money is already gone, rather than providing proactive daily spending
thresholds.
3. Unrealistic AI Guidance: Recommending extreme, unsustainable austerity (e.g.,
"cut 100% of dining and entertainment"), which users
inevitably abandon.
MoneyPilot solves this by:
●
Enforcing Savings Proof (distinguishing unallocated cash buffers from locked, verified savings transfers).
●
Computing a live Daily Safe Pacing threshold ($X/day left until payday).
●
Providing Pragmatic AI Advice that recommends sustainable 10–15% optimizations and evaluates real post-purchase liquidity.
2. Platform Architecture & Data Pipeline
codeCode
┌────────────────────────────────────────────────────────────────────────┐
│ DATA INGESTION ENGINE │
│ • Natural Voice Input • Bank/SMS Text OCR • Manual Fast Entry │
└───────────────────────────────────┬────────────────────────────────────┘
│
▼
┌────────────────────────────────────────────────────────────────────────┐
│ CORE TRANSACTION LEDGER │
│ • Multi-Account Tracking (Bank, Mobile Wallet, Cash, Cards) │
│ • Rule-Based Category Learning & Auto-Tagging │
│ • Immutable Historical Audit Log │
└──────────────────┬─────────────────────────────────┬───────────────────┘
│ │
▼ ▼
┌────────────────────────────────────┐ ┌─────────────────────────────────┐
│ CASH FLOW & PACING ENGINE │ │ FINANCIAL SCORECARD │
│ • Total Income vs Burn Rate │ │ • Savings Rate Score (0-25) │
│ • Safe Daily Spend Pacing │ │ • Budget Discipline (0-25) │
│ • Unallocated Buffer Monitoring │ │ • Debt-to-Income Ratio (0-20) │
│ • Envelope Adherence Calculations │ │ • Emergency Buffer (0-15) │
│ │ │ • Logging Consistency (0-15) │
└──────────────────┬─────────────────┘ └─────────────────┬───────────────┘
│ │
▼ ▼
┌────────────────────────────────────────────────────────────────────────┐
│ GOALS, DEBTS & RECURRING COMMITMENTS │
│ • Verified Savings Vaults (With Audited Transfer Logs) │
│ • Avalanche Debt Payoff Engine (Highest-APR Prioritization) │
│ • Recurring Subscriptions & Fixed Bills Calendar │
└───────────────────────────────────┬────────────────────────────────────┘
│
▼
┌────────────────────────────────────────────────────────────────────────┐
│ REALISTIC AI FINANCIAL ADVISOR │
│ • Post-Purchase Liquidity Checks ("Can I afford X?") │
│ • Mid-Month Cash Deficit Root-Cause Diagnostics │
│ • Automated Daily Observation Cards (Why It Matters + Action Step) │
└────────────────────────────────────────────────────────────────────────┘
3. Comprehensive Feature Breakdown
Feature 1: The Command Center (Dashboard & Real-Time Pacing)
The primary overview screen organizes financial health into four high-level metrics:
●
Total Income: Monthly baseline earnings (salaries, freelance, passive income).
●
Total Expenses: All outflow transactions logged within the active cycle.
●
Verified Savings: Funds explicitly deposited into designated savings vaults.
●
Unallocated Buffer & Safe Daily Pace: The remaining cushion divided by the number of days left before the next payday.
●
Visual Analytics:
○
Income vs. Outflow Breakdown: Multi-segment cash-flow balance.
○
○
Category Distribution: Interactive visual charts highlighting top spending drivers.
Daily Pacing Bar: Compares actual spending trajectory against the linear ideal burn rate.
●
Feature 2: Transaction Ingestion Engine
MoneyPilot makes logging effortless to eliminate tracking friction:
●
Natural Language Voice Logging: Uses the browser speech recognition interface to allow users to say: "Bought lunch for 45 at Subway with
my debit card.
" The engine automatically parses:
○
Amount: 45
○
Category: Food & Dining
○
Merchant: Subway
○
Account: Card / Bank
●
●
●
●
SMS & Notification Parser: Users can paste raw text messages received from banks or mobile money services. The built-in regex extractor
parses transaction references, dates, amounts, and vendor names.
Smart Category Learning: When a user changes the category of a transaction, MoneyPilot saves that vendor-to-category rule locally,
ensuring future transactions from that merchant are categorized accurately.
Tamper-Proof Ledger: Transactions are maintained as a historical audit log to preserve net worth integrity and accurate trend forecasting.
Feature 3: Envelope Budgeting & 50/30/20 Generator
The budgeting module controls discretionary cash flow through structured envelopes:
●
Category Envelopes: Allocate specific monthly limits across Housing, Utilities, Groceries, Dining Out, Transport, Health, and Entertainment.
●
One-Click 50/30/20 Starter Generator: Automatically calculates and distributes monthly income into:
○
50% Needs: Essential living costs (Rent, Groceries, Basic Utilities).
○
30% Wants: Lifestyle, dining out, recreation, and discretionary spending.
○
20% Savings & Investments: Emergency reserves and future wealth creation.
●
●
Real-Time Threshold Warnings: Progress bars change color as spending reaches 70%, 90%, and 100% of an envelope's limit.
Feature 4: Savings Goals & "Savings Proof" Audit Trail
MoneyPilot solves the "simulated savings" problem:
●
The Core Problem: In standard apps, unspent money is labeled as "savings,
" even if it is still sitting in a checking account where it gets
consumed before payday.
●
The Verified Solution:
○
Unspent cash remains marked as Unallocated Buffer.
○
To turn buffer into real savings, users tap "Deposit / Allocate Funds"
.
○
This logs an Audited Savings Transfer (Savings & Investment), locking the money into the designated vault and adding a permanent
record to the audit ledger.
●
●
Goal Types: Custom vaults for Emergency Funds, Electronics, Travel, Education, or Real Estate.
Feature 5: Debt Payoff Engine (Avalanche Method)
Helps users eliminate debt systematically:
●
Debt Inventory: Track multiple liabilities (credit cards, personal loans, student debt, installment purchases) with their balance, minimum
payment, and annual percentage rate (APR).
●
Avalanche Algorithm: Automatically sorts liabilities by interest rate. It instructs users to make minimum payments across all accounts while
directing any surplus cash toward the loan with the highest APR, minimizing total interest paid over time.
●
Payoff Projections: Displays estimated months to debt freedom based on current extra-payment capacity.
Feature 6: Recurring Bills & Subscription Tracker
Ensures fixed monthly commitments never surprise the user:
●
Scheduled Commitments: Track recurring bills (Rent, Internet, Electricity, Water, Streaming Subscriptions).
●
Due Date Proximity Alerts: Visual calendar tags highlight bills that are due within 3 days, 7 days, or overdue.
●
Pre-Allocated Burn: Calculates the exact amount of fixed overhead locked in before discretionary spending begins.
Feature 7: Grounded, Realistic AI Financial Advisor
Powered by Google Gemini models with intelligent deterministic fallbacks:
●
Realistic Affordability Checks ("Can I afford X?"):
○
Rather than just checking if balance >= price, the advisor models post-purchase liquidity.
○
If buying an item outright leaves an uncomfortably low daily buffer (
○
), the advisor flags it as risky and calculates a sustainable 2 to 3-month savings roadmap.
●
●
●
●
●
Mid-Month Diagnostic ("Why am I broke before payday?"):
○
Analyzes the compounding effect of frequent micro-transactions (e.g., daily ride-shares or delivery orders).
○
Proposes sustainable 10–15% adjustments (e.g., trimming two takeout meals per week) rather than impractical total austerity.
Actionable Observation Cards:
○
Generates real-time insight cards on the dashboard, each containing an Observation, an explanation of Why It Matters, and a
concrete One-Tap Action Step.
Feature 8: Financial Health Score (0–100)
A holistic financial scorecard evaluated across five core pillars:
1. Savings Rate Score (25 pts): Scales up to full points when achieving a 20%+ savings rate.
2. Budget Discipline Score (25 pts): Based on compliance across all active envelopes.
3. Debt Burden Score (20 pts): Penalizes high debt-to-income and heavy interest burdens.
4. Emergency Reserve Score (15 pts): Evaluates months of essential living expenses held in liquid vaults.
5. Logging Consistency Score (15 pts): Rewards regular expense tracking and bill reconciliation.
4. User Journeys: Day in the Life
Morning Routine: The Daily Pacing Check
1. The user opens MoneyPilot.
2. The dashboard immediately displays: "Safe Daily Pace: $42/day for the next 14 days.
"
3. The user knows their exact discretionary ceiling before making morning purchasing decisions.
Afternoon: Frictionless Expense Logging
1. After buying lunch, the user taps the microphone and says: "Spent 22 on lunch with card.
"
2. The transaction is instantly categorized under Food & Dining, updating the envelope progress bar and recalculating the daily safe pace in
real time.
Evening: Pre-Purchase Decision Support
1. The user contemplates buying a $600 gadget and asks the AI Advisor: "Can I afford a 600 watch today?"
2. The AI calculates:
○
Current buffer: $850.
○
Buffer if purchased:
○
17/day for the remaining 14 days).
3.
4. The AI responds: "Buying outright is risky as it drops your daily cushion to $17/day. Instead, set up a 2-month goal of $300/month to buy it
debt-free after your next salary.
"
5. Summary of Key User Benefits
Feature Standard Budgeting
Apps
Savings
Tracking
Assumes unspent
balance is saved
Cash-Flow
View
Shows monthly totals
after the fact
Expense
Entry
Tedious manual
form-filling
Debt
Strategy
Simple list of balances AI Advisory Generic tips or
extreme austerity
MoneyPilot Approach
Requires Savings Proof (audited transfers
to vaults)
Calculates Daily Safe Pacing ($X/day until
payday)
Voice logging, SMS text parsing, & fast
manual input
Built-in Avalanche optimization (highest
APR first)
Realistic, grounded coaching with
post-purchase liquidity checks
Health Score Single arbitrary rating Comprehensive 5-pillar scorecard (0–100)