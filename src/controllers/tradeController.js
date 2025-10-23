





import Trades from "../schema/TradeModel.js";
import Portfolio from "../schema/portfolioModel.js";
import Users from "../schema/UserModel.js";
import { getLivePrice } from "../utils/alphaVantage.js";

// 🟢 Buy Stock
// export const buyStock = async (req, res) => {
//       console.log("Request URL : ", req.url)
//     console.log("Request Method : ", req.method)
//   try {
//     const { symbol, quantity } = req.body;
//     const userId = req.user._id;

//     // Fetch live price from Alpha Vantage
//     const livePrice = await getLivePrice(symbol);
//     const totalCost = livePrice * quantity;

//     const user = await Users.findById(userId);
//     if (!user) return res.status(404).json({ message: "User not found" });

//     if (user.cashBalance < totalCost) {
//       return res.status(400).json({ message: "Insufficient balance" });
//     }

//     // Deduct balance
//     user.cashBalance -= totalCost;
//     await user.save();

//     // Record the trade
//     const trade = await Trades.create({
//       user:userId,
//       symbol,
//       shares:quantity,
//       price: livePrice,
//       type: "BUY",
//       total: totalCost,
//     });

//     // Update portfolio
//     let portfolio = await Portfolio.findOne({ userId });
//     if (!portfolio) portfolio = await Portfolio.create({ userId, holdings: [] });

//     const existingStock = portfolio.holdings.find(h => h.symbol === symbol);

//     if (existingStock) {
//       // Recalculate average buy price
//       const totalShares = existingStock.quantity + quantity;
//       const newAvgPrice =
//         (existingStock.avgBuyPrice * existingStock.quantity + livePrice * quantity) / totalShares;

//       existingStock.quantity = totalShares;
//       existingStock.avgBuyPrice = newAvgPrice;
//     } else {
//       portfolio.holdings.push({ symbol, quantity, avgBuyPrice: livePrice });
//     }

//     await portfolio.save();

//     res.status(201).json({
//       message: "Stock purchased successfully",
//       trade,
//       livePrice,
//       updatedBalance: user.cashBalance,
//     });
//   } catch (error) {
//     console.error("Buy Error:", error.message);
//     res.status(500).json({ message: "Error buying stock", error: error.message });
//   }
// };
// Update portfolio for this specific user and stock

export const buyStock = async (req, res) => {
  try {
    const { symbol, quantity } = req.body;
    const userId = req.user._id;

    // Fetch live price
    const livePrice = await getLivePrice(symbol);
    const totalCost = livePrice * quantity;

    const user = await Users.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.cashBalance < totalCost) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    // Deduct balance
    user.cashBalance -= totalCost;
    await user.save();

    // Record trade
    const trade = await Trades.create({
      user: userId,
      symbol,
      shares: quantity,
      price: livePrice,
      total: totalCost,
      type: "BUY",
    });

    // ✅ Update or create portfolio entry
    let portfolio = await Portfolio.findOne({ user: userId, symbol });

    if (portfolio) {
      const totalShares = portfolio.shares + quantity;
      const newAvgPrice =
        (portfolio.avgPrice * portfolio.shares + livePrice * quantity) / totalShares;

      portfolio.shares = totalShares;
      portfolio.avgPrice = newAvgPrice;
      portfolio.currentPrice = livePrice;
      portfolio.totalInvestment = portfolio.shares * portfolio.avgPrice;
      portfolio.unrealizedProfitLoss =
        portfolio.shares * (livePrice - portfolio.avgPrice);

      await portfolio.save();
    } else {
      portfolio = await Portfolio.create({
        user: userId,
        symbol,
        shares: quantity,
        avgPrice: livePrice,
        currentPrice: livePrice,
        totalInvestment: livePrice * quantity,
        unrealizedProfitLoss: 0,
      });
    }

    res.status(201).json({
      message: "Stock purchased successfully",
      trade,
      portfolio,
      updatedBalance: user.cashBalance,
    });
  } catch (error) {
    console.error("Buy Error:", error.message);
    res.status(500).json({ message: "Error buying stock", error: error.message });
  }
};


