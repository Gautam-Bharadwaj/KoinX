/**
 * Formats a number with K/M/B suffixes for compact display.
 */
export const formatCompact = (value: number): string => {
  const absValue = Math.abs(value);
  const sign = value < 0 ? '-' : '';

  if (absValue >= 10000000) {
    return `${sign}$ ${(absValue / 10000000).toLocaleString('en-US', { maximumFractionDigits: 2 })}M`;
  }
  if (absValue >= 100000) {
    return `${sign}$ ${(absValue / 100000).toLocaleString('en-US', { maximumFractionDigits: 2 })}L`;
  }
  if (absValue >= 1000) {
    return `${sign}$ ${(absValue / 1000).toLocaleString('en-US', { maximumFractionDigits: 2 })}K`;
  }
  return formatCurrency(value);
};

/**
 * Formats a number with full precision for tooltips.
 */
export const formatFull = (value: number, prefix: string = '$'): string => {
  const absValue = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  const space = prefix === '$' ? ' ' : '';
  return `${sign}${prefix}${space}${absValue.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 8
  })}`;
};

/**
 * Formats a number as USD ($) with a space after the symbol.
 */
export const formatCurrency = (value: number): string => {
  const absValue = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  return `${sign}$ ${absValue.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  })}`;
};

/**
 * Formats gain values with forced +/- signs and no following space.
 */
export const formatGain = (value: number): string => {
  const absValue = Math.abs(value);
  const sign = value < 0 ? '-' : '+';
  if (value === 0) return '$ 0';
  return `${sign}$${absValue.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  })}`;
};

/**
 * Formats a price value with unit and a space.
 */
export const formatPrice = (value: number, unit?: string): string => {
  const absValue = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  const suffix = unit ? `/${unit}` : '';

  const formatted = absValue < 0.01
    ? absValue.toFixed(6)
    : absValue.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

  return `${sign}$ ${formatted}${suffix}`;
};

/**
 * Formats a number to a readable holding quantity.
 */
export const formatHolding = (value: number): string => {
  if (value === 0) return '0';
  const absValue = Math.abs(value);
  if (absValue < 0.000001) return value.toExponential(4);
  if (absValue < 0.01) return value.toFixed(6);
  if (absValue < 1) return value.toFixed(4);
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};
