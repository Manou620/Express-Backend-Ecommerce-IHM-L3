const pool = require('../../config/database');

const getUserPayments = (id_user, callback) => {
    pool.query(
        ' SELECT * FROM `methode_payment` WHERe methode_payment.ID_UTILISATEUR = ?',
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
    getUserPayments
}