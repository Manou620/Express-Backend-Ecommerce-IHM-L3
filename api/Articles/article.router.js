const {
    creatingArticle,
    updatingArticle,
    gettingArticle, 
    gettingArticleByUser,
    deletingArticle,
    gettingAllPossibleArticleOfProduct,
    gettingTheNumberOfCommandOfAnArticle
} = require('./article.controller');
const {
    checkToken,
    checkArticleActionAuthorization
} = require('../../util/Auth/TokenValidation');

const router = require('express').Router();
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination : ( req, file, callback) => {
        callback(null, 'public/images/article_image')
    },
    filename: (req, file, callback) => {
        callback(null, file.fieldname + "_" + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage
})


router.post("/", checkToken, upload.single('article_image') ,creatingArticle);
// router.post("/", checkToken, checkArticleActionAuthorization, creatingArticle);
router.patch("/", checkToken, checkArticleActionAuthorization, updatingArticle);
router.get("/possible", checkToken, gettingArticle);
router.get("/userArticle", checkToken, gettingArticleByUser);
router.get("/allProductArticles", gettingAllPossibleArticleOfProduct);
router.get("/totalQteCommanded", gettingTheNumberOfCommandOfAnArticle);
router.delete("/", checkToken, checkArticleActionAuthorization, deletingArticle);

module.exports = router;
