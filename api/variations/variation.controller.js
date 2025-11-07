const {
    getVariationAndOptions
} = require('./variation.service');

const {
    FormatVariationOptionList
} = require('../../util/QueryHelper');

module.exports = {
    gettingVariationAndOptions : (req, res) => {
        if(!req.query){
            return res.json({
                success : 0,
                message : "Paramatre de requette vide envoyé"
            })
        }
        getVariationAndOptions(req.query.id_category, (err, result) => {
            if(err){
                console.log(err);
                return
            }
            if(!result || (Array.isArray(result) && result === 0)){
                return res.json({
                    success: 0,
                    message: "Pas d'option trouvé"
                })
            }
            console.log(result)
            return res.json({
                success: 1,
                data: FormatVariationOptionList(result)
            })
        })
    }
};
