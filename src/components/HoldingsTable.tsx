import { useState, useRef } from 'react';
import type { Holding } from '../types';
import { formatHolding, formatPrice, formatCompact, formatFull, formatGain } from '../utils/formatters';
import '../styles/HoldingsTable.css';

interface Props {
  holdings: Holding[];
  selectedIndices: number[];
  setSelectedIndices: React.Dispatch<React.SetStateAction<number[]>>;
  toggleHolding: (index: number) => void;
  selectAll: () => void;
  deselectAll: () => void;
}

const ValueWithTooltip = ({
  value,
  prefix = '$',
  compact = true,
  className = '',
  isGain = false,
  unit = ''
}: {
  value: number,
  prefix?: string,
  compact?: boolean,
  className?: string,
  isGain?: boolean,
  unit?: string
}) => {
  let displayValue = '';
  if (isGain) {
    displayValue = formatGain(value);
  } else if (compact) {
    displayValue = formatCompact(value);
  } else {
    displayValue = formatPrice(value, unit);
  }

  const fullValue = formatFull(value, prefix) + (unit ? `/${unit}` : '');

  return (
    <div className={`value-tooltip-container ${className}`}>
      {displayValue}
      <div className="value-tooltip">
        {fullValue}
        <div className="value-tooltip__beak"></div>
      </div>
    </div>
  );
};

