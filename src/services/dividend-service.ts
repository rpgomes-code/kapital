import { format } from "date-fns";
import * as FileSystem from "expo-file-system";
import { notificationService } from "./notification-service";
import { stockService } from "./stock-service";

export interface DividendEvent {
  id: string;
  ticker: string;
  companyName: string;
  exDate: string;
  paymentDate: string;
  amount: number;
  notified: boolean;
}

/**
 * Service to handle dividend tracking and notifications
 */
export class DividendService {
  private static instance: DividendService;
  private dividends: DividendEvent[] = [];
  private dividendsFilePath: string;

  constructor() {
    this.dividendsFilePath = `${FileSystem.documentDirectory}dividends.json`;
    this.loadDividends();
  }

  public static getInstance(): DividendService {
    if (!DividendService.instance) {
      DividendService.instance = new DividendService();
    }
    return DividendService.instance;
  }

  /**
   * Load tracked dividends from storage
   */
  private async loadDividends() {
    try {
      const fileInfo = await FileSystem.getInfoAsync(this.dividendsFilePath);
      if (fileInfo.exists) {
        const content = await FileSystem.readAsStringAsync(
          this.dividendsFilePath
        );
        this.dividends = JSON.parse(content);
      }
    } catch (error) {
      console.error("Error loading dividend data:", error);
      this.dividends = [];
    }
  }

  /**
   * Save dividends to storage
   */
  private async saveDividends() {
    try {
      await FileSystem.writeAsStringAsync(
        this.dividendsFilePath,
        JSON.stringify(this.dividends)
      );
    } catch (error) {
      console.error("Error saving dividend data:", error);
    }
  }

  /**
   * Get all tracked dividends
   */
  public async getDividends(): Promise<DividendEvent[]> {
    await this.loadDividends();
    return this.dividends;
  }

  /**
   * Get dividends for a specific stock
   */
  public async getStockDividends(ticker: string): Promise<DividendEvent[]> {
    await this.loadDividends();
    return this.dividends.filter((d) => d.ticker === ticker);
  }

  /**
   * Get upcoming dividends (within next 30 days)
   */
  public async getUpcomingDividends(): Promise<DividendEvent[]> {
    await this.loadDividends();

    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(now.getDate() + 30);

    return this.dividends.filter((d) => {
      const exDate = new Date(d.exDate);
      return exDate >= now && exDate <= thirtyDaysFromNow;
    });
  }

  /**
   * Fetch latest dividend information for a stock and track it
   */
  public async trackDividends(ticker: string): Promise<DividendEvent[]> {
    try {
      let stockInfo;

      // Try to get stock company name
      try {
        stockInfo = await stockService.getStockInfo(ticker);
      } catch (error) {
        console.log(
          "Error fetching stock info, using ticker as company name:",
          error
        );
        stockInfo = { shortName: ticker };
      }

      // Fetch dividend data
      const dividends = await stockService.getDividendInfo(ticker);

      if (!dividends || dividends.length === 0) {
        return [];
      }

      // Process dividend data
      const dividendEvents: DividendEvent[] = [];

      for (const div of dividends) {
        // Only process dividends that have both ex-date and payment date
        if (div.exDate && div.paymentDate) {
          const exDate = new Date(div.exDate);
          const paymentDate = new Date(div.paymentDate);

          // Skip past dividends
          if (exDate < new Date()) continue;

          const id = `${ticker}-${format(exDate, "yyyy-MM-dd")}`;

          // Check if we're already tracking this dividend
          const existingIndex = this.dividends.findIndex((d) => d.id === id);

          if (existingIndex >= 0) {
            // Update existing entry
            this.dividends[existingIndex].amount = div.amount;
            this.dividends[existingIndex].exDate = exDate.toISOString();
            this.dividends[existingIndex].paymentDate =
              paymentDate.toISOString();
          } else {
            // Create new entry
            const newDividend: DividendEvent = {
              id,
              ticker,
              companyName: stockInfo.shortName || ticker,
              exDate: exDate.toISOString(),
              paymentDate: paymentDate.toISOString(),
              amount: div.amount,
              notified: false,
            };

            this.dividends.push(newDividend);
            dividendEvents.push(newDividend);

            // Schedule notification for this dividend
            await notificationService.scheduleDividendNotification(
              { symbol: ticker, shortName: newDividend.companyName },
              exDate,
              paymentDate
            );
          }
        }
      }

      // Save updated dividends
      await this.saveDividends();

      return dividendEvents;
    } catch (error) {
      console.error("Error tracking dividends:", error);
      return [];
    }
  }

  /**
   * Track dividends for all stocks in portfolios and watchlists
   */
  public async trackAllDividends(tickers: string[]): Promise<number> {
    try {
      let addedCount = 0;

      for (const ticker of tickers) {
        const added = await this.trackDividends(ticker);
        addedCount += added.length;
      }

      return addedCount;
    } catch (error) {
      console.error("Error tracking all dividends:", error);
      return 0;
    }
  }

  /**
   * Mark a dividend as notified
   */
  public async markAsNotified(id: string): Promise<void> {
    const index = this.dividends.findIndex((d) => d.id === id);

    if (index >= 0) {
      this.dividends[index].notified = true;
      await this.saveDividends();
    }
  }

  /**
   * Remove a tracked dividend
   */
  public async removeDividend(id: string): Promise<void> {
    const index = this.dividends.findIndex((d) => d.id === id);

    if (index >= 0) {
      this.dividends.splice(index, 1);
      await this.saveDividends();
    }
  }
}

// Export singleton instance
export const dividendService = DividendService.getInstance();
