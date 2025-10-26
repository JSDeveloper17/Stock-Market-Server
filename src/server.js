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

const cors = require('cors');
// Allow requests from your frontend origin
app.use(cors({
     origin: 'http://localhost:5173',
   //origin: 'https://stock-market-dashboard-dg.netlify.app',
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Add other methods if needed
  allowedHeaders: ['Content-Type', 'Authorization'], // If using tokens later
}));

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