import { create } from "zustand";
import { stockService } from "../services/stock-service";
import supabase from "../services/supabase";
import { Watchlist, WatchlistItem } from "../types/watchlist";

interface WatchlistState {
  watchlists: Watchlist[];
  activeWatchlist: Watchlist | null;
  watchlistStocks: any[];
  isLoading: boolean;
  error: string | null;

  // Actions
  loadWatchlists: () => Promise<void>;
  createWatchlist: (name: string) => Promise<void>;
  updateWatchlist: (id: string, name: string) => Promise<void>;
  deleteWatchlist: (id: string) => Promise<void>;
  setActiveWatchlist: (id: string) => void;

  // Watchlist item actions
  addToWatchlist: (watchlistId: string, ticker: string) => Promise<void>;
  removeFromWatchlist: (watchlistItemId: string) => Promise<void>;
}

export const useWatchlistStore = create<WatchlistState>((set, get) => ({
  watchlists: [],
  activeWatchlist: null,
  watchlistStocks: [],
  isLoading: false,
  error: null,

  loadWatchlists: async () => {
    set({ isLoading: true, error: null });
    try {
      // Get user watchlists from Supabase
      const { data: watchlistsData, error } = await supabase
        .from("watchlists")
        .select("*");

      if (error) throw error;

      if (!watchlistsData || watchlistsData.length === 0) {
        set({
          watchlists: [],
          activeWatchlist: null,
          watchlistStocks: [],
          isLoading: false,
        });
        return;
      }

      // Get items for each watchlist
      const watchlistsWithItems = await Promise.all(
        watchlistsData.map(async (watchlist) => {
          const { data: itemsData, error: itemsError } = await supabase
            .from("watchlist_items")
            .select("*")
            .eq("watchlist_id", watchlist.id);

          if (itemsError) throw itemsError;

          const items: WatchlistItem[] = itemsData || [];

          return {
            id: watchlist.id,
            name: watchlist.name,
            userId: watchlist.user_id,
            items,
            createdAt: watchlist.created_at,
            updatedAt: watchlist.updated_at,
          };
        })
      );

      // Set the active watchlist to the first one
      const activeWatchlist = watchlistsWithItems[0] || null;

      // Fetch stock data for the active watchlist
      let stocks: any[] = [];
      if (activeWatchlist && activeWatchlist.items.length > 0) {
        const tickers = activeWatchlist.items.map((item) => item.ticker);
        const stocksData = await stockService.getMultipleStocks(tickers);

        stocks = Object.values(stocksData);
      }

      set({
        watchlists: watchlistsWithItems,
        activeWatchlist,
        watchlistStocks: stocks,
        isLoading: false,
      });
    } catch (error) {
      console.error("Error loading watchlists:", error);
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  createWatchlist: async (name: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from("watchlists")
        .insert({ name })
        .select()
        .single();

      if (error) throw error;

      // Create a new watchlist object
      const newWatchlist: Watchlist = {
        id: data.id,
        name: data.name,
        userId: data.user_id,
        items: [],
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };

      set((state) => ({
        watchlists: [...state.watchlists, newWatchlist],
        activeWatchlist: state.activeWatchlist || newWatchlist,
        isLoading: false,
      }));
    } catch (error) {
      console.error("Error creating watchlist:", error);
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  updateWatchlist: async (id: string, name: string) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from("watchlists")
        .update({ name, updated_at: new Date() })
        .eq("id", id);

      if (error) throw error;

      set((state) => {
        const updatedWatchlists = state.watchlists.map((w) =>
          w.id === id ? { ...w, name, updatedAt: new Date() } : w
        );

        const updatedActiveWatchlist =
          state.activeWatchlist?.id === id
            ? { ...state.activeWatchlist, name, updatedAt: new Date() }
            : state.activeWatchlist;

        return {
          watchlists: updatedWatchlists,
          activeWatchlist: updatedActiveWatchlist,
          isLoading: false,
        };
      });
    } catch (error) {
      console.error("Error updating watchlist:", error);
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  deleteWatchlist: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase.from("watchlists").delete().eq("id", id);

      if (error) throw error;

      set((state) => {
        const filteredWatchlists = state.watchlists.filter((w) => w.id !== id);

        // If the active watchlist is being deleted, set a new active watchlist
        let newActiveWatchlist = state.activeWatchlist;
        if (state.activeWatchlist?.id === id) {
          newActiveWatchlist = filteredWatchlists[0] || null;
        }

        return {
          watchlists: filteredWatchlists,
          activeWatchlist: newActiveWatchlist,
          isLoading: false,
        };
      });
    } catch (error) {
      console.error("Error deleting watchlist:", error);
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  setActiveWatchlist: async (id: string) => {
    const { watchlists } = get();
    const watchlist = watchlists.find((w) => w.id === id) || null;

    if (watchlist) {
      // Fetch stock data for the active watchlist
      let stocks: any[] = [];
      if (watchlist.items.length > 0) {
        try {
          const tickers = watchlist.items.map((item) => item.ticker);
          const stocksData = await stockService.getMultipleStocks(tickers);

          stocks = Object.values(stocksData);
        } catch (error) {
          console.error("Error fetching watchlist stocks:", error);
        }
      }

      set({
        activeWatchlist: watchlist,
        watchlistStocks: stocks,
      });
    }
  },

  addToWatchlist: async (watchlistId: string, ticker: string) => {
    set({ isLoading: true, error: null });
    try {
      // Add item to Supabase
      const { data, error } = await supabase
        .from("watchlist_items")
        .insert({
          watchlist_id: watchlistId,
          ticker,
        })
        .select()
        .single();

      if (error) throw error;

      // Create new item object
      const newItem: WatchlistItem = {
        id: data.id,
        watchlistId,
        ticker,
        createdAt: data.created_at,
      };

      // Update the state
      set((state) => {
        // Find the watchlist to update
        const updatedWatchlists = state.watchlists.map((watchlist) => {
          if (watchlist.id === watchlistId) {
            return {
              ...watchlist,
              items: [...watchlist.items, newItem],
            };
          }
          return watchlist;
        });

        // Update active watchlist if needed
        let updatedActiveWatchlist = state.activeWatchlist;
        if (state.activeWatchlist?.id === watchlistId) {
          updatedActiveWatchlist =
            updatedWatchlists.find((w) => w.id === watchlistId) || null;
        }

        return {
          watchlists: updatedWatchlists,
          activeWatchlist: updatedActiveWatchlist,
          isLoading: false,
        };
      });

      // If this is for the active watchlist, fetch the stock data
      const { activeWatchlist } = get();
      if (activeWatchlist?.id === watchlistId) {
        try {
          const stockInfo = await stockService.getStockInfo(ticker);
          set((state) => ({
            watchlistStocks: [...state.watchlistStocks, stockInfo],
          }));
        } catch (error) {
          console.error("Error fetching stock info:", error);
        }
      }
    } catch (error) {
      console.error("Error adding to watchlist:", error);
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  removeFromWatchlist: async (watchlistItemId: string) => {
    set({ isLoading: true, error: null });
    try {
      // First get the item to determine which watchlist it belongs to
      // and which ticker it is
      const { watchlists } = get();
      let watchlistId = "";
      let tickerToRemove = "";

      for (const watchlist of watchlists) {
        const item = watchlist.items.find((i) => i.id === watchlistItemId);
        if (item) {
          watchlistId = watchlist.id;
          tickerToRemove = item.ticker;
          break;
        }
      }

      if (!watchlistId) {
        throw new Error("Watchlist item not found");
      }

      // Delete the item from Supabase
      const { error } = await supabase
        .from("watchlist_items")
        .delete()
        .eq("id", watchlistItemId);

      if (error) throw error;

      // Update the state
      set((state) => {
        // Update watchlists
        const updatedWatchlists = state.watchlists.map((watchlist) => {
          if (watchlist.id === watchlistId) {
            return {
              ...watchlist,
              items: watchlist.items.filter((i) => i.id !== watchlistItemId),
            };
          }
          return watchlist;
        });

        // Update active watchlist if needed
        let updatedActiveWatchlist = state.activeWatchlist;
        if (state.activeWatchlist?.id === watchlistId) {
          updatedActiveWatchlist =
            updatedWatchlists.find((w) => w.id === watchlistId) || null;
        }

        // Update watchlist stocks if needed
        let updatedWatchlistStocks = state.watchlistStocks;
        if (state.activeWatchlist?.id === watchlistId) {
          updatedWatchlistStocks = state.watchlistStocks.filter(
            (stock) => stock.symbol !== tickerToRemove
          );
        }

        return {
          watchlists: updatedWatchlists,
          activeWatchlist: updatedActiveWatchlist,
          watchlistStocks: updatedWatchlistStocks,
          isLoading: false,
        };
      });
    } catch (error) {
      console.error("Error removing from watchlist:", error);
      set({ error: (error as Error).message, isLoading: false });
    }
  },
}));
