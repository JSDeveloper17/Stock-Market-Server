
import Portfolio from "../schema/portfolioModel.js";
import Users from "../schema/UserModel.js";
import { getLivePrice } from "../utils/alphaVantage.js";

// 📦 Get Portfolio Summary (with live values)
export const getPortfolio = async (req, res) => {
  try {
    const userId = req.user.id;
    const portfolio = await Portfolio.findOne({ userId });
    const user = await Users.findById(userId);

    if (!portfolio) {
      return res.status(200).json({ cashBalance: user.cashBalance, holdings: [] });
    }

    let portfolioValue = 0;
    const detailedHoldings = [];

    for (const stock of portfolio.holdings) {
      const livePrice = await getLivePrice(stock.symbol);
      const currentValue = livePrice * stock.quantity;
      portfolioValue += currentValue;

      detailedHoldings.push({
        symbol: stock.symbol,
        quantity: stock.quantity,
        avgBuyPrice: stock.avgBuyPrice,
        livePrice,
        currentValue,
        profitLoss: (livePrice - stock.avgBuyPrice) * stock.quantity,
      });
    }

    res.status(200).json({
      cashBalance: user.cashBalance,
      portfolioValue,
      totalWorth: user.cashBalance + portfolioValue,
      holdings: detailedHoldings,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching portfolio", error: error.message });
  }
};


// 📈 Get Portfolio Performance
export const getPerformance = async (req, res) => {
  try {
    const userId = req.user.id;
    const portfolio = await Portfolio.findOne({ userId });

    if (!portfolio) return res.status(200).json({ totalInvested: 0, currentValue: 0, profitLoss: 0 });

    let totalInvested = 0;
    let currentValue = 0;

    for (const stock of portfolio.holdings) {
      totalInvested += stock.avgBuyPrice * stock.quantity;
      const livePrice = await getLivePrice(stock.symbol);
      currentValue += livePrice * stock.quantity;
    }

    const profitLoss = currentValue - totalInvested;
    const profitLossPercent = (profitLoss / totalInvested) * 100;

    res.status(200).json({
      totalInvested,
      currentValue,
      profitLoss,
      profitLossPercent: profitLossPercent.toFixed(2),
    });
  } catch (error) {
    res.status(500).json({ message: "Error calculating performance", error: error.message });
  }
};
