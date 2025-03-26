import NetInfo from "@react-native-community/netinfo";
import { getDatabase } from "./database";
import supabase from "./supabase";

export class SyncService {
  // Check if network is available
  async isNetworkAvailable() {
    const state = await NetInfo.fetch();
    return state.isConnected && state.isInternetReachable;
  }

  // Sync all local data with Supabase
  async syncAll() {
    const isOnline = await this.isNetworkAvailable();
    if (!isOnline) {
      console.log("No network connection. Sync canceled.");
      return { success: false, message: "No network connection" };
    }

    try {
      // Get local database
      const db = await getDatabase();

      // Sync each data type
      await this.syncPortfolios(db);
      await this.syncHoldings(db);
      await this.syncTransactions(db);
      await this.syncWatchlists(db);
      await this.syncWatchlistItems(db);

      return { success: true, message: "Sync completed successfully" };
    } catch (error) {
      console.error("Error syncing data:", error);
      return {
        success: false,
        message: `Sync failed: ${(error as Error).message}`,
      };
    }
  }

  // Sync portfolios
  private async syncPortfolios(db: any) {
    // Get unsynced portfolios from local DB
    const { rows } = await db.execAsync(
      "SELECT * FROM portfolio WHERE synced = 0"
    );

    if (rows.length === 0) return;

    // Process each unsynced portfolio
    for (const portfolio of rows) {
      try {
        // Insert or update in Supabase
        const { data, error } = await supabase
          .from("portfolios")
          .upsert({
            id: portfolio.id,
            name: portfolio.name,
            user_id: portfolio.user_id,
            created_at: new Date(portfolio.created_at),
            updated_at: new Date(portfolio.updated_at),
          })
          .select()
          .single();

        if (error) throw error;

        // Mark as synced in local DB
        await db.execAsync("UPDATE portfolio SET synced = 1 WHERE id = ?", [
          portfolio.id,
        ]);
      } catch (error) {
        console.error(`Error syncing portfolio ${portfolio.id}:`, error);
      }
    }
  }

  // Sync holdings
  private async syncHoldings(db: any) {
    // Get unsynced holdings from local DB
    const { rows } = await db.execAsync(
      "SELECT * FROM holdings WHERE synced = 0"
    );

    if (rows.length === 0) return;

    // Process each unsynced holding
    for (const holding of rows) {
      try {
        // Insert or update in Supabase
        const { data, error } = await supabase
          .from("portfolio_holdings")
          .upsert({
            id: holding.id,
            portfolio_id: holding.portfolio_id,
            ticker: holding.ticker,
            shares: holding.shares,
            average_price: holding.average_price,
            created_at: new Date(holding.created_at),
            updated_at: new Date(holding.updated_at),
          })
          .select()
          .single();

        if (error) throw error;

        // Mark as synced in local DB
        await db.execAsync("UPDATE holdings SET synced = 1 WHERE id = ?", [
          holding.id,
        ]);
      } catch (error) {
        console.error(`Error syncing holding ${holding.id}:`, error);
      }
    }
  }

  // Sync transactions
  private async syncTransactions(db: any) {
    // Get unsynced transactions from local DB
    const { rows } = await db.execAsync(
      "SELECT * FROM transactions WHERE synced = 0"
    );

    if (rows.length === 0) return;

    // Process each unsynced transaction
    for (const transaction of rows) {
      try {
        // Insert or update in Supabase
        const { data, error } = await supabase
          .from("transactions")
          .upsert({
            id: transaction.id,
            portfolio_id: transaction.portfolio_id,
            ticker: transaction.ticker,
            shares: transaction.shares,
            price: transaction.price,
            type: transaction.type,
            date: new Date(transaction.date),
            notes: transaction.notes,
            created_at: new Date(transaction.created_at),
          })
          .select()
          .single();

        if (error) throw error;

        // Mark as synced in local DB
        await db.execAsync("UPDATE transactions SET synced = 1 WHERE id = ?", [
          transaction.id,
        ]);
      } catch (error) {
        console.error(`Error syncing transaction ${transaction.id}:`, error);
      }
    }
  }

