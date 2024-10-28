import express from 'express';


const router = express.Router();

router.get('/login', (req, res) => {
  res.redirect(process.env.DISCORD_REDIRECT_URI);
});

export default router;