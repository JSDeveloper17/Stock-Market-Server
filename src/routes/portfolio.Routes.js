const express = require("express")
const authentication = require("../middleware/authenticateToken.js")
const { getPortfolio, getPerformance } = require("../controllers/portfolioController.js")
const portFolioRouter = express.Router()


portFolioRouter.get("/api/portfolio", authentication, getPortfolio)
portFolioRouter.get("/api/performance", authentication, getPerformance)

module.exports = portFolioRouter