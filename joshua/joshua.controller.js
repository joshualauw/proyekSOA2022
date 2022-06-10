const { PrismaClientKnownRequestError } = require("@prisma/client/runtime");
const { default: axios } = require("axios");
const { getPeriod, getTimeSeriesData } = require("./functions");
const db = require("../helpers/db");

const getWatchlist = async (req, res) => {
  try {
    const watchlist = await db.watchlist.findFirst({
      where: { symbol: req.params.symbol },
    });
    if (!watchlist) return res.status(404).send({ message: "watchlist not found!" });

    let period = getPeriod(req.query);
    if (!period) return res.status(400).send({ message: "invalid query" });

    const result = await axios.get(
      `https://www.alphavantage.co/query?function=${period.name}&symbol=${watchlist.symbol}&apikey=${process.env.VINTAGE_API_KEY}`
    );
    const { first_price, last_price, avg_volume, change, change_percent, avg_high, avg_low } =
      getTimeSeriesData(result.data[period.key], period.range);
    return res.status(200).send({
      period: req.query.period || "daily",
      symbol: watchlist.symbol,
      name: watchlist.name,
      first_price,
      last_price,
      avg_high,
      avg_low,
      avg_volume,
      change: change > 0 ? "+" + change : change,
      change_percent: change_percent > 0 ? "+" + change_percent + "%" : change_percent + "%",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: "something went wrong" });
  }
};

const getAllWatchlist = async (req, res) => {
  try {
    const watchlists = await db.watchlist.findMany();
    let realTimeWatchlist = [];
    for (let i = 0; i < watchlists.length; i++) {
      const watchlist = watchlists[i];
      let period = getPeriod(req.query);
      if (!period) return res.status(400).send({ message: "invalid query" });
      const result = await axios.get(
        `https://www.alphavantage.co/query?function=${period.name}&symbol=${watchlist.symbol}&apikey=${process.env.VINTAGE_API_KEY}`
      );
      const { first_price, last_price, avg_volume, change } = getTimeSeriesData(
        result.data[period.key],
        period.range
      );
      realTimeWatchlist.push({
        symbol: watchlist.symbol,
        name: watchlist.name,
        first_price,
        last_price,
        avg_volume,
        change: change > 0 ? "+" + change : change,
      });
    }
    return res.status(200).send({ period: req.query.period || "daily", realTimeWatchlist });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: "something went wrong" });
  }
};

const addWatchList = async (req, res) => {
  try {
    if (!req.body.symbol) return res.status(400).send({ message: "symbol is required!" });
    const symbol = req.body.symbol;
    const result = await axios.get(
      `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${symbol}&apikey=${process.env.VINTAGE_API_KEY}`
    );
    let name = null;
    result.data.bestMatches.forEach((data) => {
      if (data["1. symbol"] == symbol) {
        name = data["2. name"];
      }
    });
    if (!name) return res.status(400).send({ message: "invalid symbol" });
    const watchlist = await db.watchlist.create({
      data: {
        symbol,
        name,
        api_key: req.user.api_key,
      },
    });
    if (!watchlist) return res.status(404).send({ message: "watchlist not found!" });
    return res.status(201).send({ ...watchlist, message: "stock successfuly added to watchlist" });
  } catch (err) {
    console.log(err);
    if (err instanceof PrismaClientKnownRequestError) {
      return res.status(400).send({ message: "stock already exist in the watchlist" });
    }
    return res.status(500).send({ message: "something went wrong" });
  }
};

const deleteWatchlist = async (req, res) => {
  try {
    const watchlist = await db.watchlist.findFirst({
      where: { symbol: req.params.symbol },
    });
    if (!watchlist) return res.status(404).send({ message: "watchlist not found!" });
    await db.watchlist.delete({ where: { symbol: req.params.symbol } });
    return res
      .status(200)
      .send({ ...watchlist, message: "stock successfully deleted from watchlist" });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: "something went wrong" });
  }
};

module.exports = {
  getAllWatchlist,
  getWatchlist,
  addWatchList,
  deleteWatchlist,
};
