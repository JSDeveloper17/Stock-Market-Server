const {Schema, model} = require("mongoose")

const portFolioSchema = new Schema({
    user: {
      type: mongoose.Schema.Types.ObjectId,
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
}, {timestamps: true, versionKey: false})

const Portfolio = model("Portfolio", portFolioSchema)

module.exports = Portfolio