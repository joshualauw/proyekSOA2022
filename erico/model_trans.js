const db = require("./database");

module.exports = {
    add: async (tran) => {
        let result = await db.query("INSERT INTO transfer SET ?", tran);
        return result;
    },
}