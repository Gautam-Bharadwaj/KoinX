export interface GainLoss {
  balance: number;
  gain: number;
}

export interface Holding {
  coin: string;
  coinName: string;
  logo: string;
  currentPrice: number;
  totalHolding: number;
  averageBuyPrice: number;
  stcg: GainLoss;
  ltcg: GainLoss;
}

export interface CapitalGainsData {
  profits: number;
  losses: number;
}

export interface CapitalGains {
  stcg: CapitalGainsData;
  ltcg: CapitalGainsData;
}

export interface CapitalGainsResponse {
  capitalGains: CapitalGains;
}
