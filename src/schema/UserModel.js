const {Schema, model} = require("mongoose")

const userScema = new Schema({
    name:{
        type:String,
        required: true,
        trim: true,
    },
    email:{
        type:String,
        required: true,
        trim: true,
        lowercase: true,
    },
    password:{
        type:String,
        required: true,
        minlength:6
    },
    cashBalance: {
      type: Number,
      default: 100000, // starting virtual balance
    }
},{timestamps: true, versionKey: false})

const Users = model("Users", userScema)

module.exports = Users