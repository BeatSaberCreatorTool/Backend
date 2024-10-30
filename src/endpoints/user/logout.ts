import express from 'express';


const router = express.Router();

router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            res.redirect('/error/500.html');
        } else {
            res.redirect('/');
        }
    });
});

export default router;