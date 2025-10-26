const express = require("express")
const authentication = require("../middleware/authenticateToken.js")
const { buyStock, sellStock, getUserTrades } = require("../controllers/tradeController.js")
const { getLivePrice } = require("../utils/alphaVantage.js")
const tradeRouter = express.Router()

tradeRouter.post("/api/trades/buy",authentication, buyStock)
tradeRouter.post("/api/trades/sell", authentication, sellStock)

tradeRouter.get("/api/trades", authentication, getUserTrades)

tradeRouter.get("/api/trades/price/:symbol", authentication ,async (req, res) => {
  try {
    const { symbol } = req.params;
    const price = await getLivePrice(symbol);
    res.json({ symbol, price });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch price", error: error.message });
  }
});


module.exports = tradeRouter