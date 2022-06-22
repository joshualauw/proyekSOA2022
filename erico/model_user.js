const db = require("./database");

module.exports = {
    getAll: async () => {
        let result = await db.query("SELECT *  FROM Users");
        return result;
    },
    getByEmail: async (email) => {
        let result = await db.query(`SELECT * FROM Users WHERE email = '${email}'`);
        return result;
    },
    getByApiKey: async (apiKey) => {
        let result = await db.query(`SELECT * FROM Users WHERE api_key = '${apiKey}'`);
        return result;
    },
    getByPhone: async (no) => {
        let result = await db.query(`SELECT * FROM Users WHERE nomor_telepon = '${no}'`);
        return result;
    },
    add: async (user) => {
        let result = await db.query("INSERT INTO Users SET ?", user);
        return result;
    },
    update: async (id, user) => {
        let result = await db.query("UPDATE Users SET ? WHERE user_id = ?", [user, id]);
        return result;
    },
};