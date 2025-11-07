const {
    creatingUser,
    login,
    deletingUser,
    UserRegistering,
    gettingUsers,
    updatingUserByUser,
    updatingUserByAdmin
} = require("./user.controller");

const router = require("express").Router();

//checktoken
const {checkToken} = require("../../util/Auth/TokenValidation");

router.get("/", gettingUsers);
router.post("/", creatingUser);
router.patch("/byUser", updatingUserByUser);
router.patch("/byAdmin", updatingUserByAdmin);
router.post("/inscription", UserRegistering);
router.post("/login", login);
router.post("/refresh", login);
router.delete("/:id_utilisateur", checkToken, deletingUser);

module.exports = router;