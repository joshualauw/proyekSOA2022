const mysql = require("mysql");

class Database {
    constructor(config) {
        this.pool = mysql.createPool(config);
    }

    query() {
        return new Promise((resolve, reject) => {
            this.pool.query(...arguments, (err, rows) => {
                if (err) return reject(err);
                resolve(rows);
            });
        });
    }
}

let db = new Database({
    host: "localhost",
    user: "root",
    password: "",
    database: "dbproyek_soa",
});

module.exports = db;