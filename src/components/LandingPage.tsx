import React from 'react';
import { ArrowRight, Sparkles, Layout, Users, QrCode } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onLoginClick: () => void;
}

export default function LandingPage({ onGetStarted, onLoginClick }: LandingPageProps) {
  return (
    <div id="landing-page" className="w-full min-h-[calc(100vh-56px)] flex flex-col justify-between py-12 md:py-20 font-sans selection:bg-[#6C47FF]/20 selection:text-[#6C47FF]">
      
      {/* Main Container */}
      <div className="max-w-4xl mx-auto px-6 flex-1 flex flex-col justify-center space-y-16 md:space-y-24">
        
        {/* 1. Hero Section */}
        <div className="text-center space-y-6 max-w-2xl mx-auto">
          {/* Eyebrow badge */}

          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-sans font-bold tracking-tight text-neutral-900 dark:text-white leading-[1.05]">
              Create and manage event QR passes instantly
            </h1>
            <p className="text-base md:text-lg text-neutral-500 dark:text-neutral-400 font-normal leading-relaxed max-w-xl mx-auto font-sans">
              Generate attendee QR codes, track check-ins, and manage events in seconds.
            </p>
          </div>

          {/* Call to Actions & Links to /login */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onGetStarted}
              type="button"
              className="w-full sm:w-auto px-8 py-3.5 rounded-full text-sm font-semibold tracking-wide bg-[#6C47FF] hover:bg-[#5B39E0] text-white flex items-center justify-center gap-2 shadow-focus active:scale-[0.98] transition-all cursor-pointer"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onLoginClick}
              type="button"
              className="w-full sm:w-auto px-8 py-3.5 rounded-full text-sm font-semibold tracking-wide border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 bg-neutral-50 dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 active:scale-[0.98] transition-all cursor-pointer"
            >
              Sign In to Account
            </button>
          </div>
        </div>

        {/* 2. How It Works Section (Exactly 3 steps only) */}
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-[11px] font-bold tracking-widest text-[#6C47FF] uppercase font-mono">
              WORKFLOW PROCESS
            </h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              Three simple steps to generate digital entry credentials
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Step 1 */}
            <div className="bg-white dark:bg-[#222222] border border-neutral-200/30 dark:border-neutral-800/30 rounded-2xl p-6 shadow-sm flex flex-col items-start space-y-4">
              <div className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-850 flex items-center justify-center text-[#6C47FF] border border-neutral-200/30 dark:border-neutral-800/30">
                <Layout className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <div className="text-[11px] font-mono text-neutral-400 dark:text-neutral-500 font-bold uppercase">STEP 1</div>
                <h3 className="text-base font-bold text-neutral-905 dark:text-white">Create an event</h3>
                <p className="text-xs text-neutral-500 leading-relaxed font-sans mt-1">
                  Specify details including physical venue path coordinates and select a design layout template.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-white dark:bg-[#222222] border border-neutral-200/30 dark:border-neutral-800/30 rounded-2xl p-6 shadow-sm flex flex-col items-start space-y-4">
              <div className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-850 flex items-center justify-center text-[#6C47FF] border border-neutral-200/30 dark:border-neutral-800/30">
                <Users className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <div className="text-[11px] font-mono text-neutral-400 dark:text-neutral-500 font-bold uppercase">STEP 2</div>
                <h3 className="text-base font-bold text-neutral-905 dark:text-white">Add attendees</h3>
                <p className="text-xs text-neutral-500 leading-relaxed font-sans mt-1">
                  Define user tickets or import guest spreadsheets using high-fidelity CSV validation engine.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-white dark:bg-[#222222] border border-neutral-200/30 dark:border-neutral-800/30 rounded-2xl p-6 shadow-sm flex flex-col items-start space-y-4">
              <div className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-850 flex items-center justify-center text-[#6C47FF] border border-neutral-200/30 dark:border-neutral-800/30">
                <QrCode className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <div className="text-[11px] font-mono text-neutral-400 dark:text-neutral-500 font-bold uppercase">STEP 3</div>
                <h3 className="text-base font-bold text-neutral-905 dark:text-white">Generate QR passes</h3>
                <p className="text-xs text-neutral-500 leading-relaxed font-sans mt-1">
                  Export lossless PDF formats or share unique access links instantly via fast WhatsApp templates.
                </p>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* 3. Footer */}
      <div className="w-full text-center pt-8 border-t border-neutral-200/20 dark:border-neutral-800/20">
        <p className="text-xs text-neutral-400 dark:text-neutral-500 font-mono tracking-widest uppercase">
          Built by Demi for Ticss
        </p>
      </div>

    </div>
  );
}
