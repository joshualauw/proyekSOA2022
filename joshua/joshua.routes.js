const express = require("express");
const controller = require("./joshua.controller");
const { checkToken } = require("../helpers/functions");
const jwt = require("jsonwebtoken");

const router = express.Router();

const checkAdminToken = (req, res, next) => {
    const token = req.headers["x-auth-token"];
    if (!token) return res.status(401).send({ message: "unauthorized" });
    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET_KEY);
        //console.log(req.user);
        next();
    } catch (err) {
        console.log(err);
        return res.status(401).send({ msg: "token invalid!" });
    }
};

router.post("/watchlist/add", checkToken, controller.addWatchList);
router.get("/watchlist", checkToken, controller.getAllWatchlist);
router.get("/watchlist/:symbol", checkToken, controller.getWatchlist);
router.delete("/watchlist/:symbol", checkToken, controller.deleteWatchlist);
router.post("/admin/login", controller.adminLogin);
router.get("/admin/transaction", checkAdminToken, controller.getAllTransactions);
router.post("/admin/accept/:trans_id", checkAdminToken, controller.acceptTransaction);

module.exports = router;
