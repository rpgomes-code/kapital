export interface StockInfo {
    symbol: string;
    shortName: string;
    longName?: string;
    regularMarketPrice: number;
    regularMarketChange: number;
    regularMarketChangePercent: number;
    regularMarketOpen?: number;
    regularMarketDayHigh?: number;
    regularMarketDayLow?: number;
    regularMarketVolume?: number;
    marketCap?: number;
    exchange?: string;
    currency?: string;
  }
  
  export interface HistoricalData {
    date: string | Date;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    adjClose?: number;
  }
  
  export interface Dividend {
    date: string | Date;
    amount: number;
  }
  
  export interface FinancialData {
    income: any;
    balance: any;
    cashflow: any;
  }
  
  export type TimeRange = '1d' | '1w' | '1m' | '3m' | '6m' | '1y' | 'ytd' | 'max';