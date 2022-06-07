const joi = require('joi');
const User = require('./model_user');

function random15Char() {
    var result = '';
    var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (var i = 15; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
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

        if(Object.values(data_baru).some(element => element !== null)){
            await User.update(req.dataUser.user_id,data_baru);
            return res.status(200).send({old_data: data_lama, new_data: data_baru});
        }

        return res.status(200).send({message: "no changes"});
    },
    
}