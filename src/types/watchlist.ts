import { StockInfo } from "./stock";

export interface Watchlist {
  id: string;
  name: string;
  userId: string;
  items: WatchlistItem[];
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface WatchlistItem {
  id: string;
  watchlistId: string;
  ticker: string;
  stockInfo?: StockInfo;
  createdAt: string | Date;
}
