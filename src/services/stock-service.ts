import { HistoricalData, StockInfo, TimeRange } from "../types/stock";
import api from "./api";

export class StockService {
  // Get single stock information
  async getStockInfo(symbol: string): Promise<StockInfo> {
    try {
      const response = await api.get(`/v1/ticker/${symbol}/info`);
      return response.data;
    } catch (error) {
      console.error("Error fetching stock info:", error);
      throw error;
    }
  }

  // Get historical data for a stock
  async getStockHistory(
    symbol: string,
    period: TimeRange = "1y",
    interval: string = "1d"
  ): Promise<HistoricalData[]> {
    try {
      const response = await api.get(`/v1/ticker/${symbol}/history`, {
        params: { period, interval },
      });

      // Transform the data to match our expected format
      return response.data.map((item: any) => ({
        date: new Date(item.Date || item.date),
        open: item.Open || item.open,
        high: item.High || item.high,
        low: item.Low || item.low,
        close: item.Close || item.close,
        volume: item.Volume || item.volume,
        adjClose: item["Adj Close"] || item.adjClose,
      }));
    } catch (error) {
      console.error("Error fetching stock history:", error);
      throw error;
    }
  }

  // Get information for multiple stocks
  async getMultipleStocks(
    symbols: string[]
  ): Promise<Record<string, StockInfo>> {
    try {
      const symbolsStr = symbols.join(",");
      const response = await api.get(`/v1/multi-ticker`, {
        params: { symbols: symbolsStr },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching multiple stocks:", error);
      throw error;
    }
  }

  // Search for stocks
  async searchStocks(query: string): Promise<any> {
    try {
      const response = await api.get(`/v1/search/${query}/quotes`);
      return response.data;
    } catch (error) {
      console.error("Error searching stocks:", error);
      throw error;
    }
  }

  // Get financial data
  async getFinancialData(symbol: string): Promise<any> {
    try {
      const [income, balance, cashflow] = await Promise.all([
        api.get(`/v1/ticker/${symbol}/income-stmt`),
        api.get(`/v1/ticker/${symbol}/balance-sheet`),
        api.get(`/v1/ticker/${symbol}/cash-flow`),
      ]);

      return {
        income: income.data,
        balance: balance.data,
        cashflow: cashflow.data,
      };
    } catch (error) {
      console.error("Error fetching financial data:", error);
      throw error;
    }
  }

  // Get dividend information
  async getDividendInfo(symbol: string): Promise<any> {
    try {
      const response = await api.get(`/v1/ticker/${symbol}/dividends`);
      return response.data;
    } catch (error) {
      console.error("Error fetching dividend info:", error);
      throw error;
    }
  }
}

export const stockService = new StockService();
