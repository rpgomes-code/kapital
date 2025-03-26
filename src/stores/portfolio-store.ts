import NetInfo from "@react-native-community/netinfo";
import { create } from "zustand";
import { offlineService } from "../services/offline-service";
import { stockService } from "../services/stock-service";
import supabase from "../services/supabase";
import { Portfolio, PortfolioHolding, Transaction } from "../types/portfolio";

interface PortfolioState {
  portfolios: Portfolio[];
  activePortfolio: Portfolio | null;
  isLoading: boolean;
  isOffline: boolean;
  error: string | null;

  // Actions
  loadPortfolios: () => Promise<void>;
  createPortfolio: (name: string) => Promise<void>;
  updatePortfolio: (id: string, name: string) => Promise<void>;
  deletePortfolio: (id: string) => Promise<void>;
  setActivePortfolio: (id: string) => void;

  // Holdings actions
  addHolding: (
    portfolioId: string,
    ticker: string,
    shares: number,
    price: number
  ) => Promise<void>;
  updateHolding: (
    holdingId: string,
    shares: number,
    price: number
  ) => Promise<void>;
  removeHolding: (holdingId: string) => Promise<void>;

  // Transactions actions
  addTransaction: (
    transaction: Omit<Transaction, "id" | "createdAt">
  ) => Promise<void>;
  getTransactions: (portfolioId: string) => Promise<Transaction[]>;
}

