import * as SQLite from "expo-sqlite";
import { Platform } from "react-native";

// Helper to load the database
export async function openDatabase(
  pathToDatabaseFile: string = "portfolio.db"
): Promise<SQLite.SQLiteDatabase> {
  if (Platform.OS === "web") {
    console.warn("SQLite is not fully supported on web platform");
    return null as any;
  }

  return SQLite.openDatabaseAsync(pathToDatabaseFile);
}

// Export the database instance
let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    db = await openDatabase();
    await initializeDatabase(db);
  }
  return db;
}

// Initialize the database tables
async function initializeDatabase(
  database: SQLite.SQLiteDatabase
): Promise<void> {
  // Create tables in a transaction
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS portfolio (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      user_id TEXT NOT NULL,
      data TEXT NOT NULL,
      synced INTEGER DEFAULT 0,
      updated_at INTEGER NOT NULL
    );
    
    CREATE TABLE IF NOT EXISTS holdings (
      id TEXT PRIMARY KEY,
      portfolio_id TEXT NOT NULL,
      ticker TEXT NOT NULL,
      shares REAL NOT NULL,
      average_price REAL NOT NULL,
      data TEXT,
      synced INTEGER DEFAULT 0,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (portfolio_id) REFERENCES portfolio (id) ON DELETE CASCADE
    );
    
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      portfolio_id TEXT NOT NULL,
      ticker TEXT NOT NULL,
      shares REAL NOT NULL,
      price REAL NOT NULL,
      type TEXT NOT NULL,
      date INTEGER NOT NULL,
      notes TEXT,
      synced INTEGER DEFAULT 0,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (portfolio_id) REFERENCES portfolio (id) ON DELETE CASCADE
    );
    
    CREATE TABLE IF NOT EXISTS watchlist (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      user_id TEXT NOT NULL,
      synced INTEGER DEFAULT 0,
      updated_at INTEGER NOT NULL
    );
    
    CREATE TABLE IF NOT EXISTS watchlist_items (
      id TEXT PRIMARY KEY,
      watchlist_id TEXT NOT NULL,
      ticker TEXT NOT NULL,
      data TEXT,
      synced INTEGER DEFAULT 0,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (watchlist_id) REFERENCES watchlist (id) ON DELETE CASCADE
    );
    
    CREATE TABLE IF NOT EXISTS stock_data (
      ticker TEXT PRIMARY KEY,
      info TEXT,
      history TEXT,
      financials TEXT,
      dividends TEXT,
      updated_at INTEGER NOT NULL
    );
  `);
}
