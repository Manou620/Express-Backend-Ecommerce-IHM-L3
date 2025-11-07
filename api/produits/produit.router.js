const {
    creatingProduit,
    deletingProduits, 
    updatingProduitByUser,
    settingProduitAuthorization,
    settingUserLaunching,
    gettingProduits
} = require("./produit.controller")
//Middleware
const {
    checkToken,
    ckeckProductAuthorization,
    chekProductUpdateAuthorization,
    ckeckProductUserLaunching
} = require("../../util/Auth/TokenValidation");

const router = require("express").Router();

//const {upload} = require('../../util/Images_middleware/setImages');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination : ( req, file, callback) => {
        callback(null, 'public/images/product_image')
    },
    filename: (req, file, callback) => {
        callback(null, file.fieldname + "_" + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage
})

//module.exports = upload



router.get("/", gettingProduits);
router.post("/", checkToken, upload.single('product_image'), creatingProduit);
router.patch("/", checkToken, chekProductUpdateAuthorization, updatingProduitByUser);
router.patch("/autorisation", checkToken, ckeckProductAuthorization, settingProduitAuthorization);
router.patch("/lancement", checkToken, ckeckProductUserLaunching, settingUserLaunching);
router.delete("/", checkToken, deletingProduits)

module.exports = router;