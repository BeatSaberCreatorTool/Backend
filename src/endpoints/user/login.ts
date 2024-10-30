import express from 'express';


const router = express.Router();

import sessionValidator from '../../middleware/sessionValidator';

router.get('/login', sessionValidator, (req, res) => {
  
  res.redirect("/dashboard");
});

export default router;