const { Result } = require("express-validator")
const pool = require("../../config/database")
const {executeQuery, checkClauseQuery, deleteQueryBuilder} = require('../../util/QueryHelper');
const fs = require('fs');

module.exports = {

    createProduct : (requestData, user_id, callback) => {
        const data = requestData.body
        const imageName = requestData.file.filename
        pool.query(
            `INSERT INTO PRODUIT (ID_UTILISATEUR, ID_CATEGORIE, NOM_PRODUIT, DESCRIPTION_PRODUIT, CONSIGNE_ENTRETIENT, A_PROPOS, MATERIEL, MARQUE, IMAGE, DATE_MIS_EN_VENTE, ACTIVATION_UTILISATEUR, AUTORISATION_VENTE)
             VALUES 
            (?, ?, ?, ?, ?, ?, ?, ?, ?, CURDATE(), ?, ?)`,
            [
                user_id,
                data.id_categorie,
                data.nom_produit,
                data.description,
                data.entretient,
                data.a_propos,
                data.materiel,
                data.marque ,
                imageName,
                //data.date_vente,
                // data.user_activation,
                // data.autorisation
                1,
                1
            ],
            (error, result, fields) => {
                if(error){
                    //console.log("errrrrrrrrrr")
                    if(fs.existsSync('public/images/product_image/' + imageName)){
                        fs.unlinkSync('public/images/product_image/' + imageName);
                        console.log("image supprime");
                    }
                    return callback(error);
                }
                console.log(fields)
                return callback(null, result, fields);
            }
        )
    },

    getProduits : async (query, callback) => {
        const {getQuery, pagitationQuery, queryData} = getProduitQueryBuilder(query);
        var results = {
            produitList : await executeQuery(getQuery, queryData, callback),
            pageNumber : await executeQuery(pagitationQuery, queryData, callback)
        }
        console.log(results);
        return callback(null, results);
    },

    updateProduitByUser : (data, callback) => {
        pool.query(
            `UPDATE produit SET ID_CATEGORIE=?, NOM_PRODUIT=?, DESCRIPTION_PRODUIT=?, CONSIGNE_ENTRETIENT=?, A_PROPOS=?, MATERIEL=?, MARQUE=?, IMAGE=? WHERE  ID_PRODUIT = ?`,
            [
                data.id_categorie,
                data.nom_produit,
                data.description,
                data.entretient,
                data.a_propos,
                data.materiel,
                data.marque,            
                data.imageURL,
                data.id_produit,
            ],
            (error, result, fields) => {
                if(error) {
                    callback(error);
                }
                return callback(null, result);
            }
        )
    },

    SetUserLaunching : (data, callback) => {
        pool.query(
            `UPDATE produit SET ACTIVATION_UTILISATEUR =? WHERE ID_PRODUIT = ?`,
            [
                data.user_launching,
                data.id_produit,
            ],
            (error, result, fields) => {
                if(error) {
                    callback(error);
                }
                return callback(null, result);
            }
        )
    },

    SetProduitAuthorization : (data, callback) => {
        pool.query(
            `UPDATE produit SET AUTORISATION_VENTE =? WHERE ID_PRODUIT = ?`,
            [
                data.autorisation,
                data.id_produit,
            ],
            (error, result, fields) => {
                if(error) {
                    callback(error);
                }
                return callback(null, result);
            }
        )
    },

    deleteProduits : (data, callback) => {
        console.log(data);
        pool.query(
            deleteQueryBuilder('produit', 'ID_PRODUIT', data),
            data,
            (error, result, fields) => {
                if(error) {
                    return callback(error);
                }
                return callback(null, result);
            }
        )
    }

}

