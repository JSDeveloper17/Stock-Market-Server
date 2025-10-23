const express = require("express")
const authentication = require("../middleware/authenticateToken.js")
const { buyStock, sellStock, getUserTrades } = require("../controllers/tradeController.js")
const tradeRouter = express.Router()

tradeRouter.post("/api/trades/buy",authentication, buyStock)
tradeRouter.post("/api/trades/sell", authentication, sellStock)

tradeRouter.get("/api/trades", authentication, getUserTrades)

module.exports = tradeRouter