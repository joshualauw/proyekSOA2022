const express = require("express");
const { addWatchList, getWatchlist } = require("./joshua.controller");
const { addWatchListValidate } = require("./joshua.validation");
const { checkToken } = require("../helpers/functions");

const router = express.Router();

router.post("/watchlist/add", checkToken, addWatchListValidate, addWatchList);
router.get("/watchlist", checkToken, getWatchlist);

module.exports = router;