const getProduitQueryBuilder = (params) => {
let getQuery = `SELECT produit.*, categorie.NOM_CATEGORIE FROM produit JOIN categorie ON produit.ID_CATEGORIE = categorie.ID_CATEGORIE`;
    let paramsQuery = '';
    let queryData = [];

    if(params.additional_parameter !== 0){
        paramsQuery += ' WHERE ';
        let clauseQuery = '';

        if(params.id_produit !== '' && params.id_produit !== undefined){
            clauseQuery += 'ID_PRODUIT = ? ';
            queryData.push(params.id_produit);
        }
        if(params.id_utilisateur !== '' && params.id_utilisateur !== undefined){
            clauseQuery += `${checkClauseQuery(clauseQuery)} ID_UTILISATEUR = ? `;
            queryData.push(params.id_utilisateur);
        }
        if(params.id_categorie !== '' && params.id_categorie !== undefined){
            clauseQuery += `${checkClauseQuery(clauseQuery)} categorie.ID_CATEGORIE = ? `;
            queryData.push(params.id_categorie);
        }
        if(params.description_apropos_nom_marque !== '' && params.description_apropos_nom_marque !== undefined){
            clauseQuery += `${checkClauseQuery(clauseQuery)} (NOM_PRODUIT LIKE ? OR DESCRIPTION_PRODUIT LIKE ? OR A_PROPOS LIKE ? OR MARQUE LIKE ? ) `;
            queryData.push('%' + params.description_apropos_nom_marque + '%');
            queryData.push('%' + params.description_apropos_nom_marque + '%');
            queryData.push('%' + params.description_apropos_nom_marque + '%');
            queryData.push('%' + params.description_apropos_nom_marque + '%');
        }
        if(params.materiel !== '' && params.materiel !== undefined){
            clauseQuery += `${checkClauseQuery(clauseQuery)} MATERIEL  LIKE ? `;
            queryData.push('%' + params.materiel + '%');
        }
        // if(params.id_utilisateur !== '' || params.id_utilisateur !== undefined){
        //     clauseQuery += `${checkClauseQuery(clauseQuery)} ID_UTILISATEUR = ? `;
        //     queryData.push(params.id_utilisateur);
        // }
        if((params.debut_date_vente !== '' && params.debut_date_vente !== undefined) || (params.fin_date_vente !== '' && params.fin_date_vente  !== undefined)){
            clauseQuery += `${checkClauseQuery(clauseQuery)} DATE_MIS_EN_VENTE  `;
            if(params.debut_date_vente !== '' && params.fin_date_vente === '' ){
                clauseQuery += ` > ? `
                queryData.push(params.debut_date_vente)
            }else if(params.debut_date_vente === '' && params.fin_date_vente !== '' ){
                clauseQuery += ` < ? `
                queryData.push(params.fin_date_vente)
            }else if(params.debut_date_vente !== '' && params.fin_date_vente !== '' ){
                clauseQuery += ` BETWEEN ( ? AND ?) `;
                queryData.push(params.debut_date_vente)
                queryData.push(params.fin_date_vente)
            }
        }
        if(params.autorisation !== '' && params.autorisation !== undefined){
            clauseQuery += `${checkClauseQuery(clauseQuery)} AUTORISATION_VENTE  = ? `;
            queryData.push(params.autorisation);
        }else{
            clauseQuery += `${checkClauseQuery(clauseQuery)} AUTORISATION_VENTE  = 1 `;
        }
        if(params.user_activation !== '' && params.user_activation !== undefined){
            clauseQuery += `${checkClauseQuery(clauseQuery)} ACTIVATION_UTILISATEUR  = ? `;
            queryData.push(params.user_activation);
        }else{
            clauseQuery += `${checkClauseQuery(clauseQuery)} ACTIVATION_UTILISATEUR  = 1 `;
        }
        paramsQuery += clauseQuery;
    }
    getQuery += paramsQuery + ` ORDER BY ` + params.order_by + ` LIMIT ` + params.limit + ` OFFSET ` + params.offset;
    let pagitationQuery = 'SELECT CEIL(COUNT(*) / ' + params.limit + ' ) AS total_page FROM produit JOIN categorie ON produit.ID_CATEGORIE = categorie.ID_CATEGORIE' + paramsQuery;

    console.log("########################################################")
    console.log(params);
    console.log(getQuery)
    console.log(pagitationQuery);
    console.log(queryData)

    return {getQuery, pagitationQuery, queryData}
}