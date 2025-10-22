const {Schema, model, default: mongoose} = require("mongoose")

const tradeSchema = new Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Users",
        required:true
    },
    symbol:{
        type:String,
        required:true,
        uppercase:true
    },
    type:{
        type:String,
        enum:["BUY", "SELL"],
        required:true
    },
    shares:{
        type:Number,
        required:true,
        min:1
    },
    price:{
        type:Number,
        required:true,
        min:0
    },
    total:{
        type:Number,
        required:true,
        min:0
    }
}, {timestamps: true, versionKey: false})

const Trades = model("Trades", tradeSchema)

module.exports = Trades