export type Holding = {
  coin: string;
  coinName: string;
  logo: string;
  currentPrice: number;
  totalHolding: number;
  averageBuyPrice: number;
  stcg: { balance: number; gain: number };
  ltcg: { balance: number; gain: number };
};

export type CapitalGains = {
  stcg: { profits: number; losses: number };
  ltcg: { profits: number; losses: number };
};

export type CapitalGainsResponse = {
  capitalGains: CapitalGains;
};
