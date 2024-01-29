import sqlite3 from 'sqlite3';
import path from 'path';


class SQLiteModule {
    constructor(dbPath) {
        this.db = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                console.error(`Error opening SQLite database: ${err.message}`);
            } else {
                console.log(`Connected to SQLite database`);
            }
        });
    }

    createTable(query) {
        // const createTableQuery = `
        //   CREATE TABLE IF NOT EXISTS blocked_ips (
        //     id INTEGER PRIMARY KEY,
        //     ip TEXT
        //   );
        // `;

        this.db.run(query, (err) => {
            if (err) {
                console.error(`Error creating table: ${err.message}`);
            } else {
                console.log(`Table 'blocked_ips' created or already exists`);
            }
        });
    }

    addBlockedIP(ip) {
        const date = new Date().toISOString()
        const insertQuery = 'INSERT INTO blocked_ips (ip,date) VALUES (?,?)';

        this.db.run(insertQuery, [ip, date], (err) => {
            if (err) {
                console.error(`Error adding blocked IP: ${err.message}`);
            } else {
                console.log(`IP added to 'blocked_ips' table: ${ip}`);
            }
        });
    }

    closeConnection() {
        this.db.close((err) => {
            if (err) {
                console.error(`Error closing SQLite database: ${err.message}`);
            } else {
                console.log(`Closed SQLite database connection`);
            }
        });
    }
    getBlockedIPs() {
        return new Promise((resolve, reject) => {
            const selectQuery = 'SELECT ip FROM blocked_ips';

            this.db.all(selectQuery, (err, rows) => {
                if (err) {
                    console.error(`Error getting blocked IPs: ${err.message}`);
                    reject(err);
                } else {
                    const blockedIPs = rows.map(row => row.ip);
                    resolve(blockedIPs);
                }
            });
        });
    }
}

export default SQLiteModule;
