const {
    gettingVariationAndOptions
} = require('./variation.controller');

const router = require('express').Router();

router.get("/", gettingVariationAndOptions);

module.exports = router

