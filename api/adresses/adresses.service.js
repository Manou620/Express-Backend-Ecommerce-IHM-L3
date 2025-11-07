const pool = require('../../config/database');

const getUserAdress = (id_user, callback) => {
    pool.query(
        ' SELECT * FROM `adresse` WHERE adresse.ID_UTILISATEUR = ? ',
        id_user,
        (error, result, fields) => {
            if(error) {
                callback(error);
            }
            return callback(null, result);
        }
    )
}

module.exports = {
    getUserAdress
}