export const usePortfolioStore = create<PortfolioState>((set, get) => ({
  portfolios: [],
  activePortfolio: null,
  isLoading: false,
  isOffline: false,
  error: null,

  loadPortfolios: async () => {
    set({ isLoading: true, error: null });
    try {
      // Check network status
      const networkState = await NetInfo.fetch();
      const isConnected = networkState.isConnected;
      set({ isOffline: !isConnected });

      if (isConnected) {
        // Online mode - Load from Supabase
        const { data: portfoliosData, error } = await supabase
          .from("portfolios")
          .select("*");

        if (error) throw error;

        if (!portfoliosData || portfoliosData.length === 0) {
          set({ portfolios: [], activePortfolio: null, isLoading: false });
          return;
        }

        // Get holdings for each portfolio
        const portfoliosWithHoldings = await Promise.all(
          portfoliosData.map(async (portfolio) => {
            const { data: holdingsData, error: holdingsError } = await supabase
              .from("portfolio_holdings")
              .select("*")
              .eq("portfolio_id", portfolio.id);

            if (holdingsError) throw holdingsError;

            // Enhance with current prices if there are holdings
            let holdings: PortfolioHolding[] = [];

            if (holdingsData && holdingsData.length > 0) {
              const tickers = holdingsData.map((h) => h.ticker);
              const stocksData = await stockService.getMultipleStocks(tickers);

              holdings = holdingsData.map((holding) => {
                const stockInfo = stocksData[holding.ticker] || null;
                const currentPrice =
                  stockInfo?.regularMarketPrice || holding.average_price;
                const value = currentPrice * holding.shares;
                const cost = holding.average_price * holding.shares;
                const gain = value - cost;
                const gainPercentage = cost > 0 ? (gain / cost) * 100 : 0;

                return {
                  id: holding.id,
                  portfolioId: holding.portfolio_id,
                  ticker: holding.ticker,
                  shares: holding.shares,
                  averagePrice: holding.average_price,
                  currentPrice,
                  value,
                  gain,
                  gainPercentage,
                  dayChange: stockInfo?.regularMarketChange || 0,
                  dayChangePercentage:
                    stockInfo?.regularMarketChangePercent || 0,
                  createdAt: holding.created_at,
                  updatedAt: holding.updated_at,
                };
              });
            }

            // Calculate totals
            const totalValue = holdings.reduce(
              (sum, h) => sum + (h.value || 0),
              0
            );
            const totalCost = holdings.reduce(
              (sum, h) => sum + h.averagePrice * h.shares,
              0
            );
            const totalGain = totalValue - totalCost;
            const totalGainPercentage =
              totalCost > 0 ? (totalGain / totalCost) * 100 : 0;

            const todayGain = holdings.reduce(
              (sum, h) => sum + (h.dayChange || 0) * h.shares,
              0
            );
            const todayGainPercentage =
              totalValue > 0 ? (todayGain / totalValue) * 100 : 0;

            return {
              id: portfolio.id,
              name: portfolio.name,
              userId: portfolio.user_id,
              totalValue,
              totalCost,
              totalGain,
              totalGainPercentage,
              todayGain,
              todayGainPercentage,
              holdings,
              createdAt: portfolio.created_at,
              updatedAt: portfolio.updated_at,
            };
          })
        );

        // Save to offline storage
        await offlineService.savePortfolioData(portfoliosWithHoldings);

        set({
          portfolios: portfoliosWithHoldings,
          activePortfolio: portfoliosWithHoldings[0] || null,
          isLoading: false,
        });
      } else {
        // Offline mode - Load from local storage
        const offlinePortfolios = await offlineService.loadPortfolioData();

        set({
          portfolios: offlinePortfolios,
          activePortfolio: offlinePortfolios[0] || null,
          isLoading: false,
        });
      }
    } catch (error) {
      console.error("Error loading portfolios:", error);

      // Try offline data as fallback
      try {
        const offlinePortfolios = await offlineService.loadPortfolioData();

        set({
          portfolios: offlinePortfolios,
          activePortfolio: offlinePortfolios[0] || null,
          isOffline: true,
          error: "Using offline data. " + (error as Error).message,
          isLoading: false,
        });
      } catch (offlineError) {
        set({
          error: "Failed to load portfolios: " + (error as Error).message,
          isLoading: false,
        });
      }
    }
  },

  createPortfolio: async (name: string) => {
    set({ isLoading: true, error: null });
    try {
      // Check network status
      const networkState = await NetInfo.fetch();
      const isConnected = networkState.isConnected;

      if (isConnected) {
        // Online mode - Create in Supabase
        const { data, error } = await supabase
          .from("portfolios")
          .insert({ name })
          .select()
          .single();

        if (error) throw error;

        // Create a new portfolio object
        const newPortfolio: Portfolio = {
          id: data.id,
          name: data.name,
          userId: data.user_id,
          totalValue: 0,
          totalCost: 0,
          totalGain: 0,
          totalGainPercentage: 0,
          todayGain: 0,
          todayGainPercentage: 0,
          holdings: [],
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };

        set((state) => {
          const updatedPortfolios = [...state.portfolios, newPortfolio];

          // Save to offline storage
          offlineService.savePortfolioData(updatedPortfolios);

          return {
            portfolios: updatedPortfolios,
            activePortfolio: state.activePortfolio || newPortfolio,
            isLoading: false,
          };
        });
      } else {
        // Offline mode - Queue for sync later
        set({
          error: "Cannot create portfolio while offline",
          isLoading: false,
        });
      }
    } catch (error) {
      console.error("Error creating portfolio:", error);
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  updatePortfolio: async (id: string, name: string) => {
    set({ isLoading: true, error: null });
    try {
      // Check network status
      const networkState = await NetInfo.fetch();
      const isConnected = networkState.isConnected;

      if (isConnected) {
        // Online mode - Update in Supabase
        const { error } = await supabase
          .from("portfolios")
          .update({ name, updated_at: new Date() })
          .eq("id", id);

        if (error) throw error;
      } else {
        // Offline mode - Queue for sync later
        await offlineService.addToSyncQueue({
          type: "UPDATE_PORTFOLIO",
          data: { id, name },
        });
      }

      set((state) => {
        const updatedPortfolios = state.portfolios.map((p) =>
          p.id === id ? { ...p, name, updatedAt: new Date() } : p
        );

        const updatedActivePortfolio =
          state.activePortfolio?.id === id
            ? { ...state.activePortfolio, name, updatedAt: new Date() }
            : state.activePortfolio;

        // Save to offline storage
        offlineService.savePortfolioData(updatedPortfolios);

        return {
          portfolios: updatedPortfolios,
          activePortfolio: updatedActivePortfolio,
          isLoading: false,
        };
      });
    } catch (error) {
      console.error("Error updating portfolio:", error);
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  deletePortfolio: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      // Check network status
      const networkState = await NetInfo.fetch();
      const isConnected = networkState.isConnected;

      if (isConnected) {
        // Online mode - Delete from Supabase
        const { error } = await supabase
          .from("portfolios")
          .delete()
          .eq("id", id);
        if (error) throw error;
      } else {
        // Offline mode - Queue for sync later
        await offlineService.addToSyncQueue({
          type: "DELETE_PORTFOLIO",
          data: { id },
        });
      }

      set((state) => {
        const filteredPortfolios = state.portfolios.filter((p) => p.id !== id);

        // If the active portfolio is being deleted, set a new active portfolio
        let newActivePortfolio = state.activePortfolio;
        if (state.activePortfolio?.id === id) {
          newActivePortfolio = filteredPortfolios[0] || null;
        }

        // Save to offline storage
        offlineService.savePortfolioData(filteredPortfolios);

        return {
          portfolios: filteredPortfolios,
          activePortfolio: newActivePortfolio,
          isLoading: false,
        };
      });
    } catch (error) {
      console.error("Error deleting portfolio:", error);
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  setActivePortfolio: (id: string) => {
    const { portfolios } = get();
    const portfolio = portfolios.find((p) => p.id === id) || null;
    set({ activePortfolio: portfolio });
  },

  // Holdings actions
  addHolding: async (
    portfolioId: string,
    ticker: string,
    shares: number,
    price: number
  ) => {
    set({ isLoading: true, error: null });
    try {
      // Check network status
      const networkState = await NetInfo.fetch();
      const isConnected = networkState.isConnected;

      if (isConnected) {
        // Online mode - Add to Supabase
        const { data, error } = await supabase
          .from("portfolio_holdings")
          .insert({
            portfolio_id: portfolioId,
            ticker,
            shares,
            average_price: price,
          })
          .select()
          .single();

        if (error) throw error;

        // Add transaction for this purchase
        await supabase.from("transactions").insert({
          portfolio_id: portfolioId,
          ticker,
          shares,
          price,
          type: "BUY",
          date: new Date(),
        });

        // Get current stock price
        const stockInfo = await stockService.getStockInfo(ticker);

        // Create new holding object
        const newHolding: PortfolioHolding = {
          id: data.id,
          portfolioId,
          ticker,
          shares,
          averagePrice: price,
          currentPrice: stockInfo.regularMarketPrice,
          value: shares * stockInfo.regularMarketPrice,
          gain: shares * (stockInfo.regularMarketPrice - price),
          gainPercentage:
            ((stockInfo.regularMarketPrice - price) / price) * 100,
          dayChange: stockInfo.regularMarketChange,
          dayChangePercentage: stockInfo.regularMarketChangePercent,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };

        // Update the state
        set((state) => {
          // Find the portfolio to update
          const updatedPortfolios = state.portfolios.map((portfolio) => {
            if (portfolio.id === portfolioId) {
              const holdings = [...portfolio.holdings, newHolding];

              // Recalculate portfolio totals
              const totalValue = holdings.reduce(
                (sum, h) => sum + (h.value || 0),
                0
              );
              const totalCost = holdings.reduce(
                (sum, h) => sum + h.averagePrice * h.shares,
                0
              );
              const totalGain = totalValue - totalCost;
              const totalGainPercentage =
                totalCost > 0 ? (totalGain / totalCost) * 100 : 0;

              const todayGain = holdings.reduce(
                (sum, h) => sum + (h.dayChange || 0) * h.shares,
                0
              );
              const todayGainPercentage =
                totalValue > 0 ? (todayGain / totalValue) * 100 : 0;

              return {
                ...portfolio,
                totalValue,
                totalCost,
                totalGain,
                totalGainPercentage,
                todayGain,
                todayGainPercentage,
                holdings,
              };
            }
            return portfolio;
          });

          // Update active portfolio if needed
          let updatedActivePortfolio = state.activePortfolio;
          if (state.activePortfolio?.id === portfolioId) {
            updatedActivePortfolio =
              updatedPortfolios.find((p) => p.id === portfolioId) || null;
          }

          // Save to offline storage
          offlineService.savePortfolioData(updatedPortfolios);

          return {
            portfolios: updatedPortfolios,
            activePortfolio: updatedActivePortfolio,
            isLoading: false,
          };
        });
      } else {
        // Offline mode - Queue for sync later
        await offlineService.addToSyncQueue({
          type: "ADD_HOLDING",
          data: { portfolioId, ticker, shares, price },
        });

        // Get stock data from offline storage if possible
        let stockInfo = await offlineService.loadStockData(ticker);

        if (!stockInfo) {
          // Use placeholder data if not available
          stockInfo = {
            regularMarketPrice: price,
            regularMarketChange: 0,
            regularMarketChangePercent: 0,
          };
        }

        // Generate a temporary ID
        const tempId = "temp-" + Date.now();

        // Create new holding object
        const newHolding: PortfolioHolding = {
          id: tempId,
          portfolioId,
          ticker,
          shares,
          averagePrice: price,
          currentPrice: stockInfo.regularMarketPrice,
          value: shares * stockInfo.regularMarketPrice,
          gain: shares * (stockInfo.regularMarketPrice - price),
          gainPercentage:
            ((stockInfo.regularMarketPrice - price) / price) * 100,
          dayChange: stockInfo.regularMarketChange,
          dayChangePercentage: stockInfo.regularMarketChangePercent,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        // Update the state
        set((state) => {
          // Find the portfolio to update
          const updatedPortfolios = state.portfolios.map((portfolio) => {
            if (portfolio.id === portfolioId) {
              const holdings = [...portfolio.holdings, newHolding];

              // Recalculate portfolio totals
              const totalValue = holdings.reduce(
                (sum, h) => sum + (h.value || 0),
                0
              );
              const totalCost = holdings.reduce(
                (sum, h) => sum + h.averagePrice * h.shares,
                0
              );
              const totalGain = totalValue - totalCost;
              const totalGainPercentage =
                totalCost > 0 ? (totalGain / totalCost) * 100 : 0;

              const todayGain = holdings.reduce(
                (sum, h) => sum + (h.dayChange || 0) * h.shares,
                0
              );
              const todayGainPercentage =
                totalValue > 0 ? (todayGain / totalValue) * 100 : 0;

              return {
                ...portfolio,
                totalValue,
                totalCost,
                totalGain,
                totalGainPercentage,
                todayGain,
                todayGainPercentage,
                holdings,
              };
            }
            return portfolio;
          });

          // Update active portfolio if needed
          let updatedActivePortfolio = state.activePortfolio;
          if (state.activePortfolio?.id === portfolioId) {
            updatedActivePortfolio =
              updatedPortfolios.find((p) => p.id === portfolioId) || null;
          }

          // Save to offline storage
          offlineService.savePortfolioData(updatedPortfolios);

          return {
            portfolios: updatedPortfolios,
            activePortfolio: updatedActivePortfolio,
            isOffline: true,
            isLoading: false,
          };
        });
      }
    } catch (error) {
      console.error("Error adding holding:", error);
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  updateHolding: async (holdingId: string, shares: number, price: number) => {
    // Similar implementation to addHolding but updating an existing one
    // This would be more complex as you need to recalculate the average price
    // based on the new transaction
    // For brevity, this is not fully implemented here
  },

  removeHolding: async (holdingId: string) => {
    set({ isLoading: true, error: null });
    try {
      // First get the holding to determine which portfolio it belongs to
      const { portfolios } = get();
      let portfolioId = "";
      let tickerToRemove = "";

      for (const portfolio of portfolios) {
        const holding = portfolio.holdings.find((h) => h.id === holdingId);
        if (holding) {
          portfolioId = portfolio.id;
          tickerToRemove = holding.ticker;
          break;
        }
      }

      if (!portfolioId) {
        throw new Error("Holding not found");
      }

      // Check network status
      const networkState = await NetInfo.fetch();
      const isConnected = networkState.isConnected;

      if (isConnected) {
        // Online mode - Delete from Supabase
        const { error } = await supabase
          .from("portfolio_holdings")
          .delete()
          .eq("id", holdingId);

        if (error) throw error;
      } else {
        // Offline mode - Queue for sync later
        await offlineService.addToSyncQueue({
          type: "REMOVE_HOLDING",
          data: { holdingId },
        });
      }

      // Update the state
      set((state) => {
        // Update portfolios
        const updatedPortfolios = state.portfolios.map((portfolio) => {
          if (portfolio.id === portfolioId) {
            // Remove the holding
            const updatedHoldings = portfolio.holdings.filter(
              (h) => h.id !== holdingId
            );

            // Recalculate portfolio totals
            const totalValue = updatedHoldings.reduce(
              (sum, h) => sum + (h.value || 0),
              0
            );
            const totalCost = updatedHoldings.reduce(
              (sum, h) => sum + h.averagePrice * h.shares,
              0
            );
            const totalGain = totalValue - totalCost;
            const totalGainPercentage =
              totalCost > 0 ? (totalGain / totalCost) * 100 : 0;

            const todayGain = updatedHoldings.reduce(
              (sum, h) => sum + (h.dayChange || 0) * h.shares,
              0
            );
            const todayGainPercentage =
              totalValue > 0 ? (todayGain / totalValue) * 100 : 0;

            return {
              ...portfolio,
              totalValue,
              totalCost,
              totalGain,
              totalGainPercentage,
              todayGain,
              todayGainPercentage,
              holdings: updatedHoldings,
            };
          }
          return portfolio;
        });

        // Update active portfolio if needed
        let updatedActivePortfolio = state.activePortfolio;
        if (state.activePortfolio?.id === portfolioId) {
          updatedActivePortfolio =
            updatedPortfolios.find((p) => p.id === portfolioId) || null;
        }

        // Save to offline storage
        offlineService.savePortfolioData(updatedPortfolios);

        return {
          portfolios: updatedPortfolios,
          activePortfolio: updatedActivePortfolio,
          isLoading: false,
        };
      });
    } catch (error) {
      console.error("Error removing holding:", error);
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  // Transactions actions
  addTransaction: async (transaction) => {
    set({ isLoading: true, error: null });
    try {
      // Check network status
      const networkState = await NetInfo.fetch();
      const isConnected = networkState.isConnected;

      if (isConnected) {
        // Online mode - Add to Supabase
        const { data, error } = await supabase
          .from("transactions")
          .insert({
            portfolio_id: transaction.portfolioId,
            ticker: transaction.ticker,
            shares: transaction.shares,
            price: transaction.price,
            type: transaction.type,
            date: transaction.date,
            notes: transaction.notes,
          })
          .select()
          .single();

        if (error) throw error;

        // If it's a BUY or SELL transaction, update the holding
        if (transaction.type === "BUY" || transaction.type === "SELL") {
          // Get current holding for this ticker
          const { data: holdings, error: holdingsError } = await supabase
            .from("portfolio_holdings")
            .select("*")
            .eq("portfolio_id", transaction.portfolioId)
            .eq("ticker", transaction.ticker);

          if (holdingsError) throw holdingsError;

          const holdingExists = holdings && holdings.length > 0;
          const sharesModifier = transaction.type === "BUY" ? 1 : -1;
          const transactionShares = transaction.shares * sharesModifier;

          if (holdingExists) {
            const holding = holdings[0];
            const currentShares = holding.shares;
            const currentTotalCost = holding.shares * holding.average_price;

            // Calculate new shares and average price
            const newShares = currentShares + transactionShares;

            // If selling all shares, remove the holding
            if (newShares <= 0) {
              await supabase
                .from("portfolio_holdings")
                .delete()
                .eq("id", holding.id);
            } else {
              // Calculate new average price (only for buys)
              let newAveragePrice = holding.average_price;
              if (transaction.type === "BUY") {
                const newCost = transaction.price * transaction.shares;
                const totalCost = currentTotalCost + newCost;
                newAveragePrice = totalCost / newShares;
              }

              // Update the holding
              await supabase
                .from("portfolio_holdings")
                .update({
                  shares: newShares,
                  average_price: newAveragePrice,
                  updated_at: new Date(),
                })
                .eq("id", holding.id);
            }
          } else if (transaction.type === "BUY") {
            // Create a new holding if buying and it doesn't exist
            await supabase.from("portfolio_holdings").insert({
              portfolio_id: transaction.portfolioId,
              ticker: transaction.ticker,
              shares: transaction.shares,
              average_price: transaction.price,
            });
          }
        }
      } else {
        // Offline mode - Queue for sync later
        await offlineService.addToSyncQueue({
          type: "ADD_TRANSACTION",
          data: transaction,
        });
      }

      // Reload portfolios to update the UI
      await get().loadPortfolios();
    } catch (error) {
      console.error("Error adding transaction:", error);
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  getTransactions: async (portfolioId: string) => {
    try {
      // Check network status
      const networkState = await NetInfo.fetch();
      const isConnected = networkState.isConnected;

      if (isConnected) {
        // Online mode - Get from Supabase
        const { data, error } = await supabase
          .from("transactions")
          .select("*")
          .eq("portfolio_id", portfolioId)
          .order("date", { ascending: false });

        if (error) throw error;

        return data as Transaction[];
      } else {
        // Offline mode - This would need a proper implementation to get from local storage
        // For now, just return an empty array
        return [];
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
      set({ error: (error as Error).message });
      return [];
    }
  },
}));
