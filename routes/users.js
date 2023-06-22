const express = require('express');
const router = express.Router();
const Usercontroller = require('../controllers/users');
const { authByToken } = require('../middleware/auth');

router.post('/sign-up', Usercontroller.signUp);
router.post('/log-in', Usercontroller.login);
router.get('/user', authByToken, Usercontroller.getUserData);
router.get('/log-out', authByToken, Usercontroller.logout);
router.get('/get-log-details', authByToken, Usercontroller.getLogDetails);
router.post('/update-password', authByToken, Usercontroller.updatePassword);


module.exports = router;
