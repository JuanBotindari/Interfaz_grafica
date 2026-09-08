"use client";

import { Activity, ShieldAlert, Cpu } from "lucide-react";

export function Header() {
  return (
    <header className="w-full h-12 bg-[#07090e] border-b border-slate-800/80 px-4 flex items-center justify-between text-xs text-slate-300 z-40 select-none">
      <div className="flex items-center gap-3">
        <Cpu className="size-4 text-cyan-400 animate-pulse" />
        <span className="font-bold tracking-widest text-zinc-100 font-mono">
          BENNETT OS // COMMAND CENTER
        </span>
      </div>

      <div className="flex items-center gap-6 font-mono text-[10px]">
        <div className="flex items-center gap-2 text-emerald-400">
          <Activity className="size-3" />
          <span>SYSTEM: ONLINE</span>
        </div>
        <div className="flex items-center gap-2 text-slate-400">
          <ShieldAlert className="size-3 text-cyan-500" />
          <span>MODE: AUTONOMOUS</span>
        </div>
      </div>
    </header>
  );
}