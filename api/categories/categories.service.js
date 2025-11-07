const { SELECT } = require('sequelize/lib/query-types');
const pool = require('../../config/database');
const { Result } = require('express-validator');
const { resolve } = require('path');

module.exports = {
    getCategories : (callback) => {
        pool.query(
            `SELECT * FROM categorie`,
            [],
            (error, result, fields) => {
                if(error){
                    callback(error);
                }
                return callback(null, result);
            }
        )
    },

    getCategoriesByProduct : (id_produit, callback) => {
        return new Promise ((resolve, reject) => {
             pool.query(
                `SELECT categorie.* FROM categorie 
                    JOIN produit ON produit.ID_CATEGORIE = categorie.ID_CATEGORIE
                    WHERE produit.id_produit = ? ;
                    `,
                [id_produit],
                (error, result, fields) => {
                    if(error){
                        reject(error);
                    }
                    resolve(result);
                }
            )
        })
       
    }
}