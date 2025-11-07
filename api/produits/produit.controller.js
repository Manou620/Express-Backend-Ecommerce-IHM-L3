const {
    createProduct,
    getProduits,
    deleteProduits,
    SetUserLaunching,
    SetProduitAuthorization,
    updateProduitByUser
} = require("./produit.service");

module.exports = {
    creatingProduit: (req, res) => {
        console.log(req.body);
        if(!req.body) {
            return res.json({
                success : 0,
                message : 'Valeur vide soumis'
            });
        }  
        createProduct(req, req.user.id_utilisateur, (err, result, fields) => {
            if(err){
                console.log(err);
                return res.status(500).json({
                    success: 0,
                    message: "Database connection error"
                });
            }

            return res.status(200).json({
                success : 1,
                message : "Ajout de produit reussi"
            });
        })
    },

    gettingProduits : (req, res) => {
        if(!req.query){
            return res.json({
                success: 0,
                message : "Parametre de requette vide envoyé"
            })
        }
        getProduits(req.query, (err, result) => {
            if(err){
                console.log(err);
                return;
            }
            if(!result.produitList || (Array.isArray(result.produitList) && result.produitList.length === 0)){
                return res.json({
                    success: 0,
                    message: "Pas de produits trouvé"
                })
            }
            console.log(" prduit list")
            console.log(result.produitList)
            return res.json({
                success: 1,
                data: result
            })
        })
    },

    deletingProduits : (req, res) => {
        deleteProduits(req.query.data, (err, result) => {
            if(err){
                console.log(err);
                return;
            }
            if(!result){
                return res.json({
                    success: 0,
                    message: "Suppression echoué"
                });
            }
            return res.json({
                success: 1,
                message: "Produit supprimé"
            });
        })
    },

    settingUserLaunching : (req, res) => {
        //validator
        SetUserLaunching(req.body, (err, result) => {
            if(err){
                console.log(err);
                return;
            }
            if(!result){
                if(req.body.user_launching === 1){
                    return res.json({
                        success: 0,
                        message: "l'activation a echoué echoué"
                    });
                }else{
                    return res.json({
                        success: 0,
                        message: "le retrait du produit a echoué echoué"
                    });
                }
            }
            if(req.body.user_launching === 1){
                return res.json({
                    success: 1,
                    message: "Lancement reussi"
                });
            }else{
                return res.json({
                    success: 1,
                    message: "le retrait a reussi"
                });
            }

        })
    },

    settingProduitAuthorization : (req, res) => {
        //  validator
        SetProduitAuthorization(req.body, (err, result) => {
            if(err){
                console.log(err);
                return;
            }
            if(!result){
                if(req.body.autorisation === 1){
                    return res.json({
                        success: 0,
                        message: "l'autorisation a echoué echoué"
                    });
                }else{
                    return res.json({
                        success: 0,
                        message: "la suspension du produit a echoué echoué"
                    });
                }
            }
            if(req.body.autorisation === 1){
                return res.json({
                    success: 1,
                    message: "Produit autorisé"
                });
            }else{
                return res.json({
                    success: 1,
                    message: "Produit suspendu"
                });
            }
        })
    },

    updatingProduitByUser : (req, res) => {
        //validation
        console.log(req.body.data);
        updateProduitByUser(req.body.data, (err, result) => {
            if(err){
                console.log(err);
                return
            }
            if(!result){
                console.log(result)
                return res.json({
                    success : 0,
                    message : "Mis a jour échouée"
                })
            }
            return res.json({
                success : 1,
                message : "Mis a jour reussi"
            });
        })
    }


}