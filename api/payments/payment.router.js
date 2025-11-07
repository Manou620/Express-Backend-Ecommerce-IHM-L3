const {
    gettingUserPayment
} = require('./payment.controller');

const router = require('express').Router();

router.get('/', gettingUserPayment);

module.exports = router