const {
    createCommands
} = require('./commandes.service');

const creatingCommands = (req, res) => {
    if(!req.body){
        return res.json({
            success: 0,
            message : "Parametre de requette vide envoyé"
        })
    }
    console.log("#################################################################################")
    console.log(req.body)
    createCommands(req.body, (err, result) => {
        if(err){
            console.log(err);
            return;
        }
        if(!result){
            return res.json({
                success: 0,
                message: "Erreur d'insertion"
            });
        }
        console.log(result);
        return res.json({
            success: 1,
            message: "Commande enregistré"
        })
    })
}

module.exports = {
    creatingCommands
}