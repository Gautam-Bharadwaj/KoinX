import React, { useEffect, useState, useCallback } from 'react';
import { CapitalGains, Holding } from './types';
import { fetchCapitalGains, fetchHoldings } from './api';
import CapitalGainsCard from './components/CapitalGainsCard';
import HoldingsTable from './components/HoldingsTable';

function App() {
  const [baseGains, setBaseGains] = useState<CapitalGains | null>(null);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [loadingGains, setLoadingGains] = useState(true);
  const [loadingHoldings, setLoadingHoldings] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCapitalGains()
      .then((res) => setBaseGains(res.capitalGains))
      .catch(() => setError('Failed to load capital gains data'))
      .finally(() => setLoadingGains(false));

    fetchHoldings()
      .then((data) => setHoldings(data))
      .catch(() => setError('Failed to load holdings data'))
      .finally(() => setLoadingHoldings(false));
  }, []);

  const computeAfterGains = useCallback((): CapitalGains => {
    if (!baseGains) return { stcg: { profits: 0, losses: 0 }, ltcg: { profits: 0, losses: 0 } };

    let stcgProfits = baseGains.stcg.profits;
    let stcgLosses = baseGains.stcg.losses;
    let ltcgProfits = baseGains.ltcg.profits;
    let ltcgLosses = baseGains.ltcg.losses;

    selected.forEach((idx) => {
      const h = holdings[idx];
      if (!h) return;
      if (h.stcg.gain > 0) stcgProfits += h.stcg.gain;
      else if (h.stcg.gain < 0) stcgLosses += Math.abs(h.stcg.gain);
      if (h.ltcg.gain > 0) ltcgProfits += h.ltcg.gain;
      else if (h.ltcg.gain < 0) ltcgLosses += Math.abs(h.ltcg.gain);
    });

    return {
      stcg: { profits: stcgProfits, losses: stcgLosses },
      ltcg: { profits: ltcgProfits, losses: ltcgLosses },
    };
  }, [baseGains, holdings, selected]);

  const handleToggle = useCallback((idx: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  }, []);

  const handleToggleAll = useCallback((selectAll: boolean) => {
    if (selectAll) setSelected(new Set(holdings.map((_, i) => i)));
    else setSelected(new Set());
  }, [holdings]);

  const handleToggleMultiple = useCallback((indices: number[], select: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      indices.forEach((idx) => {
        if (select) next.add(idx);
        else next.delete(idx);
      });
      return next;
    });
  }, []);

  const afterGains = computeAfterGains();

  const preRealised = baseGains
    ? (baseGains.stcg.profits - baseGains.stcg.losses) + (baseGains.ltcg.profits - baseGains.ltcg.losses)
    : 0;
  const postRealised = (afterGains.stcg.profits - afterGains.stcg.losses) + (afterGains.ltcg.profits - afterGains.ltcg.losses);
  const savings = preRealised > postRealised ? preRealised - postRealised : null;

  const emptyGains: CapitalGains = { stcg: { profits: 0, losses: 0 }, ltcg: { profits: 0, losses: 0 } };
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  return (
    <div className="min-h-screen bg-[#050608]">
      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="mb-10 flex items-baseline gap-4">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Tax Harvesting</h1>
          <div className="relative flex items-center">
            <button 
              className="text-[12px] font-bold text-[#3b82f6] hover:text-[#60a5fa] border-b border-[#3b82f6] leading-tight pb-0.5"
              onMouseEnter={() => setShowHowItWorks(true)}
              onMouseLeave={() => setShowHowItWorks(false)}
              onClick={() => setShowHowItWorks(!showHowItWorks)}
            >
              How it works?
            </button>
            
            {showHowItWorks && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[400px] z-50">
                <div className="relative bg-white rounded-xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.4)] text-[#1e293b]">
                  {/* Tooltip Arrow */}
                  <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white rotate-45" />
                  
                  <div className="space-y-3">
                    <div className="flex gap-2">
                       <span className="text-xs mt-1">•</span>
                       <p className="text-[13px] leading-relaxed font-medium">See your capital gains for FY 2024-25 in the <span className="font-bold">left card</span></p>
                    </div>
                    <div className="flex gap-2">
                       <span className="text-xs mt-1">•</span>
                       <p className="text-[13px] leading-relaxed font-medium">Check boxes for assets you plan on selling to <span className="font-bold">reduce your tax liability</span></p>
                    </div>
                    <div className="flex gap-2">
                       <span className="text-xs mt-1">•</span>
                       <p className="text-[13px] leading-relaxed font-medium">Instantly see your <span className="font-bold">updated tax liability</span> in the <span className="font-bold">right card</span></p>
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-100">
                       <p className="text-[13px] font-medium leading-relaxed italic">
                         <span className="font-bold">Pro tip:</span> Experiment with different combinations of your holdings to optimize your tax liability
                       </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Disclaimer Banner */}
        <div id="disclaimer-banner" className="mb-10 rounded-[8px] overflow-hidden border border-white/5 bg-[#0d1017]">
          <div 
            className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-white/[0.02]"
            onClick={() => setShowDisclaimer(!showDisclaimer)}
          >
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full border-1.5 border-blue-500/60 flex items-center justify-center text-[11px] font-bold text-blue-500/80">
                i
              </div>
              <span className="text-[14px] font-bold text-white tracking-wide">Important Notes And Disclaimers</span>
            </div>
            <svg 
              className={`w-3 h-3 text-slate-500 ${showDisclaimer ? '' : 'rotate-180'}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              style={{ transform: !showDisclaimer ? 'rotate(0deg)' : 'rotate(180deg)' }}
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
            </svg>
          </div>
          {showDisclaimer && (
            <div className="px-10 pb-6 text-[13px] text-slate-300 space-y-4">
              <div className="flex gap-2">
                <span className="mt-1">•</span>
                <p className="leading-relaxed">
                  <span className="font-bold">Price Source Disclaimer:</span> Please note that the current price of your coins may differ from the prices listed on specific exchanges. This is because we use <span className="font-bold">CoinGecko</span> as our default price source for certain exchanges, rather than fetching prices directly from the exchange.
                </p>
              </div>
              <div className="flex gap-2">
                <span className="mt-1">•</span>
                <p className="leading-relaxed">
                  <span className="font-bold">Country-specific Availability:</span> Tax loss harvesting may <span className="font-bold">not be supported in all countries.</span> We strongly recommend consulting with your local tax advisor or accountant before performing any related actions on your exchange.
                </p>
              </div>
              <div className="flex gap-2">
                <span className="mt-1">•</span>
                <p className="leading-relaxed">
                  <span className="font-bold">Utilization of Losses:</span> Tax loss harvesting typically allows you to offset capital gains. However, if you have <span className="font-bold">zero or no applicable crypto capital gains</span>, the usability of these harvested losses may be limited. Kindly confirm with your tax advisor how such losses can be applied in your situation.
                </p>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="mb-10 px-6 py-4 rounded-xl text-sm flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-100">
            <p className="font-bold">Error: {error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <CapitalGainsCard
            title="Pre Harvesting"
            gains={loadingGains ? emptyGains : baseGains!}
            variant="dark"
            loading={loadingGains}
          />
          <CapitalGainsCard
            title="After Harvesting"
            gains={loadingGains ? emptyGains : afterGains}
            variant="blue"
            savings={savings}
            loading={loadingGains}
          />
        </div>

        <div className="mb-14">
          <HoldingsTable
            holdings={holdings}
            selected={selected}
            onToggle={handleToggle}
            onToggleMultiple={handleToggleMultiple}
            onToggleAll={handleToggleAll}
            loading={loadingHoldings}
          />
        </div>
      </main>

      <footer className="max-w-7xl mx-auto px-6 py-8 border-t border-white/5 flex items-center justify-between text-slate-500 text-xs">
        <p>© 2024 KoinX Inc. All rights reserved.</p>
        <div className="flex gap-4">
          <a href="#" className="hover:text-blue-400">Terms</a>
          <a href="#" className="hover:text-blue-400">Privacy</a>
        </div>
      </footer>
    </div>
  );
}

export default App;
