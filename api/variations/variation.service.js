const pool = require('../../config/database');

module.exports = {
    getVariationAndOptions : (id_category, callback) => {
        pool.query(
            `WITH RECURSIVE categoryHierarchie AS (
                SELECT categorie.ID_CATEGORIE, categorie.ID_CATEGORIE_PARENT, categorie.NOM_CATEGORIE
                FROM categorie
                WHERE categorie.ID_CATEGORIE = ?

                UNION ALL
                
                SELECT categorie.ID_CATEGORIE, categorie.ID_CATEGORIE_PARENT, categorie.NOM_CATEGORIE
                FROM categorie
                JOIN categoryHierarchie ch ON categorie.ID_CATEGORIE = ch.ID_CATEGORIE_PARENT
            )
            SELECT 
            variation.ID_VARIATION, 
            variation.NOM_VARIATION, 
            option_de_variation.ID_OPTION,
            option_de_variation.VALEUR_OPTION
            FROM variation
            LEFT JOIN option_de_variation 
            ON variation.ID_VARIATION = option_de_variation.ID_VARIATION
            WHERE variation.ID_CATEGORIE IN (
                SELECT ID_CATEGORIE FROM categoryHierarchie
            )`,
            [
                id_category
            ],
            (error, result, fields) => {
                if(error) {
                    return callback(error);
                }
                console.log(result)
                return callback(null, result);
            }
        )
    },

    getVariationAndOptionsPromised : (id_category, callback) => {
        return new Promise ((resolve, reject) => {
            pool.query(
                `WITH RECURSIVE categoryHierarchie AS (
                    SELECT categorie.ID_CATEGORIE, categorie.ID_CATEGORIE_PARENT, categorie.NOM_CATEGORIE
                    FROM categorie
                    WHERE categorie.ID_CATEGORIE = ?

                    UNION ALL
                    
                    SELECT categorie.ID_CATEGORIE, categorie.ID_CATEGORIE_PARENT, categorie.NOM_CATEGORIE
                    FROM categorie
                    JOIN categoryHierarchie ch ON categorie.ID_CATEGORIE = ch.ID_CATEGORIE_PARENT
                )
                SELECT 
                variation.ID_VARIATION, 
                variation.NOM_VARIATION, 
                option_de_variation.ID_OPTION,
                option_de_variation.VALEUR_OPTION
                FROM variation
                LEFT JOIN option_de_variation 
                ON variation.ID_VARIATION = option_de_variation.ID_VARIATION
                WHERE variation.ID_CATEGORIE IN (
                    SELECT ID_CATEGORIE FROM categoryHierarchie
                )`,
                [
                    id_category
                ],
                (error, result, fields) => {
                    if(error) {
                        console.log(error);
                        callback(error);
                        reject(error)
                    }
                    console.log("promesse eto")
                    console.log(result)
                    resolve(result);
                }
            )
        })
        
    }


}