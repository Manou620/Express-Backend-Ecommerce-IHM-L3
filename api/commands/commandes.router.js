const { checkToken } = require('../../util/Auth/TokenValidation');
const {
    creatingCommands
} = require('./commandes.controller');

const router = require('express').Router();

router.post('/', checkToken, creatingCommands);

module.exports = router;