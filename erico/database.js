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
    host: "mysql-80783-0.cloudclusters.net",
    port: "16913",
    user: "admin",
    password: "RrajpiOr",
    database: "dbproyek_soa",
});

module.exports = db;