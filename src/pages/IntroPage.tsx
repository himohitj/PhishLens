import React from 'react';
import { ShieldCheck, Eye, Lock, Compass, ArrowRight } from 'lucide-react';
import { SessionStateResponse } from '../types/phishlens.ts';

interface IntroPageProps {
  session: SessionStateResponse;
  onStartBaseline: () => void;
  navigate: (path: string) => void;
}

export function IntroPage({ session, navigate }: IntroPageProps) {
  const nextSim =
    ['sim-1', 'sim-2', 'sim-3', 'sim-4', 'sim-5'].find(
      (id) => !session.completedScenarioIds.includes(id)
    ) || 'sim-1';

  return (
    <div className="flex-1 max-w-5xl w-full mx-auto px-6 py-10 space-y-8">
      <div className="bg-white border border-[#F0E7ED] rounded-2xl p-8 space-y-6 shadow-xs">
        <div className="space-y-2">
          <div className="text-xs font-bold text-[#D94F89]">
            Safety &amp; Interactive Sandbox Guide
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#24212A]">
            Interact With Realistic Interfaces — 100% Safely
          </h1>
          <p className="text-sm text-[#716B76] leading-relaxed max-w-2xl">
            PhishLens is a hands-on simulation lab, not a multiple-choice exam. You will step directly into five realistic digital environments, inspect technical clues, and see what happens when you act.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-[#FCFAFC] border border-[#F0E7ED] space-y-1.5">
            <div className="font-bold text-[#24212A] flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-[#D94F89]" />
              <span>Zero Real Credentials</span>
            </div>
            <p className="text-[#716B76] leading-relaxed">
              Never type a real password or OTP. All simulations use pre-filled fictional demo personas.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#FCFAFC] border border-[#F0E7ED] space-y-1.5">
            <div className="font-bold text-[#24212A] flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-[#D94F89]" />
              <span>Internal Sandbox Links</span>
            </div>
            <p className="text-[#716B76] leading-relaxed">
              Every email link, SMS URL, and QR code uses reserved <code className="font-mono">.example.com</code> domains and stays inside this app.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#FCFAFC] border border-[#F0E7ED] space-y-1.5">
            <div className="font-bold text-[#24212A] flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-[#D94F89]" />
              <span>Notice → Investigate → Act</span>
            </div>
            <p className="text-[#716B76] leading-relaxed">
              Click directly on sender headers, browser padlocks, and QR camera previews before choosing your action.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-[#F0E7ED]">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="text-xs font-semibold text-[#716B76] hover:text-[#24212A] cursor-pointer"
          >
            ← Back to Discover
          </button>

          <button
            type="button"
            onClick={() => navigate(`/experience/simulation/${nextSim}`)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#D94F89] hover:bg-[#C23B75] text-white text-sm font-semibold cursor-pointer shadow-xs"
          >
            <span>Launch Interactive Simulation 1</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
