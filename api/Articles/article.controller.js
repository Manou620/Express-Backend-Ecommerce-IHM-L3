const {
    createArticle,
    insertConfigArticle,
    deleteArticle,
    updateArticle,
    getArticles,
    getArticlesByUser,
    getAllArticlesForOneProduct,
    getArticlesCommandNumber
} = require('./article.service');
const {getVariationAndOptionsPromised} = require('../variations/variation.service')
const {
    FormatVariationOptionList
} = require('../../util/QueryHelper');


module.exports = {
    creatingArticle : async (req, res) => {
        if(!req.body){
            return res.json({
                success : 0,
                message : "Valeur vide soumis"
            })
        }
        console.log("Req Body")
        console.log(req.body)
        const newArticle = await createArticle(req, (error) => {
            console.log(error)
            return res.json({
                success : 0,
                message : "erreur de requette"
            })
        });
        console.log(newArticle);
        insertConfigArticle(req.body, newArticle.insertId, req.file.filename,(err, result) => {
            if(err){
                console.log(err);
                deleteArticle([newArticle.insertId]);
                return
            }
            if(!result){
                console.log(result)
                deleteArticle([newArticle.insertId]);
                return res.json({
                    success : 0,
                    message : "L'insertion a échouée"
                })
            }
            return res.status(200).json({
                success : 1,
                message : "L'insertion a reussi"
            });
        })
    },

    updatingArticle : (req, res) => {
        if(!req.body){
            return res.json({
                success : 0,
                message : "Valeur vide soumis"
            })
        }
        updateArticle(req.body, (err, result) => {
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
    },

    gettingArticle : (req, res) => {
        if(!req.query){
            return res.json({
                success: 0,
                message : "Parametre de requette vide envoyé"
            })
        }
        getArticles(req.query, (err, result) => {
            if(err){
                console.log(err);
                return;
            }
            if(!result.articleList || (Array.isArray(result.articleList) && result.articleList.length === 0)){
                return res.json({
                    success: 0,
                    message: "Pas d'article trouvé"
                })
            }
            console.log(" articleList")
            console.log(result.articleList)
            return res.json({
                success: 1,
                data: result
            })
        })
    },

    gettingArticleByUser : (req, res) => {
        if(!req.query){
            return res.json({
                success: 0,
                message : "Parametre de requette vide envoyé"
            })
        }
        getArticlesByUser(req.query, (err, result) => {
            if(err){
                console.log(err);
                return;
            }
            if(!result.articleList || (Array.isArray(result.articleList) && result.articleList.length === 0)){
                return res.json({
                    success: 0,
                    message: "Pas d'article trouvé"
                })
            }
            console.log(" articleList")
            console.log(result.articleList)
            return res.json({
                success: 1,
                data: result
            })
        })
    },

    deletingArticle : (req, res) => {
        deleteArticle(req.query.data, (err, result) => {
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

    gettingAllPossibleArticleOfProduct : async (req, res) => {
        try {
            let variations = await getVariationAndOptionsPromised(req.query.id_category, (err) => {
                if(err){
                    console.log(err)
                    return res.json({
                        success : 0,
                        message : "erreur lors du selection des articles",
                    })
                }
            });
            console.log("eto")
            variations = FormatVariationOptionList(variations);
            console.log(variations);

            getAllArticlesForOneProduct(req.query, variations, (err, result) => {
                if(err){
                    console.log(err);
                    return
                }
                if(!result || (Array.isArray(result) && result === 0)){
                    return res.json({
                        success: 0,
                        message: "Pas d'article trouvé"
                    })
                }
                console.log(result);
                return res.json({
                    success: 1,
                    data: result
                })
            })
            ////////// 

        } catch (error) {
            
        }
    },

    gettingTheNumberOfCommandOfAnArticle : (req, res) => {
        if(!req.query){
            return res.json({
                success: 0,
                message : "Parametre de requette vide envoyé"
            })
        }
        console.log(req.query);
        getArticlesCommandNumber(req.query, (err, result) => {
            if(err){
                console.log(err);
                return
            }
            if(!result){
                return res.json({
                    success: 0,
                    message: "Pas de commande"
                })
            }
            console.log(result);
            return res.json({
                success: 1,
                data: result
            })
        })
    }
}