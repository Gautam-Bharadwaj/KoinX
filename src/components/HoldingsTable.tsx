import React, { useState, useRef, useEffect } from 'react';
import { Holding } from '../types';
import { formatCurrencyShort, formatFullCurrency, formatHolding } from '../utils';

interface Props {
  holdings: Holding[];
  selected: Set<number>;
  onToggle: (idx: number) => void;
  onToggleMultiple: (indices: number[], select: boolean) => void;
  onToggleAll: (selectAll: boolean) => void;
  loading: boolean;
}

const INITIAL_VISIBLE = 5;

const DefaultLogo: React.FC<{ coin: string }> = ({ coin }) => (
  <div
    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
    style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}
  >
    {coin.slice(0, 2).toUpperCase()}
  </div>
);

const HoldingsTable: React.FC<Props> = ({ holdings, selected, onToggle, onToggleMultiple, onToggleAll, loading }) => {
  const [showAll, setShowAll] = useState(false);
  const allSelected = holdings.length > 0 && selected.size === holdings.length;
  const someSelected = selected.size > 0 && selected.size < holdings.length;

  const headerCheckRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (headerCheckRef.current) {
      headerCheckRef.current.indeterminate = someSelected;
    }
  }, [someSelected]);



  const SkeletonRow = () => (
    <tr>
      <td className="px-4 py-4"><div className="skeleton h-4 w-4 rounded" /></td>
      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="skeleton w-8 h-8 rounded-full" />
          <div className="flex flex-col gap-1">
            <div className="skeleton h-4 w-16" />
            <div className="skeleton h-3 w-24" />
          </div>
        </div>
      </td>
      {[...Array(5)].map((_, i) => (
        <td key={i} className="px-4 py-4"><div className="skeleton h-4 w-20" /></td>
      ))}
    </tr>
  );

  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const selectByCategory = (category: 'st' | 'lt') => {
    const lossIndices = holdings
      .map((h, i) => (category === 'st' ? h.stcg.gain < 0 : h.ltcg.gain < 0) ? i : -1)
      .filter(idx => idx !== -1);

    if (lossIndices.length === 0) return;

    const allLossesSelected = lossIndices.every(idx => selected.has(idx));

    if (allLossesSelected && sortConfig?.key === (category === 'st' ? 'stcg' : 'ltcg')) {
      // Deselect all losses for this category on 2nd click
      onToggleMultiple(lossIndices, false);
      setSortConfig(null);
      return;
    }

    // Always select and sort on click
    onToggleMultiple(lossIndices, true);
    setSortConfig({ key: category === 'st' ? 'stcg' : 'ltcg', direction: 'asc' });
    setShowAll(true);
  };

  const sortedHoldings = React.useMemo(() => {
    if (!sortConfig) return holdings;
    return [...holdings].sort((a, b) => {
      // Prioritize selected items only if sorting by STCG or LTCG
      if (sortConfig.key === 'stcg' || sortConfig.key === 'ltcg') {
         const aIdx = holdings.indexOf(a);
         const bIdx = holdings.indexOf(b);
         const aSelected = selected.has(aIdx);
         const bSelected = selected.has(bIdx);
         
         if (aSelected && !bSelected) return -1;
         if (!aSelected && bSelected) return 1;
      }

      let aVal: any, bVal: any;
      switch (sortConfig.key) {
        case 'asset': aVal = a.coin; bVal = b.coin; break;
        case 'holdings': aVal = a.totalHolding; bVal = b.totalHolding; break;
        case 'price': aVal = a.currentPrice; bVal = b.currentPrice; break;
        case 'stcg': aVal = a.stcg.gain; bVal = b.stcg.gain; break;
        case 'ltcg': aVal = a.ltcg.gain; bVal = b.ltcg.gain; break;
        default: return 0;
      }
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [holdings, sortConfig, selected]);

  const visible = showAll ? sortedHoldings : sortedHoldings.slice(0, INITIAL_VISIBLE);

  return (
    <div className="rounded-[8px] overflow-hidden bg-[#0d1017] border border-white/5 shadow-2xl min-h-[600px]">
      <div className="px-8 pt-6 pb-2">
        <h2 className="text-xl font-bold text-white">Holdings</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/[0.05] bg-[#1a1e28]">
              <th className="px-6 py-6 w-12 text-left">
                <input
                  ref={headerCheckRef}
                  type="checkbox"
                  className="checkbox-custom"
                  checked={allSelected}
                  onChange={(e) => onToggleAll(e.target.checked)}
                />
              </th>
              <th 
                className="px-4 py-6 text-sm font-bold text-white cursor-pointer hover:bg-white/5 group"
                onClick={() => handleSort('asset')}
              >
                Asset
              </th>
              <th 
                className="px-4 py-6 text-center text-sm font-bold text-white cursor-pointer hover:bg-white/5 group"
                onClick={() => handleSort('holdings')}
              >
                <div className="flex flex-col items-center">
                   Holdings
                   <p className="text-[10px] font-medium text-[#64748b] uppercase tracking-tight">Avg Buy Price</p>
                </div>
              </th>
              <th 
                className="px-6 py-6 text-center text-sm font-bold text-white cursor-pointer hover:bg-white/5 group"
                onClick={() => handleSort('price')}
              >
                <div className="flex items-center justify-center gap-2">
                  Total Current Value
                </div>
              </th>
              <th 
                className="px-6 py-6 text-center text-sm font-bold text-white cursor-pointer hover:bg-white/5"
                onClick={() => selectByCategory('st')}
              >
                <div className="flex items-center justify-center gap-2">
                  <span className={`text-[10px] ${sortConfig?.key === 'stcg' ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
                    ▼
                  </span>
                  <span>Short-Term</span>
                </div>
              </th>
              <th 
                className="px-6 py-6 text-center text-sm font-bold text-white cursor-pointer hover:bg-white/5"
                onClick={() => selectByCategory('lt')}
              >
                <div className="flex items-center justify-center gap-2">
                  <span className={`text-[10px] ${sortConfig?.key === 'ltcg' ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
                    ▼
                  </span>
                  <span>Long-Term</span>
                </div>
              </th>
              <th className="px-6 py-6 text-center text-sm font-bold text-white whitespace-nowrap">Amount to Sell</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.03]">
            {loading
              ? [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
              : visible.map((h, idx) => {
                  const actualIdx = holdings.indexOf(h);
                  const isSelected = selected.has(actualIdx);
                  const stcgGain = h.stcg.gain;
                  const ltcgGain = h.ltcg.gain;

                  return (
                    <tr
                      key={h.coin}
                      className={`${isSelected ? 'bg-blue-600/[0.08]' : 'hover:bg-white/[0.02]'}`}
                    >
                      <td className="px-6 py-5">
                        <input
                          type="checkbox"
                          className="checkbox-custom"
                          checked={isSelected}
                          onChange={() => onToggle(actualIdx)}
                        />
                      </td>

                      {/* Asset */}
                      <td className="px-4 py-5 cursor-pointer" onClick={() => onToggle(actualIdx)}>
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-slate-800 flex-shrink-0 flex items-center justify-center overflow-hidden border border-white/10">
                            <img
                              src={h.logo}
                              alt={h.coin}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.visibility = 'hidden';
                              }}
                            />
                          </div>
                          <div>
                            <p className="font-bold text-white text-[15px] leading-tight mb-0.5">{h.coinName}</p>
                            <p className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">{h.coin}</p>
                          </div>
                        </div>
                      </td>

                      {/* Holdings / Avg Buy */}
                      <td className="px-4 py-5 text-center">
                        <p className="font-bold text-white text-sm">{formatHolding(h.totalHolding)} {h.coin}</p>
                        <p className="text-[10px] font-bold text-[#64748b] mt-0.5">
                          ${h.averageBuyPrice.toLocaleString()}/{h.coin}
                        </p>
                      </td>

                      {/* Current Price */}
                      <td className="px-6 py-5 text-center">
                        <div className="relative group/price inline-block mx-auto">
                          <p className="font-bold text-white text-sm cursor-pointer tabular-nums">{formatCurrencyShort(h.currentPrice)}</p>
                          
                          {/* Tooltip */}
                          <div className="absolute bottom-[110%] left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover/price:opacity-100 pointer-events-none z-50">
                            <div className="relative bg-white text-[#1e293b] text-sm font-bold px-4 py-2 rounded-lg shadow-xl whitespace-nowrap">
                              {formatFullCurrency(h.currentPrice)}
                              {/* Arrow */}
                              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rotate-45" />
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* STCG */}
                      <td className="px-6 py-5 text-center">
                        <div className="relative group/stcg inline-block mx-auto">
                          <p className={`font-bold text-sm tabular-nums cursor-pointer ${stcgGain >= 0 ? 'text-[#00C076]' : 'text-[#FF4D4D]'}`}>
                            {stcgGain >= 0 ? '+' : ''}{formatCurrencyShort(stcgGain)}
                          </p>
                          {/* Tooltip */}
                          <div className="absolute bottom-[110%] left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover/stcg:opacity-100 pointer-events-none z-50">
                            <div className="relative bg-white text-[#1e293b] text-sm font-bold px-4 py-2 rounded-lg shadow-xl whitespace-nowrap">
                              {formatFullCurrency(stcgGain)}
                              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rotate-45" />
                            </div>
                          </div>
                        </div>
                        <p className="text-[10px] font-bold text-[#64748b] mt-1 tabular-nums">
                          {formatHolding(h.stcg.balance)} {h.coin}
                        </p>
                      </td>

                      {/* LTCG */}
                      <td className="px-6 py-5 text-center">
                        <div className="relative group/ltcg inline-block mx-auto">
                          <p className={`font-bold text-sm tabular-nums cursor-pointer ${ltcgGain === 0 ? 'text-white' : ltcgGain > 0 ? 'text-[#00C076]' : 'text-[#FF4D4D]'}`}>
                            {formatCurrencyShort(ltcgGain)}
                          </p>
                          {/* Tooltip */}
                          <div className="absolute bottom-[110%] left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover/ltcg:opacity-100 pointer-events-none z-50">
                            <div className="relative bg-white text-[#1e293b] text-sm font-bold px-4 py-2 rounded-lg shadow-xl whitespace-nowrap">
                              {formatFullCurrency(ltcgGain)}
                              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rotate-45" />
                            </div>
                          </div>
                        </div>
                        <p className="text-[10px] font-bold text-[#64748b] mt-1 tabular-nums">
                          {formatHolding(h.ltcg.balance)} {h.coin}
                        </p>
                      </td>

                      {/* Amount to Sell */}
                       <td className="px-6 py-5 text-center">
                         {isSelected ? (
                           <div className="flex flex-col items-center">
                             <p className="text-white text-sm font-bold">{formatHolding(h.totalHolding)} {h.coin}</p>
                             <button onClick={(e) => { e.stopPropagation(); onToggle(actualIdx); }} className="text-[9px] font-bold text-blue-500 uppercase mt-1 hover:underline tracking-widest">Cancel</button>
                           </div>
                         ) : (
                           <span className="text-[#334155] font-bold">-</span>
                         )}
                      </td>
                    </tr>
                  );
                })}
          </tbody>
        </table>
      </div>

      {!loading && holdings.length > INITIAL_VISIBLE && (
        <div className="px-8 py-5 flex justify-start border-t border-white/[0.05]">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowAll(!showAll);
            }}
            className="text-xs font-bold text-slate-500 hover:text-white uppercase tracking-[0.2em]"
          >
            {showAll ? 'Show Less' : `View All ${holdings.length} Assets`}
          </button>
        </div>
      )}
    </div>
  );
};

export default HoldingsTable;
