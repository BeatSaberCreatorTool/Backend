import { getConnection } from "../database";

export async function createUpdateUser(discord_id: string, username: string, email: string) {
    const connection = await getConnection();
    
    // check if the user exists in the db, if not, create a new user, if yes, update the user if needed
    const [rows, fields] = await connection.query(`
        SELECT * FROM users WHERE discord_id = ?
    `, [discord_id]);

    // @ts-ignore
    if (rows.length === 0) {
        await connection.query(`
            INSERT INTO users (discord_id, username, email) VALUES (?, ?, ?)
        `, [discord_id, username, email]);
        // @ts-ignore
    } else if (rows[0].username !== username || rows[0].email !== email) {
        await connection.query(`
            UPDATE users SET username = ?, email = ? WHERE discord_id = ?
        `, [username, email, discord_id]);
    }

    return;
}