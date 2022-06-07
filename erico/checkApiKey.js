const User = require('./model_user');

module.exports = async function checkToken(req, res, next) {
    const token = req.headers['x-auth-token'];
    if (!token) {
        return res.status(401).send({
            message: "unauthorized"
        })
    }
    try {
        let cek = await User.getByApiKey(token)
        if (cek.length == 0) {
            return res.status(401).send({
                message: "unauthorized"
            })
        }
        req.dataUser = cek[0];
        next();
    } catch (err) {
        return res.status(500).send(err)
    }
}