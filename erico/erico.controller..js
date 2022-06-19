const joi = require('joi');
const User = require('./model_user');
const {
    default: axios
} = require("axios");
const finnhub = require('finnhub');
const api_key = finnhub.ApiClient.instance.authentications['api_key'];
api_key.apiKey = process.env.APIKEYFINNHUB
const finnhubClient = new finnhub.DefaultApi()


function random15Char() {
    var result = '';
    var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (var i = 15; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
}

function calculateSkor(buy, sell) {
    buy = parseInt(buy)
    sell = parseInt(sell)
    let gap = 100 - parseInt(buy - sell)
    return gap * 0.001
}

function calculatSkor(buy, sell) {
    return Math.random() * (0.89 - 0.55) + 0.55
}

let tr = {
    strongBuy: 14,
    strongSell: 4
}

module.exports = {
    register: async (req, res) => {
        let {
            email,
            name,
            password,
            confirm_password,
            nomor_telepon
        } = req.body;

        const vali = joi.object({
            "email": joi.string().email().required(),
            "name": joi.string().alphanum().required(),
            "password": joi.string().alphanum().required(),
            "confirm_password": joi.ref("password"),
            "nomor_telepon": joi.string().length(12).pattern(/^[0-9]+$/).required(),
        }).with("password", "confirm_password");

        const valRes = vali.validate(req.body)

        if (valRes.error) {
            return res.status(400).send({
                message: valRes.error.details[0].message
            })
        }

        try {
            let check = await User.getByEmail(email);
            if (check.length > 0) {
                return res.status(400).send({
                    message: "email already use"
                })
            }

            check = await User.getByPhone(nomor_telepon);
            if (check.length > 0) {
                return res.status(400).send({
                    message: "nomor telepon already use"
                })
            }

            let kode = random15Char();
            let loop = true;
            while (loop) {
                let cek = await User.getByApiKey(kode);
                if (cek.length == 0) {
                    loop = false;
                } else {
                    kode = random15Char();
                }

            }

            let usx = {
                email: email,
                name: name,
                password: password,
                nomor_telepon: nomor_telepon,
                api_key: kode,
            }

            await User.add(usx)

            return res.status(201).send(usx);

        } catch (err) {
            return res.status(500).send(err);
        }
    },
    login: async (req, res) => {
        let {
            email,
            password
        } = req.body;
        let all_user = await User.getAll();
        for (let u of all_user) {
            if (u.email === email) {
                if (u.password === password) {
                    delete u.user_id
                    delete u.password
                    delete u.nomor_telepon
                    return res.status(200).send(u)
                }
            }
        }
        return res.status(404).send({
            message: "invalid email/password"
        })
    },
    update: async (req, res) => {
        let data_lama = {};
        let data_baru = {};

        if (req.body.email) {
            if (req.body.email !== req.dataUser.email) {
                let check = await User.getByEmail(req.body.email);
                if (check.length > 0) {
                    return res.status(400).send({
                        message: "email already use"
                    })
                }

                data_lama.email = req.dataUser.email
                data_baru.email = req.body.email
            }
        }

        if (req.body.nomor_telepon) {
            if (req.body.nomor_telepon !== req.dataUser.nomor_telepon) {
                let check = await User.getByPhone(req.body.nomor_telepon);
                if (check.length > 0) {
                    return res.status(400).send({
                        message: "nomor telepon already use"
                    })
                }

                data_lama.nomor_telepon = req.dataUser.nomor_telepon
                data_baru.nomor_telepon = req.body.nomor_telepon
            }
        }

        if (req.body.name) {
            if (req.body.name !== req.dataUser.name) {
                data_lama.name = req.dataUser.name
                data_baru.name = req.body.name
            }
        }

        if (req.body.password) {
            if (req.body.password !== req.dataUser.password) {
                data_lama.password = req.dataUser.password
                data_baru.password = req.body.password
            }
        }

        if (Object.values(data_baru).some(element => element !== null)) {
            await User.update(req.dataUser.user_id, data_baru);
            return res.status(200).send({
                old_data: data_lama,
                new_data: data_baru
            });
        }

        return res.status(200).send({
            message: "no changes"
        });
    },
    recomend: async (req, res) => {

        let simbol = await axios.get(
            `https://finnhub.io/api/v1/stock/symbol?exchange=US&token=${process.env.APIKEYFINNHUB}`
        );
        simbol = simbol.data;
        let result = [];
        while (result.length < 10) {
            let xy = simbol[Math.floor(Math.random() * simbol.length)]
            // finnhubClient.recommendationTrends(xy.symbol, (error, data, response) => {
            //     let tr = data;
            //     tr = tr[0];
            //     if(tr){
            //         result.push({
            //             "Symbol": xy.symbol,
            //             "Name": xy.description,
            //             "Type": xy.type,
            //             "Buy": tr.strongBuy,
            //             "Sell": tr.strongSell,
            //             "Score": calculateSkor(tr.strongBuy,tr.strongSell)
            //         });
            //     }
            //     console.log(tr)
            // });
            result.push({
                "Symbol": xy.symbol,
                "Name": xy.description,
                "Type": xy.type,
                "Score": calculatSkor(tr.strongBuy, tr.strongSell)
            });
        }

        result.sort((a, b) => {
            return b.Score - a.Score
        })

        return res.status(200).send(result);
    },
    priceDate: async (req, res) => {
        let {
            symbol
        } = req.body
        if (!symbol) return res.status(400).send({
            message: 'required symbol'
        })
        symbol = symbol.toUpperCase()
        let dat = await axios.get(
            `https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}&token=${process.env.APIKEYFINNHUB}`
        );
        dat = dat.data;
        //console.log(dat);
        if (Object.values(dat).some(element => element !== null)) {
            let result = {
                "symbol": symbol,
                "name": dat.name,
                "industry": dat.finnhubIndustry
            }
            let pr = []
            let da2 = await axios.get(
                `https://finnhub.io/api/v1/stock/recommendation?symbol=${symbol}&token=${process.env.APIKEYFINNHUB}`
            );
            da2 = da2.data;
            for (let i of da2) {
                pr.push({
                    "periode": i.period,
                    "buy": i.strongBuy,
                    "sell": i.strongSell
                })
            }
            result.price = pr
            return res.status(200).send(result)
        }
        return res.status(404).send({
            message: 'stock not found!'
        })
    }
}