const express = require("express");
const controller = require("./joshua.controller");
const { checkToken } = require("../helpers/functions");

const router = express.Router();

router.post("/watchlist/add", checkToken, controller.addWatchList);
router.get("/watchlist", checkToken, controller.getAllWatchlist);
router.get("/watchlist/:symbol", checkToken, controller.getWatchlist);
router.delete("/watchlist/:symbol", checkToken, controller.deleteWatchlist);

module.exports = router;
