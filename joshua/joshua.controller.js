const { PrismaClientKnownRequestError } = require("@prisma/client/runtime");
const { default: axios } = require("axios");
const { getPeriod, getAvg, getChange } = require("./functions");
const { OPEN, HIGH, LOW, CLOSE, VOLUME, SYMBOL, NAME } = require("./utils");
const { nFormatter } = require("../helpers/functions");

const db = require("../helpers/db");
const jwt = require("jsonwebtoken");

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
        const data = Object.values(result.data[period.key]);
        return res.status(200).send({
            period: period.key,
            symbol: watchlist.symbol,
            name: watchlist.name,
            first_price: data[0][OPEN],
            last_price: data[0][CLOSE],
            avg_high: getAvg(data, HIGH).toFixed(3),
            avg_low: getAvg(data, LOW).toFixed(3),
            avg_volume: nFormatter(getAvg(data, VOLUME)),
            change: getChange(data, OPEN, CLOSE),
        });
    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: "something went wrong" });
    }
};

const getAllWatchlist = async (req, res) => {
    try {
        let period = getPeriod(req.query);
        if (!period) return res.status(400).send({ message: "invalid query" });

        const watchlists = await db.watchlist.findMany();
        let realTimeWatchlist = [];
        for (let i = 0; i < watchlists.length; i++) {
            const watchlist = watchlists[i];
            const result = await axios.get(
                `https://www.alphavantage.co/query?function=${period.name}&symbol=${watchlist.symbol}&apikey=${process.env.VINTAGE_API_KEY}`
            );
            const data = Object.values(result.data[period.key]);
            realTimeWatchlist.push({
                symbol: watchlist.symbol,
                first_price: data[0][OPEN],
                last_price: data[0][CLOSE],
                change: getChange(data, OPEN, CLOSE),
            });
        }
        return res.status(200).send({ period: period.key, watchlists: realTimeWatchlist });
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
            if (data[SYMBOL] == symbol) {
                name = data[NAME];
            }
        });
        if (!name) return res.status(400).send({ message: "invalid symbol" });
        const watchlistCount = await db.watchlist.findMany({ where: { api_key: req.user.api_key } });
        if (req.user.type == "free" && watchlistCount.length > 5) {
            return res.status(400).send({ message: "free limit only 5 stocks" });
        }
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
        return res.status(200).send({ ...watchlist, message: "stock successfully deleted from watchlist" });
    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: "something went wrong" });
    }
};

const adminLogin = async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) return res.status(400).send({ message: "invalid credentials" });
        const admin = await db.admin.findFirst({
            where: { username, password },
        });
        if (!admin) return res.status(400).send({ message: "invalid credentials" });
        const token = jwt.sign(admin, process.env.JWT_SECRET_KEY, { expiresIn: "1d" });
        return res.status(200).send({
            message: "login success",
            token,
        });
    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: "something went wrong" });
    }
};

const getAllTransactions = async (req, res) => {
    try {
        const transactions = await db.transfer.findMany({
            include: {
                user_id_ref: true,
            },
        });
        return res.status(200).send(
            transactions.map((t) => {
                return {
                    trans_id: t.trans_id,
                    photo: t.photo,
                    date_upload: t.date_upload.toString(),
                    status: t.status,
                    api_key: t.user_id_ref.api_key,
                    tipe_user: t.user_id_ref.tipe_user,
                };
            })
        );
    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: "something went wrong" });
    }
};

const acceptTransaction = async (req, res) => {
    try {
        const transaction = await db.transfer.update({
            where: { trans_id: parseInt(req.params.trans_id) },
            data: {
                status: "success",
            },
        });
        const user = await db.users.update({
            where: { user_id: transaction.user_id },
            data: {
                tipe_user: "premium",
            },
        });
        return res.status(200).send({ message: `Berhasil upgrade user ${user.name} ke premium` });
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
    adminLogin,
    getAllTransactions,
    acceptTransaction,
};
