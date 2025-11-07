const {
    gettingArticle
} = require('./categories.controller');

const router = require('express').Router();

router.get("/", gettingArticle);

module.exports = router