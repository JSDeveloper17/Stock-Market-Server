import Trades from "../schema/TradesModel.js";
import Portfolio from "../schema/portfolioModel.js";
import Users from "../schema/UserModel.js";
import { getLivePrice } from "../utils/alphaVantage.js";


// 🟢 Buy Stock
export const buyStock = async (req, res) => {
  try {
    const { symbol, quantity } = req.body;
    const userId = req.user.id;

    const livePrice = await getLivePrice(symbol);
    const totalCost = livePrice * quantity;

    const user = await Users.findById(userId);

    if (user.cashBalance < totalCost) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    // Deduct balance
    user.cashBalance -= totalCost;
    await user.save();

    // Record the Trades
    const trades = await Trades.create({
      userId,
      symbol,
      quantity,
      price: livePrice,
      type: "BUY",
      totalAmount: totalCost,
    });

    // Update portfolio
    let portfolio = await Portfolio.findOne({ userId });
    if (!portfolio) portfolio = await Portfolio.create({ userId, holdings: [] });

    const existingStock = portfolio.holdings.find(h => h.symbol === symbol);

    if (existingStock) {
      // Recalculate average buy price
      const totalShares = existingStock.quantity + quantity;
      const newAvgPrice =
        (existingStock.avgBuyPrice * existingStock.quantity + livePrice * quantity) / totalShares;

      existingStock.quantity = totalShares;
      existingStock.avgBuyPrice = newAvgPrice;
    } else {
      portfolio.holdings.push({ symbol, quantity, avgBuyPrice: livePrice });
    }

    await portfolio.save();

    res.status(201).json({
      message: "Stock purchased successfully",
      trade,
      livePrice,
      updatedBalance: user.cashBalance,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Error buying stock", error: error.message });
  }
};


// 🔴 Sell Stock
export const sellStock = async (req, res) => {
  try {
    const { symbol, quantity } = req.body;
    const userId = req.user.id;

    const livePrice = await getLivePrice(symbol);
    const user = await Users.findById(userId);
    const portfolio = await Portfolio.findOne({ userId });

    if (!portfolio) return res.status(400).json({ message: "Portfolio not found" });

    const existingStock = portfolio.holdings.find(h => h.symbol === symbol);

    if (!existingStock || existingStock.quantity < quantity) {
      return res.status(400).json({ message: "Not enough shares to sell" });
    }

    // Update portfolio
    existingStock.quantity -= quantity;
    if (existingStock.quantity === 0) {
      portfolio.holdings = portfolio.holdings.filter(h => h.symbol !== symbol);
    }

    await portfolio.save();

    // Add balance to user
    const totalSellValue = livePrice * quantity;
    user.cashBalance += totalSellValue;
    await user.save();

    // Record trade
    const trade = await Trades.create({
      userId,
      symbol,
      quantity,
      price: livePrice,
      type: "SELL",
      totalAmount: totalSellValue,
    });

    res.status(201).json({
      message: "Stock sold successfully",
      trade,
      livePrice,
      updatedBalance: user.cashBalance,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Error selling stock", error: error.message });
  }
};


// 📜 Get all user trades
export const getUserTrades = async (req, res) => {
  try {
    const userId = req.user.id;
    const trades = await Trades.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json(trades);
  } catch (error) {
    res.status(500).json({ message: "Error fetching trades", error: error.message });
  }
};
