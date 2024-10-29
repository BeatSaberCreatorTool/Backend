import { getConnection } from "../database";

export async function createUpdateTwitch(discord_id: string, twitch_name: string) {
    const connection = await getConnection();
    
    // check if the user exists in the db, if not, create a new user, if yes, update the user if needed
    const [rows, fields] = await connection.query(`
        SELECT * FROM twitch_users WHERE discord_id = ?
    `, [discord_id]);

    // @ts-ignore
    if (rows.length === 0) {
        await connection.query(`
            INSERT INTO twitch_users (discord_id, twitch_name) VALUES (?, ?)
        `, [discord_id, twitch_name]);
        // @ts-ignore
    } else if (rows[0].twitch_name !== twitch_name) {
        await connection.query(`
            UPDATE twitch_users SET twitch_name = ? WHERE discord_id = ?
        `, [twitch_name, discord_id]);
    }

    return;
}