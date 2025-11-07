const {
    gettingUserAdress
} = require('./adresses.controller');

const router = require('express').Router();

router.get('/', gettingUserAdress);

module.exports = router