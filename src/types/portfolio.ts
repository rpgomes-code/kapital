export interface Portfolio {
  id: string;
  name: string;
  userId: string;
  totalValue: number;
  totalCost: number;
  totalGain: number;
  totalGainPercentage: number;
  todayGain: number;
  todayGainPercentage: number;
  holdings: PortfolioHolding[];
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface PortfolioHolding {
  id: string;
  portfolioId: string;
  ticker: string;
  shares: number;
  averagePrice: number;
  currentPrice?: number;
  value?: number;
  gain?: number;
  gainPercentage?: number;
  dayChange?: number;
  dayChangePercentage?: number;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface Transaction {
  id: string;
  portfolioId: string;
  ticker: string;
  shares: number;
  price: number;
  type: "BUY" | "SELL" | "DIVIDEND";
  date: string | Date;
  notes?: string;
  createdAt: string | Date;
}