  // Sync watchlists
  private async syncWatchlists(db: any) {
    // Get unsynced watchlists from local DB
    const { rows } = await db.execAsync(
      "SELECT * FROM watchlist WHERE synced = 0"
    );

    if (rows.length === 0) return;

    // Process each unsynced watchlist
    for (const watchlist of rows) {
      try {
        // Insert or update in Supabase
        const { data, error } = await supabase
          .from("watchlists")
          .upsert({
            id: watchlist.id,
            name: watchlist.name,
            user_id: watchlist.user_id,
            created_at: new Date(watchlist.created_at),
            updated_at: new Date(watchlist.updated_at),
          })
          .select()
          .single();

        if (error) throw error;

        // Mark as synced in local DB
        await db.execAsync("UPDATE watchlist SET synced = 1 WHERE id = ?", [
          watchlist.id,
        ]);
      } catch (error) {
        console.error(`Error syncing watchlist ${watchlist.id}:`, error);
      }
    }
  }

  // Sync watchlist items
  private async syncWatchlistItems(db: any) {
    // Get unsynced watchlist items from local DB
    const { rows } = await db.execAsync(
      "SELECT * FROM watchlist_items WHERE synced = 0"
    );

    if (rows.length === 0) return;

    // Process each unsynced watchlist item
    for (const item of rows) {
      try {
        // Insert or update in Supabase
        const { data, error } = await supabase
          .from("watchlist_items")
          .upsert({
            id: item.id,
            watchlist_id: item.watchlist_id,
            ticker: item.ticker,
            created_at: new Date(item.created_at),
          })
          .select()
          .single();

        if (error) throw error;

        // Mark as synced in local DB
        await db.execAsync(
          "UPDATE watchlist_items SET synced = 1 WHERE id = ?",
          [item.id]
        );
      } catch (error) {
        console.error(`Error syncing watchlist item ${item.id}:`, error);
      }
    }
  }

  // Get cached stock data
  async getCachedStockData(ticker: string) {
    try {
      const db = await getDatabase();

      // Use SQLite prepared statement for safe parameter binding
      const statement = await db.prepareAsync(`
        SELECT * FROM stock_data WHERE ticker = ?
      `);

      try {
        const result = await statement.executeAsync<any>(ticker);
        // Convert AsyncIterator to array
        const rows = [];
        for await (const row of result) {
          rows.push(row);
        }

        if (rows.length === 0) return null;

        const stockData = rows[0];

        // Parse the JSON strings back to objects
        return {
          ticker: stockData.ticker,
          info: stockData.info ? JSON.parse(stockData.info) : null,
          history: stockData.history ? JSON.parse(stockData.history) : null,
          financials: stockData.financials
            ? JSON.parse(stockData.financials)
            : null,
          dividends: stockData.dividends
            ? JSON.parse(stockData.dividends)
            : null,
          updatedAt: new Date(stockData.updated_at),
        };
      } finally {
        await statement.finalizeAsync();
      }
    } catch (error) {
      console.error(`Error getting cached stock data for ${ticker}:`, error);
      return null;
    }
  }

  // Cache stock data for offline use
  async cacheStockData(ticker: string, data: any) {
    try {
      const db = await getDatabase();

      // Stringify the data for storage
      const info = data.info ? JSON.stringify(data.info) : null;
      const history = data.history ? JSON.stringify(data.history) : null;
      const financials = data.financials
        ? JSON.stringify(data.financials)
        : null;
      const dividends = data.dividends ? JSON.stringify(data.dividends) : null;
      const timestamp = Date.now();

      // Use SQLite prepared statement for safe parameter binding
      const statement = await db.prepareAsync(`
        INSERT OR REPLACE INTO stock_data 
        (ticker, info, history, financials, dividends, updated_at) 
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      try {
        await statement.executeAsync(
          ticker,
          info,
          history,
          financials,
          dividends,
          timestamp
        );
        return true;
      } finally {
        await statement.finalizeAsync();
      }
    } catch (error) {
      console.error(`Error caching stock data for ${ticker}:`, error);
      return false;
    }
  }
}

export const syncService = new SyncService();
