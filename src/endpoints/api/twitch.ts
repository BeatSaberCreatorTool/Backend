import express from 'express';
import { getConnection } from '../../database/database';

const router = express.Router();

router.get('/get', async (req, res) => {
  let connection;

  try {
    connection = await getConnection();
    const userID = req.session?.userProfile?.id;

    if (!userID) {
      res.status(400).json({ error: 'User ID not found in session' });
      return;
    }

    const [rows] = await connection.execute('SELECT * FROM twitch_users WHERE discord_id = ?', [userID]);

    // @ts-ignore
    if (rows.length > 0) {
      const userData = {
        // @ts-ignore
        twitch: rows[0].twitch_name,
        exists: true
      };
      res.status(200).json(userData);
      return;
    } 

    res.status(200).json({ exists: false });
    return;
    
  } catch (error) {
    console.error('Database query error:', error);
    res.status(500).json({ error: 'Internal server error' });
    return;
  }
});

router.delete('/delete', async (req, res) => {
  let connection;

  try {
    connection = await getConnection();
    const userID = req.session?.userProfile?.id;

    if (!userID) {
      res.status(400).json({ error: 'User ID not found in session' });
      return;
    }

    await connection.execute('DELETE FROM twitch_users WHERE discord_id = ?', [userID]);
    res.status(200).json({ success: true });
    return;

  } catch (error) {
    console.error('Database query error:', error);
    res.status(500).json({ error: 'Internal server error' });
    return;
  }
});

export default router;
