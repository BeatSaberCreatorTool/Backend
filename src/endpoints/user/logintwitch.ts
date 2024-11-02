import express from 'express';


const router = express.Router();

router.get('/logintwitch', (req, res) => {
  
  res.redirect(process.env.TWITCH_REDIRECT_URI);
});

export default router;