import NetInfo from "@react-native-community/netinfo";
import * as FileSystem from "expo-file-system";
import { StockInfo } from "../types/stock";
import { Watchlist } from "../types/watchlist";
import { getDatabase } from "./database";

export class OfflineService {
  private static instance: OfflineService;
  private isOnline: boolean = true;
  private syncQueue: any[] = [];
  private lastSyncTime: number = 0;

  constructor() {
    this.setupNetworkListener();
    this.loadSyncQueue();
  }

  public static getInstance(): OfflineService {
    if (!OfflineService.instance) {
      OfflineService.instance = new OfflineService();
    }
    return OfflineService.instance;
  }

  private setupNetworkListener() {
    NetInfo.addEventListener((state) => {
      const wasOffline = !this.isOnline;
      this.isOnline = state.isConnected || false;

      // If we just came back online, try to sync
      if (wasOffline && this.isOnline) {
        this.processSyncQueue();
      }
    });
  }

  private async loadSyncQueue() {
    try {
      const queuePath = `${FileSystem.documentDirectory}syncQueue.json`;
      const fileExists = await FileSystem.getInfoAsync(queuePath);

      if (fileExists.exists) {
        const queueData = await FileSystem.readAsStringAsync(queuePath);
        this.syncQueue = JSON.parse(queueData);
      }
    } catch (error) {
      console.error("Error loading sync queue:", error);
    }
  }

  private async saveSyncQueue() {
    try {
      const queuePath = `${FileSystem.documentDirectory}syncQueue.json`;
      await FileSystem.writeAsStringAsync(
        queuePath,
        JSON.stringify(this.syncQueue)
      );
    } catch (error) {
      console.error("Error saving sync queue:", error);
    }
  }

  /**
   * Process pending operations in the sync queue
   */
  public async processSyncQueue() {
    if (!this.isOnline || this.syncQueue.length === 0) {
      return;
    }

    const currentQueue = [...this.syncQueue];
    this.syncQueue = [];
    await this.saveSyncQueue();

    for (const operation of currentQueue) {
      try {
        await this.performSyncOperation(operation);
      } catch (error) {
        console.error("Error processing sync operation:", error);
        // Put failed operations back in the queue
        this.syncQueue.push(operation);
        await this.saveSyncQueue();
      }
    }

    this.lastSyncTime = Date.now();
  }

  /**
   * Add an operation to the sync queue
   */
  public async addToSyncQueue(operation: any) {
    this.syncQueue.push({
      ...operation,
      timestamp: Date.now(),
    });

    await this.saveSyncQueue();

    // Try to process immediately if online
    if (this.isOnline) {
      await this.processSyncQueue();
    }
  }

  /**
   * Check if we're currently online
   */
  public isNetworkAvailable(): boolean {
    return this.isOnline;
  }

