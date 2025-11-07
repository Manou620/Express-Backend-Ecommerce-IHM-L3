const {verify} = require("jsonwebtoken");


const checkToken =(req, res, next) => {
    const authHeader = req.headers.authorization;
    console.log(authHeader)
    if(authHeader){
        const token = authHeader.split(" ")[1];

        verify(token, process.env.JSON_TOKEN_KEY, (err, user) => {//ou payload ou data
            if(err) {
                return res.status(403).json("Token invalide");
            }
            console.log(user)
            
            //assignena user (user decodé) ny request (ho accedena ary am fonction de delete am controller izay antsoina afarn'ity middleware ty)
            req.user = user;
            //on passe a la suite (les valeurs modifie de req sont desormais accessible a tout les fonction appelées apres ce middleware)
            next();
        });
    }else{
        res.status(401).json("Vous n'etes pas authentifié");
    }
}

//Product auth Middleware
const chekProductUpdateAuthorization = (req, res, next) => {
    if(req.user.id_utilisateur === req.body.id_proprietaire || req.user.role === "administrateur"){
        next();
    }else{
        return res.status(403).json("Action non-autorisé");
    }
}

const ckeckProductUserLaunching = (req, res, next) => {
    if(req.user.id_utilisateur === req.body.id_utilisateur ){
        next();
    }else{
        return res.status(403).json("Action non-autorisé");
    }
}

const ckeckProductAuthorization = (req, res, next) => {
    if(req.user.role === "administrateur" ){
        next();
    }else{
        return res.status(403).json("Action non-autorisé");
    }
}

//Aticle middleware
const checkArticleActionAuthorization = (req, res, next) => {
    console.log("REquest BOdy")
    console.log(req.body)
    if(req.user.id_utilisateur === req.body.id_proprietaire){
        next();
    }else{
        return res.status(403).json("Action non-autorisé");
    }
}


module.exports = {
    checkToken,
    chekProductUpdateAuthorization,
    ckeckProductUserLaunching,
    ckeckProductAuthorization,
    checkArticleActionAuthorization
}