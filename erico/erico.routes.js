const express = require("express");
const router = express.Router();
const ctr = require("./erico.controller.")
const checkApiKey = require("./checkApiKey");
const Trans = require('./model_trans');

function checkPremium(req, res, next) {
    //console.log(req.dataUser)
    if(req.dataUser.tipe_user != "premium"){
        return res.status(403).send({ message: 'You are not allowed'})
    }
    next();
}

const multer = require("multer");
const fs = require("fs");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./upload");
    },
    filename: (req, file, cb) => {
        let filename = file.originalname;
        filename = filename.split(".");
        let extension = filename[filename.length - 1];
        cb(null, Date.now().toString() + "."+extension);
    },
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            cb(new Error("Please upload an image"));
        }
        cb(null, true);
    },
});

router.post('/register',(req, res) => {
    ctr.register(req, res);
});

router.post('/login',(req, res) => {
    ctr.login(req, res);
})

router.put('/update',checkApiKey,(req, res) => {
    ctr.update(req, res);
})

router.get('/stockRecomendation',[checkApiKey,checkPremium],(req, res)=>{
    ctr.recomend(req,res);
})

router.get('/stockPriceByDate',(req, res)=>{
    ctr.priceDate(req,res);
})

router.post('/upgrade',[checkApiKey,upload.single('photo')],async (req, res)=>{

    try {
        let tran = {
            user_id_ref: req.dataUser.user_id,
            photo: req.file.filename,
        };
        await Trans.add(tran)
        delete tran.user_id_ref
        tran.user_name = req.dataUser.name
        tran.user_email = req.dataUser.email
        tran.status = "pending"
        return res.status(201).send(tran);
    } catch (error) {
        console.error(error.message);
        return res.status(400).send({message: "please insert photo"});
    }
})


module.exports = router