  /**
   * Save portfolio data for offline use
   */
  public async savePortfolioData(portfolioData: any) {
    try {
      const db = await getDatabase();

      // Begin transaction
      await db.execAsync("BEGIN TRANSACTION");
      try {
        // For each portfolio
        for (const portfolio of portfolioData) {
          // Save portfolio
          const portfolioStmt = await db.prepareAsync(
            `INSERT OR REPLACE INTO portfolio (id, name, user_id, data, synced, updated_at) 
             VALUES (?, ?, ?, ?, ?, ?)`
          );
          await portfolioStmt.executeAsync([
            portfolio.id,
            portfolio.name,
            portfolio.userId,
            JSON.stringify(portfolio),
            1,
            Date.now(),
          ]);
          await portfolioStmt.finalizeAsync();

          // Save holdings
          for (const holding of portfolio.holdings) {
            const holdingStmt = await db.prepareAsync(
              `INSERT OR REPLACE INTO holdings (id, portfolio_id, ticker, shares, average_price, data, synced, updated_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
            );
            await holdingStmt.executeAsync([
              holding.id,
              portfolio.id,
              holding.ticker,
              holding.shares,
              holding.averagePrice,
              JSON.stringify(holding),
              1,
              Date.now(),
            ]);
            await holdingStmt.finalizeAsync();
          }
        }
        await db.execAsync("COMMIT");
      } catch (error) {
        await db.execAsync("ROLLBACK");
        throw error;
      }
    } catch (error) {
      console.error("Error saving portfolio data:", error);
    }
  }

  /**
   * Load portfolio data from offline storage
   */
  public async loadPortfolioData() {
    try {
      const db = await getDatabase();
      const portfolios = [];

      // Get portfolios using prepared statement
      const stmt = await db.prepareAsync(
        `SELECT * FROM portfolio ORDER BY updated_at DESC`
      );
      const result = await stmt.executeAsync();

      for await (const row of result) {
        const portfolio = row as any;

        // Parse the stored JSON data
        if (portfolio.data) {
          try {
            const parsedData = JSON.parse(portfolio.data);
            Object.assign(portfolio, parsedData);
          } catch (e) {
            console.error("Error parsing portfolio data:", e);
          }
        }

        // Get holdings for this portfolio
        const holdingsStmt = await db.prepareAsync(
          `SELECT * FROM holdings WHERE portfolio_id = ? ORDER BY updated_at DESC`
        );
        const holdingsResult = await holdingsStmt.executeAsync([portfolio.id]);
        portfolio.holdings = [];

        for await (const holding of holdingsResult) {
          const typedHolding = holding as any;
          if (typedHolding.data) {
            try {
              const parsedData = JSON.parse(typedHolding.data);
              portfolio.holdings.push({ ...typedHolding, ...parsedData });
            } catch (e) {
              console.error("Error parsing holding data:", e);
              portfolio.holdings.push(typedHolding);
            }
          } else {
            portfolio.holdings.push(typedHolding);
          }
        }

        await holdingsStmt.finalizeAsync();
        portfolios.push(portfolio);
      }

      await stmt.finalizeAsync();
      return portfolios;
    } catch (error) {
      console.error("Error loading portfolio data:", error);
      return [];
    }
  }

  /**
   * Save watchlist data for offline use
   */
  public async saveWatchlistData(watchlistData: any) {
    try {
      const db = await getDatabase();

      // Begin transaction
      await db.execAsync("BEGIN TRANSACTION");
      try {
        // For each watchlist
        for (const watchlist of watchlistData) {
          // Save watchlist
          const watchlistStmt = await db.prepareAsync(
            `INSERT OR REPLACE INTO watchlist (id, name, user_id, synced, updated_at) 
             VALUES (?, ?, ?, ?, ?)`
          );
          await watchlistStmt.executeAsync([
            watchlist.id,
            watchlist.name,
            watchlist.userId,
            1,
            Date.now(),
          ]);
          await watchlistStmt.finalizeAsync();

          // Save watchlist items
          for (const item of watchlist.items) {
            const itemStmt = await db.prepareAsync(
              `INSERT OR REPLACE INTO watchlist_items (id, watchlist_id, ticker, data, synced, created_at)
               VALUES (?, ?, ?, ?, ?, ?)`
            );
            await itemStmt.executeAsync([
              item.id,
              watchlist.id,
              item.ticker,
              JSON.stringify(item),
              1,
              Date.now(),
            ]);
            await itemStmt.finalizeAsync();
          }
        }
        await db.execAsync("COMMIT");
      } catch (error) {
        await db.execAsync("ROLLBACK");
        throw error;
      }
    } catch (error) {
      console.error("Error saving watchlist data:", error);
    }
  }

  /**
   * Load watchlist data from offline storage
   */
  public async loadWatchlistData() {
    try {
      const db = await getDatabase();
      const watchlists = [];

      // Get watchlists using prepared statement
      const stmt = await db.prepareAsync(
        `SELECT * FROM watchlist ORDER BY updated_at DESC`
      );

      const result = await stmt.executeAsync();
      for await (const row of result) {
        const typedRow = row as Record<string, unknown>;
        const watchlist: Watchlist = {
          id: typedRow.id as string,
          name: typedRow.name as string,
          userId: typedRow.user_id as string,
          items: [],
          createdAt: new Date(typedRow.created_at as number),
          updatedAt: new Date(typedRow.updated_at as number),
        };

        // Get items for this watchlist
        const itemsStmt = await db.prepareAsync(
          `SELECT * FROM watchlist_items WHERE watchlist_id = ? ORDER BY created_at DESC`
        );
        const itemsResult = await itemsStmt.executeAsync([watchlist.id]);

        // Process each item
        for await (const item of itemsResult) {
          const typedItem = item as Record<string, unknown>;
          const parsedData = typedItem.data
            ? (JSON.parse(typedItem.data as string) as Record<string, unknown>)
            : {};
          watchlist.items.push({
            id: typedItem.id as string,
            watchlistId: typedItem.watchlist_id as string,
            ticker: typedItem.ticker as string,
            stockInfo: parsedData.stockInfo as StockInfo,
            createdAt: new Date(typedItem.created_at as number),
          });
        }

        await itemsStmt.finalizeAsync();
        watchlists.push(watchlist);
      }

      await stmt.finalizeAsync();
      return watchlists;
    } catch (error) {
      console.error("Error loading watchlist data:", error);
      return [];
    }
  }

  /**
   * Save stock data for offline access
   */
  public async saveStockData(ticker: string, data: any) {
    try {
      const db = await getDatabase();
      const stmt = await db.prepareAsync(
        `INSERT OR REPLACE INTO stock_data (ticker, info, updated_at)
         VALUES (?, ?, ?)`
      );
      await stmt.executeAsync([ticker, JSON.stringify(data), Date.now()]);
      await stmt.finalizeAsync();
    } catch (error) {
      console.error("Error saving stock data:", error);
    }
  }

  /**
   * Load stock data from offline storage
   */
  public async loadStockData(ticker: string) {
    try {
      const db = await getDatabase();
      const stmt = await db.prepareAsync(
        `SELECT * FROM stock_data WHERE ticker = ?`
      );
      const result = await stmt.executeAsync([ticker]);

      for await (const row of result) {
        const typedRow = row as { info: string };
        if (typedRow.info) {
          try {
            return JSON.parse(typedRow.info);
          } catch (e) {
            console.error("Error parsing stock data:", e);
          }
        }
      }

      await stmt.finalizeAsync();
      return null;
    } catch (error) {
      console.error("Error loading stock data:", error);
      return null;
    }
  }

  /**
   * Perform a sync operation against the backend
   */
  private async performSyncOperation(operation: any) {
    // This would implement the actual sync with your Supabase backend
    // depending on the operation type (e.g., add/update/delete portfolio, holding, etc.)
    console.log("Syncing operation:", operation);

    // For now, just pretend it succeeded
    return true;
  }
}

// Export a singleton instance
export const offlineService = OfflineService.getInstance();
