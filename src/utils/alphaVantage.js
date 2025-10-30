// import axios from "axios";

// const ALPHA_BASE_URL = "https://www.alphavantage.co/query";
// const API_KEY = process.env.ALPHA_VANTAGE_API_KEY;

// export const getLivePrice = async (symbol) => {
//   try {
//     const response = await axios.get(ALPHA_BASE_URL, {
//       params: {
//         function: "GLOBAL_QUOTE",
//         symbol,
//         apikey: API_KEY,
//       },
//     });

//     const quote = response.data["Global Quote"];
//     if (!quote || !quote["05. price"]) {
//       throw new Error("Invalid stock symbol or data unavailable.");
//     }

//     return parseFloat(quote["05. price"]);
//   } catch (error) {
//     console.error("AlphaVantage API error:", error.message);
//     throw new Error("Unable to fetch live stock price");
//   }
// };

// utils/getLivePrice.js
import axios from "axios";

//const FINNHUB_BASE_URL = "https://finnhub.io/api/v1/quote";
//const API_KEY = process.env.FINNHUB_API_KEY;
const ALPHA_BASE_URL = "https://www.alphavantage.co/query";
const API_KEY = process.env.ALPHA_VANTAGE_API_KEY;

export const getLivePrice = async (symbol) => {
  try {
    const response = await axios.get(ALPHA_BASE_URL, {
      params: {
        symbol,
        token: API_KEY,
      },
    });

    const data = response.data;

    if (!data || data.c === 0) {
      throw new Error("Invalid stock symbol or data unavailable.");
    }

    // `c` = current price from Finnhub
    return parseFloat(data.c);
  } catch (error) {
    console.error("Finnhub API error:", error.message);
    throw new Error("Unable to fetch live stock price");
  }
};

