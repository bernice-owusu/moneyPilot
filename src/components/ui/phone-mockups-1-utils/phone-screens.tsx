import React from "react";
import { motion } from "motion/react";
import { ArrowUpRight, Bot, PieChart, Send, Target, Wallet } from "lucide-react";

const ease = [0.22, 1, 0.36, 1] as const;

function TopBar({ kicker, title }: { kicker: string; title: string }) {
  return (
    <div className="flex items-center justify-between px-3.5 pb-2.5 pt-8">
      <div>
        <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#747474]">{kicker}</p>
        <p className="font-display text-[18px] leading-none text-ink">{title}</p>
      </div>
      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#4294F4] text-[11px] font-semibold text-white">
        A
      </div>
    </div>
  );
}

export function HomeScreen({ playing }: { playing: boolean }) {
  return (
    <div className="h-full bg-[#F8F7F2]">
      <TopBar kicker="Good afternoon" title="Ama" />
      <motion.div
        className="mx-3 rounded-[18px] bg-[#4294F4] p-3.5 text-white"
        initial={playing ? { opacity: 0, y: 12 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.1, ease }}
      >
        <p className="text-[9px] font-medium uppercase tracking-[0.16em] text-white/80">Total balance</p>
        <p className="mt-1 font-display text-[28px] leading-none">GHS 4,820</p>
        <div className="mt-3 grid grid-cols-2 gap-1.5">
          <div className="rounded-md bg-white/15 px-2.5 py-1.5">
            <p className="text-[8px] uppercase text-white/70">Bank</p>
            <p className="text-[12px] font-semibold">GHS 3,140</p>
          </div>
          <div className="rounded-md bg-white/15 px-2.5 py-1.5">
            <p className="text-[8px] uppercase text-white/70">MoMo</p>
            <p className="text-[12px] font-semibold">GHS 1,680</p>
          </div>
        </div>
      </motion.div>
      <div className="mt-3 px-3">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-semibold text-ink">Safe Daily Pace</p>
          <p className="text-[10px] font-medium text-[#176FE8]">Today</p>
        </div>
        <div className="mt-1.5 rounded-xl border border-black/5 bg-white p-2.5">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[9px] text-[#747474]">You can spend</p>
              <p className="font-display text-[22px] leading-none text-ink">GHS 86</p>
            </div>
            <p className="rounded-full bg-[#E9E8E3] px-2 py-0.5 text-[9px] font-semibold">12 days left</p>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#E9E8E3]">
            <motion.div
              className="h-full rounded-full bg-[#58A5FA]"
              initial={playing ? { width: "0%" } : { width: "62%" }}
              animate={{ width: "62%" }}
              transition={{ duration: 0.9, delay: 0.3, ease }}
            />
          </div>
        </div>
      </div>
      <div className="mt-3 space-y-1.5 px-3">
        {[
          { name: "MTN MoMo", amount: "-GHS 45", tag: "Transfer", d: 0.4 },
          { name: "Kejetia Market", amount: "-GHS 28", tag: "Food", d: 0.55 },
          { name: "Savings Vault", amount: "+GHS 200", tag: "Save", d: 0.7 },
        ].map((row) => (
          <motion.div
            key={row.name}
            className="flex items-center justify-between rounded-xl border border-black/5 bg-white px-2.5 py-2"
            initial={playing ? { opacity: 0, x: 14 } : false}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.36, delay: row.d, ease }}
          >
            <div>
              <p className="text-[11px] font-medium text-ink">{row.name}</p>
              <p className="text-[9px] text-[#747474]">{row.tag}</p>
            </div>
            <p className={`text-[11px] font-semibold ${row.amount.startsWith("+") ? "text-[#176FE8]" : "text-ink"}`}>
              {row.amount}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
export function GoalsScreen({ playing }: { playing: boolean }) {
  return (
    <div className="h-full bg-[#F8F7F2]">
      <TopBar kicker="Savings" title="Goals" />
      <motion.div
        className="mx-3 rounded-[18px] bg-[#171717] p-3.5 text-white"
        initial={playing ? { opacity: 0, y: 14 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.1, ease }}
      >
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10">
            <Target className="h-3.5 w-3.5" />
          </span>
          <div>
            <p className="text-[9px] uppercase tracking-[0.14em] text-white/55">Emergency fund</p>
            <p className="text-[13px] font-semibold">Build a brighter buffer</p>
          </div>
        </div>
        <div className="mt-3 flex items-end justify-between">
          <p className="font-display text-[26px] leading-none">GHS 3,400</p>
          <p className="text-[10px] text-white/60">of GHS 5,000</p>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/15">
          <motion.div
            className="h-full rounded-full bg-white"
            initial={playing ? { width: "18%" } : { width: "68%" }}
            animate={{ width: "68%" }}
            transition={{ duration: 1.15, delay: 0.35, ease }}
          />
        </div>
        <motion.span
          className="mt-3 inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-semibold"
          initial={playing ? { opacity: 0, scale: 0.86 } : false}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35, delay: 1.05, ease }}
        >
          <ArrowUpRight className="h-3 w-3" />
          +GHS 200 just now
        </motion.span>
      </motion.div>
      <div className="mt-3 space-y-1.5 px-3">
        {[
          { label: "Salary split", amount: "+GHS 150", d: 0.45 },
          { label: "MoMo leftover", amount: "+GHS 50", d: 0.62 },
        ].map((row) => (
          <motion.div
            key={row.label}
            className="flex items-center justify-between rounded-xl border border-black/5 bg-white px-2.5 py-2"
            initial={playing ? { opacity: 0, y: 10 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.36, delay: row.d, ease }}
          >
            <p className="text-[11px] font-medium text-ink">{row.label}</p>
            <p className="text-[11px] font-semibold text-[#176FE8]">{row.amount}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export function BudgetScreen({ playing }: { playing: boolean }) {
  const bars = [
    { d: "M", h: 42 },
    { d: "T", h: 58 },
    { d: "W", h: 36 },
    { d: "T", h: 72, spent: true },
    { d: "F", h: 48 },
    { d: "S", h: 28 },
    { d: "S", h: 18 },
  ];
  return (
    <div className="h-full bg-[#F8F7F2]">
      <TopBar kicker="This week" title="Budget" />
      <div className="mx-3 rounded-[18px] border border-black/5 bg-white p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <PieChart className="h-3.5 w-3.5 text-[#176FE8]" />
            <p className="text-[12px] font-semibold text-ink">Food envelope</p>
          </div>
          <p className="text-[10px] font-medium text-[#176FE8]">GHS 142 left</p>
        </div>
        <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-[#E9E8E3]">
          <motion.div
            className="h-full rounded-full bg-[#58A5FA]"
            initial={playing ? { width: "0%" } : { width: "57%" }}
            animate={{ width: "57%" }}
            transition={{ duration: 0.95, delay: 0.22, ease }}
          />
        </div>
        <div className="mt-3 flex h-16 items-end justify-between gap-1">
          {bars.map((b, i) => (
            <div key={`${b.d}-${i}`} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
              <motion.div
                className={`w-full max-w-[14px] rounded-t-[4px] ${b.spent ? "bg-[#176FE8]" : "bg-[#58A5FA]/70"}`}
                initial={playing ? { height: 0 } : { height: `${b.h}%` }}
                animate={{ height: `${b.h}%` }}
                transition={{ duration: 0.5, delay: 0.18 + i * 0.07, ease }}
              />
              <span className="text-[8px] font-medium text-[#747474]">{b.d}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-3 space-y-1.5 px-3">
        <motion.div
          className="rounded-xl border border-black/5 bg-white px-2.5 py-2"
          initial={playing ? { opacity: 0, y: 10 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.38, delay: 0.55, ease }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-ink">Chop bar · waakye</p>
              <p className="text-[9px] text-[#747474]">Logged from MoMo</p>
            </div>
            <p className="text-[11px] font-semibold text-ink">-GHS 18</p>
          </div>
        </motion.div>
        <motion.div
          className="rounded-xl bg-[#4294F4]/10 px-2.5 py-2"
          initial={playing ? { opacity: 0, y: 10 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.38, delay: 0.75, ease }}
        >
          <p className="text-[10px] font-medium text-[#176FE8]">Still safe — GHS 47/day remaining pace</p>
        </motion.div>
      </div>
    </div>
  );
}

export function AiScreen({ playing }: { playing: boolean }) {
  return (
    <div className="flex h-full flex-col bg-[#F8F7F2]">
      <TopBar kicker="AI chat" title="Copilot" />
      <div className="flex flex-1 flex-col gap-2 px-3 pb-2">
        <motion.div
          className="max-w-[88%] self-start rounded-[14px] rounded-tl-sm bg-white px-2.5 py-2 shadow-sm"
          initial={playing ? { opacity: 0, y: 10 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.15, ease }}
        >
          <p className="text-[11px] leading-snug text-ink">
            Can I afford waakye this week without breaking food budget?
          </p>
        </motion.div>
        <motion.div
          className="max-w-[90%] self-end rounded-[14px] rounded-tr-sm bg-[#4294F4] px-2.5 py-2 text-white"
          initial={playing ? { opacity: 0, y: 10 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.55, ease }}
        >
          <p className="text-[11px] leading-snug">
            Yes. You have <span className="font-semibold">GHS 142</span> left on food. Keep today under{" "}
            <span className="font-semibold">GHS 18</span>.
          </p>
        </motion.div>
        <motion.div
          className="max-w-[85%] self-end rounded-[14px] rounded-tr-sm bg-[#4294F4] px-2.5 py-2 text-white"
          initial={playing ? { opacity: 0, y: 10 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.95, ease }}
        >
          <p className="text-[11px] leading-snug">Want me to lock a GHS 18 food cap for today?</p>
        </motion.div>
        <motion.div
          className="mt-0.5 flex items-center gap-1 self-start"
          initial={playing ? { opacity: 0 } : false}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 1.25 }}
        >
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="h-1.5 w-1.5 rounded-full bg-[#747474]"
              animate={playing ? { y: [0, -3, 0], opacity: [0.35, 1, 0.35] } : { opacity: 0.45 }}
              transition={{ duration: 0.9, delay: 1.3 + i * 0.12, repeat: Infinity }}
            />
          ))}
        </motion.div>
      </div>
      <div className="mx-3 mb-3 flex items-center gap-2 rounded-full border border-ink/8 bg-white px-2.5 py-1.5">
        <Bot className="h-3.5 w-3.5 text-[#747474]" />
        <p className="flex-1 text-[10px] text-[#747474]">Ask MoneyPilot…</p>
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-ink text-white">
          <Send className="h-3 w-3" />
        </span>
      </div>
    </div>
  );
}

export function VaultScreen({ playing }: { playing: boolean }) {
  return (
    <div className="h-full bg-[#F8F7F2]">
      <TopBar kicker="Locked save" title="Vault" />
      <motion.div
        className="mx-3 rounded-[18px] bg-[#176FE8] p-3.5 text-white"
        initial={playing ? { opacity: 0, y: 12 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.1, ease }}
      >
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15">
            <Wallet className="h-3.5 w-3.5" />
          </span>
          <div>
            <p className="text-[9px] uppercase tracking-[0.14em] text-white/70">Rent vault</p>
            <p className="text-[13px] font-semibold">Unlocks 12 Oct</p>
          </div>
        </div>
        <p className="mt-3 font-display text-[28px] leading-none">GHS 1,250</p>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/20">
          <motion.div
            className="h-full rounded-full bg-white"
            initial={playing ? { width: "22%" } : { width: "74%" }}
            animate={{ width: "74%" }}
            transition={{ duration: 1.1, delay: 0.32, ease }}
          />
        </div>
        <p className="mt-2 text-[10px] text-white/80">GHS 1,700 target · 18 days locked</p>
      </motion.div>
      <div className="mt-3 space-y-1.5 px-3">
        {[
          { label: "Auto-lock from salary", amount: "+GHS 400", d: 0.4 },
          { label: "Round-up from MoMo", amount: "+GHS 35", d: 0.58 },
        ].map((row) => (
          <motion.div
            key={row.label}
            className="flex items-center justify-between rounded-xl border border-black/5 bg-white px-2.5 py-2"
            initial={playing ? { opacity: 0, y: 10 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.36, delay: row.d, ease }}
          >
            <p className="text-[11px] font-medium text-ink">{row.label}</p>
            <p className="text-[11px] font-semibold text-[#176FE8]">{row.amount}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

