const express = require("express");
const router = express.Router();
const ctr = require("./erico.controller.")
const checkApiKey = require("./checkApiKey");

router.post('/register',(req, res) => {
    ctr.register(req, res);
});

router.post('/login',(req, res) => {
    ctr.login(req, res);
})

router.put('/update',checkApiKey,(req, res) => {
    ctr.update(req, res);
})


module.exports = router