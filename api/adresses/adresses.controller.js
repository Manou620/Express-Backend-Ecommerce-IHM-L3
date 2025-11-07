const {
    getUserAdress
} = require('./adresses.service');

const gettingUserAdress = (req, res) => {
    console.log(req.query);
    if(!req.query){
        return res.json({
            success: 0,
            message : "Parametre de requette vide envoyé"
        })
    }
    getUserAdress( req.query.id_user, (err, result) => {
        if(err){
            console.log(err);
            return;
        }
        if(!result || (Array.isArray(result) && result.length === 0)){
            return res.json({
                success: 0,
                message: "Pas d'adresse trouvé"
            })
        }
        console.log(" adresseList")
        console.log(result)
        return res.json({
            success: 1,
            data: result
        })
    })
}

module.exports = {
    gettingUserAdress
}