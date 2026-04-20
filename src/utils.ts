export function formatCurrency(value: number, decimals = 2): string {
  const absValue = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  
  return `${sign}$${absValue.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}

export function formatCurrencyShort(value: number, decimals = 2): string {
  const absValue = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  
  if (absValue >= 1000000000) {
    return `${sign}$${(absValue / 1000000000).toLocaleString('en-US', { maximumFractionDigits: 2 })}B`;
  }
  if (absValue >= 1000000) {
    return `${sign}$${(absValue / 1000000).toLocaleString('en-US', { maximumFractionDigits: 2 })}M`;
  }
  if (absValue >= 10000) {
    return `${sign}$${(absValue / 1000).toLocaleString('en-US', { maximumFractionDigits: 2 })}K`;
  }
  
  return `${sign}$${absValue.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}

export function formatFullCurrency(value: number): string {
  return `$${value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatHolding(value: number): string {
  if (value === 0) return '0';
  if (Math.abs(value) < 1e-6) return value.toExponential(4);
  if (Math.abs(value) < 0.0001) return value.toFixed(8);
  if (Math.abs(value) < 1) return value.toFixed(6);
  return value.toLocaleString('en-US', { maximumFractionDigits: 4 });
}

export function gainClass(value: number): string {
  if (value > 0) return 'gain-positive';
  if (value < 0) return 'gain-negative';
  return 'gain-zero';
}