// 🔴 Sell Stock
// export const sellStock = async (req, res) => {
//   try {
//     const { symbol, quantity } = req.body;
//     const userId = req.user.id;

//     const livePrice = await getLivePrice(symbol);
//     const user = await Users.findById(userId);
//     if (!user) return res.status(404).json({ message: "User not found" });

//     const portfolio = await Portfolio.findOne({ userId });
//     if (!portfolio) return res.status(400).json({ message: "Portfolio not found" });

//     const existingStock = portfolio.holdings.find(h => h.symbol === symbol);
//     if (!existingStock || existingStock.quantity < quantity) {
//       return res.status(400).json({ message: "Not enough shares to sell" });
//     }

//     // Update portfolio
//     existingStock.quantity -= quantity;
//     if (existingStock.quantity === 0) {
//       portfolio.holdings = portfolio.holdings.filter(h => h.symbol !== symbol);
//     }

//     await portfolio.save();

//     // Add balance to user
//     const totalSellValue = livePrice * quantity;
//     user.cashBalance += totalSellValue;
//     await user.save();

//     // Record trade
//     const trade = await Trades.create({
//       userId,
//       symbol,
//       quantity,
//       price: livePrice,
//       type: "SELL",
//       totalAmount: totalSellValue,
//     });

//     res.status(201).json({
//       message: "Stock sold successfully",
//       trade,
//       livePrice,
//       updatedBalance: user.cashBalance,
//     });
//   } catch (error) {
//     console.error("Sell Error:", error.message);
//     res.status(500).json({ message: "Error selling stock", error: error.message });
//   }
// };

export const sellStock = async (req, res) => {
  try {
    const { symbol, quantity } = req.body;
    const userId = req.user._id;

    // Fetch live stock price
    const livePrice = await getLivePrice(symbol);

    // Find user
    const user = await Users.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Find portfolio entry for this stock
    const portfolio = await Portfolio.findOne({ user: userId, symbol });
    if (!portfolio) return res.status(400).json({ message: "Stock not found in portfolio" });

    // Check if user has enough shares
    if (portfolio.shares < quantity) {
      return res.status(400).json({ message: "Not enough shares to sell" });
    }

    // Calculate total sell value
    const totalSellValue = livePrice * quantity;

    // Update portfolio shares
    portfolio.shares -= quantity;

    if (portfolio.shares === 0) {
      // If all shares sold, remove the portfolio entry
      await Portfolio.deleteOne({ _id: portfolio._id });
    } else {
      // Recalculate investment and profit/loss
      portfolio.currentPrice = livePrice;
      portfolio.totalInvestment = portfolio.shares * portfolio.avgPrice;
      portfolio.unrealizedProfitLoss = portfolio.shares * (livePrice - portfolio.avgPrice);
      await portfolio.save();
    }

    // Add money to user balance
    user.cashBalance += totalSellValue;
    await user.save();

    // Record trade
    const trade = await Trades.create({
      user: userId,
      symbol,
      shares: quantity,
      price: livePrice,
      type: "SELL",
      total: totalSellValue,
    });

    res.status(201).json({
      message: "Stock sold successfully",
      trade,
      livePrice,
      updatedBalance: user.cashBalance,
    });
  } catch (error) {
    console.error("Sell Error:", error.message);
    res.status(500).json({ message: "Error selling stock", error: error.message });
  }
};

// 📜 Get all user trades
// 📜 Get all user trades
export const getUserTrades = async (req, res) => {
  try {
    const userId = req.user._id; // ✅ fix

    const trades = await Trades.find({ user: userId }) // ✅ fix field name
      .sort({ createdAt: -1 });

    if (!trades || trades.length === 0) {
      return res.status(200).json({ message: "No trades found", trades: [] });
    }

    res.status(200).json(trades);
  } catch (error) {
    console.error("Fetch Trades Error:", error.message);
    res.status(500).json({
      message: "Error fetching trades",
      error: error.message,
    });
  }
};

