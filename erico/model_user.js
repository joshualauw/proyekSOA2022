const db = require("./database");

module.exports = {
    getAll: async () => {
        let result = await db.query("SELECT *  FROM users");
        return result;
    },
    getByEmail: async (email) => {
        let result = await db.query(`SELECT * FROM users WHERE email = '${email}'`);
        return result;
    },
    getByApiKey: async (apiKey) => {
        let result = await db.query(`SELECT * FROM users WHERE api_key = '${apiKey}'`);
        return result;
    },
    getByPhone: async (no) => {
        let result = await db.query(`SELECT * FROM users WHERE nomor_telepon = '${no}'`);
        return result;
    },
    add: async (user) => {
        let result = await db.query("INSERT INTO users SET ?", user);
        return result;
    },
    update: async (id, user) => {
        let result = await db.query("UPDATE users SET ? WHERE user_id = ?", [user, id]);
        return result;
    },
};