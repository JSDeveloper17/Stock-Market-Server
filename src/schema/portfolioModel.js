const {Schema, model} = require("mongoose")

const portFolioSchema = new Schema({
    user: {
      type: Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    symbol: {
      type: String,
      required: true,
      uppercase: true,
    },
    shares: {
      type: Number,
      required: true,
      default: 0,
    },
    avgPrice: {
      type: Number,
      required: true,
      default: 0,
    },
    currentPrice: {
    type: Number,
    default: 0,
  },
  totalInvestment: {
    type: Number,
    default: 0,
  },
  unrealizedProfitLoss: {
    type: Number,
    default: 0,
  }
}, {timestamps: true, versionKey: false})

const Portfolio = model("Portfolio", portFolioSchema)

module.exports = Portfolio