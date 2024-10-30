import express from 'express';


const router = express.Router();

router.get('/getuser', (req, res) => {
  res.status(200).json(
    req.session.userProfile
  )
});

export default router;