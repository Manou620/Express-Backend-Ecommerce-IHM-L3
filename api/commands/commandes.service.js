const pool = require('../../config/database');

module.exports = {
    createCommands : (data, callback) => {
        console.log("data hjvkfdjnbgbklngfklhgflkhngfkl");
        console.log(data);
        const {insertQuery, queryParams} = insertCommandsQueryBuilder(data);
        if(insertQuery){
            pool.query(
                insertQuery,
                queryParams,
                (error, result, fields) => {
                    if(error){
                        callback(error);
                    }
                    return callback(null, result);
                }
            )
        }
    }
}

const insertCommandsQueryBuilder = (data) => {
    if(Array.isArray(data.cartItems) && data.cartItems.length > 0) {
        let queryParams = [];
        let insertQuery = `INSERT INTO commande 
            (ID_ADRESSE, ID_METHODE_PAYMENT, ID_ARTICLE, ID_UTILISATEUR, QUANTITE_COMMANDE, DATE_COMMANDE) 
            VALUES `;
        for (let index = 0; index < data.cartItems.length; index++) {
            //const element = array[index];
            insertQuery += ` (?, ?, ?, ?, ?, CURDATE()) ${ index < data.cartItems.length - 1 ? ',' : ''}`;
            queryParams.push(data.id_adresse);
            queryParams.push(data.id_payment);
            queryParams.push(data.cartItems[index].id_article);
            queryParams.push(data.cartItems[index].id_utilisateur);
            queryParams.push(data.cartItems[index].quantite_commande);
            //placen'ny date de livraison
        }
        return {insertQuery, queryParams};
    }
    return null;
}