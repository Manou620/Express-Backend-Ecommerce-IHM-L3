const { Result } = require("express-validator")
const pool = require("../../config/database")
const {executeQuery, checkClauseQuery} = require('../../util/QueryHelper');

module.exports = {

    createUser :(data, callback) => {
        pool.query(
            `INSERT INTO utilisateur (NOM_UTILISATEUR, MOT_DE_PASSE, CONTACT, MAIL) VALUES (?,?,?,?) ;`,
            [
                data.nom_utilisateur,
                data.mot_de_passe,
                data.contact,
                data.mail
            ],
            (error, result, fields) => {
                if(error){
                    return callback(error);
                }
                console.log(fields)
                return callback(null, result, fields);
            }
        )
    },

    getUserByMailOrContact : (searchData, callback) => {
        pool.query(
            `SELECT * FROM utilisateur WHERE MAIL = ? OR CONTACT = ?`,
            [
                searchData,
                searchData
            ],
            (error, result, fields) => {
                if(error){
                    return callback(error);
                }
                return callback(null, result[0])
            }
        )
    },

    deleteUser : (id_utilisateur,callback) => {
        pool.query(
            `DELETE FROM utilisateur WHERE ID_UTILISATEUR = ?`,
            [id_utilisateur],
            (error, result, fielss) => {
                if(error){
                    return callback(error);
                }
                return callback(null, result);
            }
        )
    },

    createNewUserPromised : (data, callback) => {
        return new Promise ((resolve, reject) => {
            pool.query(
                `INSERT INTO utilisateur (NOM_UTILISATEUR, MOT_DE_PASSE, CONTACT, MAIL) VALUES (?,?,?,?)`,
                [
                    data.nom_utilisateur,
                    data.mot_de_passe,
                    data.contact,
                    data.mail
                ],
                (err, result, fields) => {
                    if(err){
                        callback(err);
                        reject(err);
                    }else{
                        resolve(result);
                    }
                }
            )
        })
    },

    getAdditionalUserInfo : (user_id, callback) => {
        return new Promise ((resolve, reject) => {
            pool.query(
                `SELECT * FROM utilisateur WHERE ID_UTILISATEUR = ?`,
                [
                    user_id
                ],
                (err, result, fields) => {
                    if(err){
                        callback(err);
                        reject(err);
                    }else{
                        resolve(result);
                    }
                }
            )
        })
    },

    getUsers : async (params, callback) => {
        const {getUserQuery, pagitationQuery, queryData} = getUsersQueryBuilder(params);
        var results = {
            userList : await executeQuery(getUserQuery, queryData, callback),
            pageNumber : await executeQuery(pagitationQuery, queryData, callback)
        }
        console.log(results);
        return callback(null, results);
    },

    updateUserByUser : (data, callback) => {
        pool.query(
            `UPDATE utilisateur SET NOM_UTILISATEUR=?, CONTACT=?, MAIL=? WHERE  ID_UTILISATEUR = ?`,
            [
                data.nom_utilisateur,
                data.contact,
                data.mail,            
                data.id_utilisateur,
            ],
            (error, result, fields) => {
                if(error) {
                    callback(error);
                }
                return callback(null, result);
            }
        )
    },

    updateUserByAdmin : (data, callback) => {
        pool.query(
            `UPDATE utilisateur SET  ROLE=?, SUSPENDU=?, PEUT_VENDRE=? WHERE  ID_UTILISATEUR = ?`,
            [
                data.role,
                data.suspendu,
                data.peut_vendre,
                data.id_utilisateur
            ],
            (error, result, fields) => {
                if(error) {
                    callback(error);
                }
                return callback(null, result);
            }
        )
    }

    
}

const getUsersQueryBuilder = (params) => {
    let getUserQuery = `SELECT ID_UTILISATEUR, NOM_UTILISATEUR, ROLE, CONTACT, MAIL, PEUT_VENDRE, SUSPENDU, DATE_INSCRIPTION FROM utilisateur `;
    let paramsQuery = '';
    let queryData = [];

    if(params.additional_parameter !== 0){
        paramsQuery += 'WHERE ';
        let clauseQuery = '';

        if(params.id_utilisateur !== ''){
            clauseQuery += 'ID_UTILISATEUR = ? ';
            queryData.push(params.id_utilisateur);
            console.log("ato")
        }
        if(params.nom_utilisateur !== ''){
            clauseQuery += `${checkClauseQuery(clauseQuery)} NOM_UTILISATEUR LIKE ? `;
            queryData.push('%'+ params.nom_utilisateur + '%');
        }
        if(params.role !== ''){
            clauseQuery += `${checkClauseQuery(clauseQuery)} ROLE = ? `;
            queryData.push(params.role);
        }
        if(params.contact !== ''){
            clauseQuery += `${checkClauseQuery(clauseQuery)} CONTACT = ? `;
            queryData.push(params.contact);
        }
        if(params.mail !== ''){
            clauseQuery += `${checkClauseQuery(clauseQuery)} MAIL LIKE ? `;
            queryData.push('%'+ params.mail + '%');
        }
        if(params.peut_vendre !== ''){
            clauseQuery += `${checkClauseQuery(clauseQuery)} PEUT_VENDRE = ? `;
            queryData.push(params.peut_vendre);
        }
        if(params.suspendu !== ''){
            clauseQuery += `${checkClauseQuery(clauseQuery)} SUPENDU = ? `;
            queryData.push(params.suspendu);
        }
        if((params.debut_date_inscription !== '' && params.debut_date_inscription !== undefined) || (params.fin_date_inscription !== '' && params.fin_date_inscription  !== undefined)){
            clauseQuery += `${checkClauseQuery(clauseQuery)} DATE_INSCRIPTION `;
            if(params.debut_date_inscription !== '' && params.fin_date_inscription === '' ){
                clauseQuery += ` > ? `
                queryData.push(params.debut_date_inscription)
            }else if(params.debut_date_inscription === '' && params.fin_date_inscription !== '' ){
                clauseQuery += ` < ? `
                queryData.push(params.fin_date_inscription)
            }else if(params.debut_date_inscription !== '' && params.fin_date_inscription !== '' ){
                clauseQuery += ` (BETWEEN ? AND ?) `;
                queryData.push(params.debut_date_inscription)
            }
        }
        paramsQuery += clauseQuery;
    }

    getUserQuery += paramsQuery + ` ORDER BY ` + params.order_by + ` LIMIT ` + params.limit + ` OFFSET ` + params.offset;
    let pagitationQuery = 'SELECT CEIL(COUNT(*) / ' + params.limit + ' ) AS total_page FROM utilisateur ' + paramsQuery

    console.log(params);
    console.log(getUserQuery);
    console.log(pagitationQuery);
    console.log(queryData)

    return {getUserQuery, pagitationQuery, queryData}

}


