import express from 'express';


const router = express.Router();

router.get('/get', (req, res) => {
  res.status(200).json(
    req.session.userProfile
  )
});

export default router;