const { default: axios } = require("axios");
const Joi = require("joi");
const db = require("../helpers/db");

const getWatchlist = async (req, res) => {
  try {
    const result = await axios.get(
      "https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=IBM&apikey=demo"
    );
    return res.status(200).send(result.data);
  } catch (err) {
    console.log(err);
    return res.status(500).send(err.message);
  }
};

const addWatchList = async (req, res) => {
  try {
    const { symbol } = req.validated;
    const result = await axios.get(
      `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${process.env.VINTAGE_API_KEY}`
    );
    if (result.data["Error Message"]) {
      return res.status(400).send({ message: "invalid symbol" });
    }
    return res.status(200).send(result.data);
  } catch (err) {
    console.log(err);
    return res.status(500).send(err.message);
  }
};

module.exports = {
  getWatchlist,
  addWatchList,
};
