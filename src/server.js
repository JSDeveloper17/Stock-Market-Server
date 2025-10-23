const express = require("express")
const dotenv = require("dotenv")
dotenv.config()
const mongoose = require("mongoose")
const userRouter = require("./routes/user.Routes.js")
const tradeRouter = require("./routes/trade.Routes.js")
const portFolioRouter = require("./routes/portfolio.Routes.js")


const app = express()
app.use(express.json());
const port = process.env.PORT || 5000;
console.log("✅ Loaded userRouter from correct file");

app.use("/", userRouter)
app.use("/", tradeRouter)
app.use("/", portFolioRouter)

async function Bootstrap() {
    try{
        await mongoose.connect(process.env.MONGODB_URL,
        {dbName:process.env.DATABASE_NAME})

        console.log("Connected to MongoDB Database")
        app.listen(port, ()=>{
        console.log(`App is Listening on ${port}`)
        })
    }
    catch(error){
        console.log(error)
        process.exit(1)
    }
}

Bootstrap()