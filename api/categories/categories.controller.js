const {
    getCategories
} = require('./categories.service');

module.exports = {
    gettingArticle : (req, res) => {
        getCategories((err, result) => {
            if(err){
                console.log(err);
                return;
            }
            if(!result){
                return res.json({
                    success: 0,
                    message: "Pas de categorie trouvé"
                })
            }
            return res.status(200).json({
                success: 1,
                data: result
            })
        })
    }
}