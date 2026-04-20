import React from 'react';
import { CapitalGains } from '../types';
import { formatCurrency } from '../utils';

interface Props {
  title: string;
  gains: CapitalGains;
  variant: 'dark' | 'blue';
  savings?: number | null;
  loading?: boolean;
}

function SkeletonLine({ width = 'w-24' }: { width?: string }) {
  return <div className={`skeleton h-4 ${width}`} />;
}

const CapitalGainsCard: React.FC<Props> = ({ title, gains, variant, savings, loading }) => {
  const stcgNet = gains.stcg.profits - gains.stcg.losses;
  const ltcgNet = gains.ltcg.profits - gains.ltcg.losses;
  const realised = stcgNet + ltcgNet;

  const isDark = variant === 'dark';

  return (
    <div
      className={`rounded-[8px] px-8 py-6 flex flex-col ${
        isDark 
          ? 'bg-[#121620] border border-white/5' 
          : 'bg-gradient-to-br from-[#1e69ff] to-[#0047ff] shadow-[0_20px_50px_rgba(30,105,255,0.3)]'
      }`}
    >
      <h2 className="text-xl font-bold mb-6 text-white">{title}</h2>

      <div className="flex flex-col gap-4">
        {/* Header Row */}
        <div className="grid grid-cols-12 text-[11px] font-bold uppercase tracking-widest text-white">
          <div className="col-span-6" />
          <div className="col-span-3 text-right">Short-term</div>
          <div className="col-span-3 text-right">Long-term</div>
        </div>

        {/* Profits Row */}
        <div className="grid grid-cols-12 items-center">
          <div className="col-span-6 text-sm font-medium text-white">Profits</div>
          <div className="col-span-3 text-right text-sm font-bold text-white tabular-nums">
            {loading ? <div className="skeleton h-5 w-20 ml-auto" /> : formatCurrency(gains.stcg.profits)}
          </div>
          <div className="col-span-3 text-right text-sm font-bold text-white tabular-nums">
            {loading ? <div className="skeleton h-5 w-20 ml-auto" /> : formatCurrency(gains.ltcg.profits)}
          </div>
        </div>

        {/* Losses Row */}
        <div className="grid grid-cols-12 items-center">
          <div className="col-span-6 text-sm font-medium text-white">Losses</div>
          <div className="col-span-3 text-right text-sm font-bold text-white tabular-nums">
            {loading ? <div className="skeleton h-5 w-20 ml-auto" /> : formatCurrency(gains.stcg.losses)}
          </div>
          <div className="col-span-3 text-right text-sm font-bold text-white tabular-nums">
            {loading ? <div className="skeleton h-5 w-20 ml-auto" /> : formatCurrency(gains.ltcg.losses)}
          </div>
        </div>

        {/* Net Row */}
        <div className="grid grid-cols-12 items-center">
          <div className="col-span-6 text-sm font-medium text-white">Net Capital Gains</div>
          <div className="col-span-3 text-right text-sm font-bold text-white tabular-nums">
            {loading ? <div className="skeleton h-5 w-20 ml-auto" /> : formatCurrency(stcgNet)}
          </div>
          <div className="col-span-3 text-right text-sm font-bold text-white tabular-nums">
            {loading ? <div className="skeleton h-5 w-20 ml-auto" /> : formatCurrency(ltcgNet)}
          </div>
        </div>
      </div>

      <div className="mt-8 pt-5 border-t border-white/[0.08] flex items-center justify-between">
        <span className="text-base font-bold text-white">
          {isDark ? 'Realised Capital Gains:' : 'Effective Capital Gains:'}
        </span>
        <div className="text-2xl font-bold tracking-tight text-white tabular-nums">
          {loading ? <div className="skeleton h-8 w-40" /> : formatCurrency(realised)}
        </div>
      </div>

      <div className="h-6 mt-6 overflow-hidden">
        {savings !== null && savings !== undefined && savings > 0 && !isDark && (
          <div className="text-[13px] font-bold text-white flex items-center gap-2">
            <span className="text-[#fbbf24]">💡</span>
            <span className="opacity-90">You are going to save up to:</span>
            <span className="text-[#fbbf24] tabular-nums">{formatCurrency(savings)}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default CapitalGainsCard;