export default function HoldingsTable({ holdings = [], selectedIndices = [], setSelectedIndices, toggleHolding, selectAll, deselectAll }: Props) {
  const [showAll, setShowAll] = useState(false);
  // 'none' = default order (no special sort active), 'stcg' or 'ltcg' = that column's losses sorted to top
  const [activeFilter, setActiveFilter] = useState<'none' | 'stcg' | 'ltcg'>('none');
  // Store the selection state before a filter was applied so we can restore it
  const savedSelectionRef = useRef<number[]>([]);

  const INITIAL_COUNT = 6;
  const allSelected = holdings.length > 0 && selectedIndices.length === holdings.length;

  const handleColumnClick = (column: 'stcg' | 'ltcg') => {
    if (activeFilter === column) {
      // Second click — reset to default: restore previous selection + remove sort
      setSelectedIndices(savedSelectionRef.current);
      setActiveFilter('none');
    } else {
      // First click — save current selection, select loss items, sort losses to top
      savedSelectionRef.current = [...selectedIndices];
      const lossIndices = holdings
        .map((h, i) => h[column].gain < 0 ? i : -1)
        .filter(i => i !== -1);
      // Merge: keep existing selected + add loss indices
      const merged = [...new Set([...selectedIndices, ...lossIndices])];
      setSelectedIndices(merged);
      setActiveFilter(column);
      setShowAll(true);
    }
  };

  // Sorting logic: when a filter is active, losses for that column come first
  const sorted = [...holdings]
    .map((h, i) => ({ ...h, _origIdx: i }))
    .sort((a, b) => {
      if (activeFilter === 'stcg' || activeFilter === 'ltcg') {
        const aLoss = a[activeFilter].gain < 0;
        const bLoss = b[activeFilter].gain < 0;
        if (aLoss && !bLoss) return -1;
        if (!aLoss && bLoss) return 1;
        // Within losses, most negative first
        if (aLoss && bLoss) return a[activeFilter].gain - b[activeFilter].gain;
      }
      return 0; // keep original order for non-loss items
    });

  const visible = showAll ? sorted : sorted.slice(0, INITIAL_COUNT);

  return (
    <section className="ht">
      <div className="ht__title-row">
        <h2 className="ht__title">Holdings</h2>
      </div>

      <div className="ht__wrapper">
        <table className="ht__table">
          <thead>
            <tr className="ht__header">
              <th className="ht__th ht__th--checkbox">
                <div className="ht__checkbox-wrapper" onClick={(e) => { e.stopPropagation(); allSelected ? deselectAll() : selectAll(); }}>
                  <input
                    type="checkbox"
                    readOnly
                    checked={allSelected}
                    className="ht__checkbox"
                  />
                  <div className={`ht__checkmark ${allSelected ? 'is-checked' : ''}`}>
                    {allSelected && <svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>}
                  </div>
                </div>
              </th>
              <th className="ht__th ht__th--asset">Asset</th>
              <th className="ht__th">
                Holdings
                <div className="ht__th-sub">Current Market Rate</div>
              </th>
              <th className="ht__th">Total Current Value</th>
              <th className={`ht__th ht__th--sortable ${activeFilter === 'stcg' ? 'ht__th--active' : ''}`} onClick={() => handleColumnClick('stcg')}>
                <div className="ht__th-content">
                  {activeFilter === 'stcg' && (
                    <svg className="ht__sort-arrow asc" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M7 10l5 5 5-5z" />
                    </svg>
                  )}
                  Short-term
                </div>
              </th>
              <th className={`ht__th ht__th--sortable ${activeFilter === 'ltcg' ? 'ht__th--active' : ''}`} onClick={() => handleColumnClick('ltcg')}>
                <div className="ht__th-content">
                  {activeFilter === 'ltcg' && (
                    <svg className="ht__sort-arrow asc" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M7 10l5 5 5-5z" />
                    </svg>
                  )}
                  Long-Term
                </div>
              </th>
              <th className="ht__th">Amount to Sell</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((h) => {
              const origIdx = h._origIdx;
              const selected = selectedIndices.includes(origIdx);
              const price = h.currentPrice || 0;
              const totalHolding = h.totalHolding || 0;
              const stcgGain = h.stcg?.gain ?? 0;
              const ltcgGain = h.ltcg?.gain ?? 0;

              return (
                <tr
                  key={`${h.coin}-${origIdx}`}
                  className={`ht__row ${selected ? 'ht__row--selected' : ''}`}
                  onClick={() => toggleHolding(origIdx)}
                >
                  <td className="ht__cell ht__cell--checkbox" onClick={e => e.stopPropagation()}>
                    <div className="ht__checkbox-wrapper" onClick={() => toggleHolding(origIdx)}>
                      <input type="checkbox" readOnly checked={selected} className="ht__checkbox" />
                      <div className={`ht__checkmark ${selected ? 'is-checked' : ''}`}>
                        {selected && <svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>}
                      </div>
                    </div>
                  </td>
                  <td className="ht__cell">
                    <div className="ht__asset">
                      <img src={h.logo} className="ht__asset-logo" alt="" />
                      <div className="ht__asset-info">
                        <span className="ht__asset-name">{h.coinName}</span>
                        <span className="ht__asset-symbol">{h.coin}</span>
                      </div>
                    </div>
                  </td>
                  <td className="ht__cell">
                    <div className="ht__cell-stack">
                      <span className="ht__holdings-amount">{formatHolding(totalHolding)} {h.coin}</span>
                      <ValueWithTooltip value={price} unit={h.coin} compact={false} className="ht__holdings-rate-tooltip" />
                    </div>
                  </td>
                  <td className="ht__cell">
                    <div className="ht__cell-stack">
                      <ValueWithTooltip value={totalHolding * price} className="ht__total-value" />
                    </div>
                  </td>
                  <td className="ht__cell">
                    <div className="ht__cell-stack">
                      <ValueWithTooltip
                        value={stcgGain}
                        isGain={true}
                        className={stcgGain < 0 ? 'ht__gain--loss' : stcgGain > 0 ? 'ht__gain--profit' : 'ht__gain--zero'}
                      />
                      <span className="ht__holdings-rate">
                        {h.stcg?.balance != null ? formatHolding(h.stcg.balance) : '0'} {h.coin}
                      </span>
                    </div>
                  </td>
                  <td className="ht__cell">
                    <div className="ht__cell-stack">
                      <ValueWithTooltip
                        value={ltcgGain}
                        isGain={true}
                        className={ltcgGain < 0 ? 'ht__gain--loss' : ltcgGain > 0 ? 'ht__gain--profit' : 'ht__gain--zero'}
                      />
                      <span className="ht__holdings-rate">
                        {h.ltcg?.balance != null ? formatHolding(h.ltcg.balance) : '0'} {h.coin}
                      </span>
                    </div>
                  </td>
                  <td className="ht__cell">
                    <div className="ht__cell-stack">
                      <span className="ht__sell-amount">{selected ? `${formatHolding(totalHolding)} ${h.coin}` : '–'}</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {holdings.length > INITIAL_COUNT && (
          <button className="ht__view-toggle" onClick={() => setShowAll(!showAll)}>
            {showAll ? 'Show less' : 'View all'}
          </button>
        )}
      </div>
    </section>
  );
}
