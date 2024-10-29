import { Database } from "./dataclass";

export { createUpdateUser } from "./tools/createUpdateUser";
export { createUpdateTwitch } from "./tools/createUpdateTwitch";

let database: Database;

export async function connect() {
    const host = process.env.DB_HOST;
    const user = process.env.DB_USER;
    const password = process.env.DB_PASS;
    const databaseName = process.env.DB_NAME;

    database = new Database(host, user, password, databaseName);
    await database.connect();
}

export async function init() {
    await connect();

    const connection = await database.getConnection();
    await connection.query(`
        CREATE TABLE IF NOT EXISTS users (
            id INT PRIMARY KEY AUTO_INCREMENT,
            discord_id VARCHAR(255) NOT NULL,
            username VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL
        )
    `);

    await connection.query(`
        CREATE TABLE IF NOT EXISTS twitch_users (
            id INT PRIMARY KEY AUTO_INCREMENT,
            twitch_name VARCHAR(255) NOT NULL,
            discord_id VARCHAR(255) NOT NULL
        )
    `);

    await connection.query(`
        CREATE TABLE IF NOT EXISTS authcodes (
            id INT PRIMARY KEY AUTO_INCREMENT,
            code VARCHAR(255) NOT NULL,
            user_id VARCHAR(255) NOT NULL,
            expires_at DATETIME NOT NULL
        )
    `);

    await connection.query(`
        CREATE TABLE IF NOT EXISTS linked_devices (
            id INT PRIMARY KEY AUTO_INCREMENT,
            user_id VARCHAR(255) NOT NULL,
            device_id VARCHAR(255) NOT NULL,
            device_name VARCHAR(255) NOT NULL,
            password VARCHAR(255) NOT NULL
        )
    `);
}

export async function getConnection() {
    return database.getConnection();
}

export async function getDatabase() {
    return database;
}

