import mysql from 'mysql2/promise';

export class Database {
    private static instance: Database;
    private connection: mysql.Connection;

    private host: string = '';
    private user: string = '';
    private password: string = '';
    private database: string = '';

    constructor(host: string, user: string, password: string, database: string) {
        this.host = host;
        this.user = user;
        this.password = password;
        this.database = database;
    }

    async connect() {
        if (!await this.checkConnection()) {
            this.connection = await mysql.createConnection({
                host: this.host,
                user: this.user,
                password: this.password,
                database: this.database
            });

            console.log(`Connected to ${this.database}`);
        }
    }

    async getConnection() {
        if (!await this.checkConnection()) await this.connect();
        return this.connection;
    }

    async checkConnection() {
        if (!this.connection) return false;
        return (await this.connection.query("SELECT 1").then(() => true, () => false));
    }
}