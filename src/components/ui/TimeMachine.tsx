import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import { projectCompoundGrowth } from "../../utils/finance";

type TimeMachineProps = {
  currency: string;
  currentSavings: number;
  monthlyIncome: number;
};

const ANNUAL_RATE = 0.12;
const MAX_YEARS = 20;

function formatMoney(value: number) {
  return Math.round(value).toLocaleString(undefined, { maximumFractionDigits: 0 });
}

function animateNumber(from: number, to: number, onFrame: (value: number) => void) {
  const start = performance.now();
  const duration = 420;
  let frame = 0;
  const tick = (now: number) => {
    const t = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - t, 3);
    onFrame(from + (to - from) * eased);
    if (t < 1) frame = requestAnimationFrame(tick);
  };
  frame = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(frame);
}

export const TimeMachine: React.FC<TimeMachineProps> = ({
  currency,
  currentSavings,
  monthlyIncome,
}) => {
  const startingPrincipal = Math.max(currentSavings, 0);
  const defaultMonthly = Math.max(
    50,
    Math.round((monthlyIncome > 0 ? monthlyIncome * 0.15 : 300) / 10) * 10
  );

  const [years, setYears] = useState(5);
  const [monthlySave, setMonthlySave] = useState(defaultMonthly);
  const [principal, setPrincipal] = useState(startingPrincipal > 0 ? startingPrincipal : 500);

  const futureValue = useMemo(
    () => projectCompoundGrowth(principal, monthlySave, years, ANNUAL_RATE),
    [principal, monthlySave, years]
  );

  const [shownValue, setShownValue] = useState(futureValue);
  const latestRef = useRef(futureValue);

  useEffect(() => {
    const from = latestRef.current;
    latestRef.current = futureValue;
    return animateNumber(from, futureValue, setShownValue);
  }, [futureValue]);

  const yearLabel = years === 1 ? "1 year" : `${years} years`;
  const grown = Math.max(0, futureValue - principal);
  const progress = (years / MAX_YEARS) * 100;

  return (
    <div className="dash-card overflow-hidden bg-ink p-5 text-white sm:p-7">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/55">
        Time machine
      </p>
      <p className="mt-3 text-[15px] leading-snug text-white/80 sm:text-base">You wake up to</p>
      <p className="mt-1 font-display text-[42px] leading-[0.9] tracking-tight sm:text-[56px]">
        {currency}
        {formatMoney(shownValue)}
      </p>
      <motion.p
        key={yearLabel}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        className="mt-2 text-[15px] text-white/75 sm:text-lg"
      >
        in {yearLabel}.
      </motion.p>
      <p className="mt-2 max-w-xl text-[12px] leading-relaxed text-white/50">
        Pull the years. At 12% a year, {currency}
        {formatMoney(principal)} plus {currency}
        {formatMoney(monthlySave)} every month becomes {currency}
        {formatMoney(grown)} of growth.
      </p>

      <div className="mt-6">
        <div className="flex items-end justify-between gap-3">
          <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/50">
            Years ahead
          </span>
          <span className="font-display text-2xl leading-none">{years}</span>
        </div>
        <div className="relative mt-3">
          <div className="h-1.5 overflow-hidden rounded-full bg-white/15">
            <div className="h-full rounded-full bg-white" style={{ width: `${progress}%` }} />
          </div>
          <input
            type="range"
            min={1}
            max={MAX_YEARS}
            step={1}
            value={years}
            onChange={(e) => setYears(Number(e.target.value))}
            className="time-machine-range absolute inset-0 h-6 w-full -translate-y-2 cursor-ew-resize appearance-none bg-transparent"
            aria-label="Years into the future"
          />
        </div>
        <div className="mt-1.5 flex justify-between text-[10px] font-medium uppercase tracking-[0.12em] text-white/40">
          <span>1 yr</span>
          <span>10</span>
          <span>20 yrs</span>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <label className="block rounded-sm border border-white/10 bg-white/5 p-3">
          <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/50">
            Save this much / month
          </span>
          <div className="mt-1.5 flex items-baseline gap-1">
            <span className="text-sm text-white/60">{currency}</span>
            <input
              type="number"
              min={0}
              step={10}
              value={monthlySave}
              onChange={(e) => setMonthlySave(Math.max(0, Number(e.target.value) || 0))}
              className="w-full bg-transparent font-display text-2xl leading-none text-white outline-none"
            />
          </div>
        </label>
        <label className="block rounded-sm border border-white/10 bg-white/5 p-3">
          <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/50">
            Starting amount
          </span>
          <div className="mt-1.5 flex items-baseline gap-1">
            <span className="text-sm text-white/60">{currency}</span>
            <input
              type="number"
              min={0}
              step={50}
              value={principal}
              onChange={(e) => setPrincipal(Math.max(0, Number(e.target.value) || 0))}
              className="w-full bg-transparent font-display text-2xl leading-none text-white outline-none"
            />
          </div>
        </label>
      </div>
    </div>
  );
};

export default TimeMachine;
