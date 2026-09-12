import React from 'react';

type PhoneMockupProps = {
  className?: string;
};

/** In-product phone visual — keeps MoneyPilot identity without missing asset dependency. */
export const PhoneMockup: React.FC<PhoneMockupProps> = ({ className = '' }) => {
  return (
    <div
      className={`relative mx-auto w-full max-w-[320px] sm:max-w-[360px] ${className}`}
      aria-hidden={false}
    >
      <div className="relative overflow-hidden rounded-[42px] border-[6px] border-[#1a1a1a] bg-[#0f1115] shadow-[0_40px_80px_rgba(14,25,60,0.35)]">
        <div className="absolute left-1/2 top-0 z-20 h-7 w-28 -translate-x-1/2 rounded-b-2xl bg-[#1a1a1a]" />
        <div className="relative bg-[#F8F7F2] pt-10">
          <div className="flex items-center justify-between px-5 pb-3">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#747474]">
                Good afternoon
              </p>
              <p className="font-display text-[22px] leading-none text-ink">Ama</p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#4294F4] text-sm font-semibold text-white">
              A
            </div>
          </div>

          <div className="mx-4 rounded-[22px] bg-[#4294F4] p-4 text-white shadow-sm">
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-white/80">
              Total balance
            </p>
            <p className="mt-1 font-display text-[34px] leading-none tracking-tight">GHS 4,820</p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="rounded-sm bg-white/15 px-3 py-2 backdrop-blur-sm">
                <p className="text-[10px] uppercase tracking-wide text-white/70">Bank</p>
                <p className="text-sm font-semibold">GHS 3,140</p>
              </div>
              <div className="rounded-sm bg-white/15 px-3 py-2 backdrop-blur-sm">
                <p className="text-[10px] uppercase tracking-wide text-white/70">MoMo</p>
                <p className="text-sm font-semibold">GHS 1,680</p>
              </div>
            </div>
          </div>

          <div className="mt-4 px-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-ink">Safe Daily Pace</p>
              <p className="text-xs font-medium text-[#176FE8]">Today</p>
            </div>
            <div className="mt-2 rounded-sm border border-black/5 bg-white p-3">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-[11px] text-[#747474]">You can spend</p>
                  <p className="font-display text-2xl leading-none text-ink">GHS 86</p>
                </div>
                <p className="rounded-full bg-[#E9E8E3] px-2.5 py-1 text-[11px] font-semibold text-ink">
                  12 days left
                </p>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#E9E8E3]">
                <div className="h-full w-[62%] rounded-full bg-[#58A5FA]" />
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-2 px-4 pb-8">
            <p className="text-sm font-semibold text-ink">Recent</p>
            {[
              { name: 'MTN MoMo Transfer', amount: '-GHS 45', tag: 'Transfer' },
              { name: 'Kejetia Market', amount: '-GHS 28', tag: 'Food' },
              { name: 'Savings Vault', amount: '+GHS 200', tag: 'Save' },
            ].map((row) => (
              <div
                key={row.name}
                className="flex items-center justify-between rounded-sm border border-black/5 bg-white px-3 py-2.5"
              >
                <div>
                  <p className="text-sm font-medium text-ink">{row.name}</p>
                  <p className="text-[11px] text-[#747474]">{row.tag}</p>
                </div>
                <p
                  className={`text-sm font-semibold ${
                    row.amount.startsWith('+') ? 'text-[#176FE8]' : 'text-ink'
                  }`}
                >
                  {row.amount}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhoneMockup;
