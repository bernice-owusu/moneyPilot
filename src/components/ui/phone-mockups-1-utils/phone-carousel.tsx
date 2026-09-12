import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  AiScreen,
  BudgetScreen,
  GoalsScreen,
  HomeScreen,
  VaultScreen,
} from "./phone-screens";

export type PhoneScene = {
  id: string;
  alt: string;
  Screen: React.FC<{ playing: boolean }>;
};

export const moneyPilotScenes: PhoneScene[] = [
  { id: "home", alt: "Home balance and daily pace", Screen: HomeScreen },
  { id: "goals", alt: "Emergency fund filling", Screen: GoalsScreen },
  { id: "budget", alt: "Food budget updating live", Screen: BudgetScreen },
  { id: "ai", alt: "AI copilot answering a money question", Screen: AiScreen },
  { id: "vault", alt: "Locked savings vault", Screen: VaultScreen },
];

type PhoneCarouselProps = {
  scenes?: PhoneScene[];
  intervalMs?: number;
};

function wrapOffset(index: number, active: number, length: number) {
  let offset = index - active;
  if (offset > length / 2) offset -= length;
  if (offset < -length / 2) offset += length;
  return offset;
}

function IPhoneFrame({
  children,
  active,
}: {
  children: React.ReactNode;
  active: boolean;
}) {
  return (
    <div
      className={`relative h-[460px] w-[226px] rounded-[36px] bg-[#111111] p-[9px] shadow-[0_30px_70px_rgba(8,18,48,0.42)] sm:h-[520px] sm:w-[252px] ${
        active ? "ring-1 ring-white/35" : "ring-1 ring-black/20"
      }`}
    >
      <div className="absolute -left-[3px] top-[88px] h-7 w-[3px] rounded-l-sm bg-[#2b2b2b]" />
      <div className="absolute -left-[3px] top-[128px] h-12 w-[3px] rounded-l-sm bg-[#2b2b2b]" />
      <div className="absolute -left-[3px] top-[186px] h-12 w-[3px] rounded-l-sm bg-[#2b2b2b]" />
      <div className="absolute -right-[3px] top-[148px] h-[72px] w-[3px] rounded-r-sm bg-[#2b2b2b]" />
      <div className="relative h-full w-full overflow-hidden rounded-[27px] bg-[#F8F7F2]">
        {children}
        <div className="pointer-events-none absolute left-1/2 top-2.5 z-20 h-[22px] w-[84px] -translate-x-1/2 rounded-full bg-black" />
      </div>
    </div>
  );
}

export function PhoneCarousel({
  scenes = moneyPilotScenes,
  intervalMs = 4200,
}: PhoneCarouselProps) {
  const [active, setActive] = useState(0);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (scenes.length < 2) return;
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const id = window.setInterval(() => {
      setActive((current) => (current + 1) % scenes.length);
      setTick((t) => t + 1);
    }, intervalMs);

    return () => window.clearInterval(id);
  }, [scenes.length, intervalMs]);

  return (
    <div
      className="pointer-events-none relative mx-auto w-full max-w-[420px] select-none lg:ml-auto lg:mr-0 lg:max-w-[480px]"
      aria-live="polite"
      aria-label="Product screens rotating automatically"
    >
      <div
        className="relative flex h-[520px] w-full items-center justify-center sm:h-[580px]"
        style={{ perspective: 1400 }}
      >
        {scenes.map((scene, index) => {
          const offset = wrapOffset(index, active, scenes.length);
          const abs = Math.abs(offset);
          const visible = abs <= 2;
          const isActive = offset === 0;
          const Screen = scene.Screen;

          return (
            <motion.div
              key={scene.id}
              className="absolute origin-center"
              initial={false}
              animate={{
                x: offset * 104,
                rotateY: offset * -32,
                scale: isActive ? 1 : 0.78,
                z: -abs * 150,
                opacity: visible ? (isActive ? 1 : 0.55) : 0,
              }}
              transition={{ type: "spring", stiffness: 260, damping: 30 }}
              style={{
                transformStyle: "preserve-3d",
                zIndex: 20 - abs,
              }}
              aria-hidden={!isActive}
              aria-label={scene.alt}
            >
              <IPhoneFrame active={isActive}>
                {isActive ? (
                  <Screen key={`${scene.id}-${tick}`} playing />
                ) : (
                  <Screen playing={false} />
                )}
              </IPhoneFrame>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export default PhoneCarousel;
