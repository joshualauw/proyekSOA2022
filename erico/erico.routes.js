const express = require("express");
const router = express.Router();
const ctr = require("./erico.controller.");
const checkApiKey = require("./checkApiKey");
const Trans = require("./model_trans");

function checkPremium(req, res, next) {
    //console.log(req.dataUser)
    if (req.dataUser.tipe_user != "premium") {
        return res.status(403).send({
            message: "You are not allowed",
        });
    }
    next();
}

const axios = require("axios").default;
const multer = require("multer");
const FormData = require("form-data");
const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
});

router.post("/register", (req, res) => {
    ctr.register(req, res);
});
router.post("/login", (req, res) => {
    ctr.login(req, res);
});
router.put("/update", checkApiKey, (req, res) => {
    ctr.update(req, res);
});

router.get("/stockRecomendation", [checkApiKey, checkPremium], (req, res) => {
    ctr.recomend(req, res);
});
router.get("/stockPriceByDate", (req, res) => {
    ctr.priceDate(req, res);
});

router.post("/upgrade", [checkApiKey, upload.single("photo")], async (req, res) => {
    try {
        const form = new FormData();
        const fnam = req.dataUser.name + Date.now().toString();
        form.append("file", req.file.buffer, fnam);
        const response = await axios.post("https://api.anonfiles.com/upload", form, {
            headers: {
                ...form.getHeaders(),
            },
        });

        const data = response.data;
        const url = data.data.file.url.full;

        let tran = {
            user_id: req.dataUser.user_id,
            photo: url,
        };
        await Trans.add(tran);
        delete tran.user_id_ref;
        tran.user_name = req.dataUser.name;
        tran.user_email = req.dataUser.email;
        tran.status = "pending";
        return res.status(201).send(tran);
    } catch (error) {
        console.error(error);
        return res.status(400).send({
            message: "please insert photo",
        });
    }
});

module.exports = router;
