const { param } = require('express-validator');
const pool = require('../../config/database');
const {deleteQueryBuilder, executeQuery, checkClauseQuery} = require('../../util/QueryHelper');
//const {getCategoriesByProduct} = require('../categories/categories.service')

const deleteArticleImage = (filename) => {
    if(fs.existsSync('public/images/article_image/' + filename)){
        fs.unlinkSync('public/images/article_image/' + filename);
        console.log("image supprime");
    }
}


module.exports = {
    createArticle : (req, callback) => {
        const data = req.body;
        const imageName = req.file.filename
        return new Promise ((resolve, reject) => {
            pool.query(
                `INSERT INTO article_de_produit (ID_PRODUIT, COULEUR, ARTICLE_IMAGE, PRIX_ORIGINAL, PRIX_DE_VENTE, QUANTITE_IMPORTE, DEVISE )
                 VALUES (?,?,?,?,?,?,?);`,
                 [
                    data.id_produit,
                    data.couleur,
                    imageName,
                    data.prix_original,
                    data.prix_de_vente,
                    data.qte_importe,
                    data.devise
                 ],
                 (error, result, fields) => {
                    if(error){
                        callback(error);
                        reject(error);
                    }
                    resolve(result);
                 }
            )
        })
    },

    insertConfigArticle : (data, articleId, imageName = null,callback) => {
        const {configQuery, QueryData} = insertConfigArticleQueryBuilder(data, articleId);
        if(configQuery){
            pool.query(
                configQuery,
                QueryData,
                (error, result, fields) => {
                    if(error) {
                        if(imageName){
                            callback(error);
                        }
                        deleteArticleImage(imageName);
                        
                    }
                    return callback(null, result);
                }
            )
        }else{
            return callback(null, {});
        }

    },

    updateArticle : (data, callback) => {
        const {updateArticleQuery, paramsQuery} = generateUpdateArticleQuery(data);
        pool.query(
            updateArticleQuery,
            paramsQuery,
            (error, result, fields) => {
                if(error) {
                    callback(error);
                }
                return callback(null, result);
            }
        )
    },
    // updateArticle : (data, callback) => {
    //     pool.query(
    //         `UPDATE articel_de_produit 
    //             SET ID_PRODUIT=?, COULEUR=?, ARTICLE_IMAGE=?, PRIX_ORIGINAL=?, 
    //             PRIX_DE_VENTE=?, QUANTITE_IMPORTE=?, DEVISE=? 
    //             WHERE  ID_ARTICLE = ? ;`,
    //         [
    //             data.id_produit,
    //             data.couleur,
    //             data.imageURL,
    //             data.prix_depart,
    //             data.prix_vente,
    //             data.qte,
    //             data.devise,
    //             data.id_article
    //         ],
    //         (error, result, fields) => {
    //             if(error) {
    //                 callback(error);
    //             }
    //             return callback(null, result);
    //         }
    //     )
    // },

    deleteArticle : (data, callback) => {
        console.log(data);
        pool.query(
            deleteQueryBuilder('article_de_produit', 'ID_ARTICLE', data),
            data,
            (error, result, fields) => {
                if(error) {
                    if(callback) {
                        return callback(error) ;
                    }else{
                        console.log(error);
                    }
                        
                }
                if(callback){
                    return callback(null, result);
                }else{
                    console.log(result);
                }
            }
        )
    },

    getArticles : async (requestQuery, callback) => {
        const {baseQuery, paginationQuery, queryParams} = getArticleQueryBuilderByOption(requestQuery);
        let results = {
            articleList : await executeQuery(baseQuery, queryParams, callback),
            pageNumber : await executeQuery(paginationQuery, queryParams, callback)
        };
        console.log(results);
        return callback (null, results);
    },

    getArticlesByUser : async (query, callback) => {
        const {getQuery, pagitationQuery, queryData} = getArticleQueryBuilderByOption(query);
        let results = {
            articleList : await executeQuery(getQuery, queryData, callback),
            pageNumber : await executeQuery(pagitationQuery, queryData, callback)
        };
        console.log(results);
        return callback (null, results);
    },

    getAllArticlesForOneProduct : async (query, variations, callback) => {
        const {getQuery, queryParamsData} = allProductArticlesQueryBuilder(query, variations);
        let results = await executeQuery(getQuery, queryParamsData, callback);
        console.log(results);
        return callback (null, results);
    },

    getArticlesCommandNumber : (query, callback) => {
        pool.query(
            `SELECT SUM(commande.QUANTITE_COMMANDE) as total_Commande from commande WHERE commande.ID_ARTICLE = ?;`,
            [query.id_article],
            (error, result, fields) => {
                if(error) {
                    if(callback) {
                        return callback(error) ;
                    }else{
                        console.log(error);
                    }
                        
                }
                if(callback){
                    return callback(null, result);
                }else{
                    console.log(result);
                }
            }
        )
    }
}

const insertConfigArticleQueryBuilder = (data, id_createdArticle) => {
    let configQuery = null;
    let QueryData = [];
    if(Array.isArray(data.config_options) && data.config_options.length > 0){
         configQuery = `INSERT INTO configuration (ID_ARTICLE, ID_OPTION) VALUES `;
        // QueryData = [];
        for (let index = 0; index < data.config_options.length; index++) {
            console.log(data.config_options[index]);
            configQuery += `(?, ?) ${ index < data.config_options.length - 1 ? ',' : ''} `;
            QueryData.push(id_createdArticle);
            QueryData.push(data.config_options[index]);
        }
    }
    return {configQuery, QueryData};
}

const generateUpdateArticleQuery = (data) => {
    let updateArticleQuery = `UPDATE article_de_produit 
    SET ID_PRODUIT=?, COULEUR=?, ARTICLE_IMAGE=?, PRIX_ORIGINAL=?, 
    PRIX_DE_VENTE=?, QUANTITE_IMPORTE=?, DEVISE=? 
    WHERE  ID_ARTICLE = ? ; `;
    let paramsQuery = [
        data.id_produit,
        data.couleur,
        data.imageURL,
        data.prix_depart,
        data.prix_vente,
        data.qte,
        data.devise,
        data.id_article
    ];
    // let updateArticleQuery = ``;
    // let paramsQuery = [];
    if(data.config_options){
        data.config_options.forEach(config => {
            if(config.old_option !== config.new_option ){
                updateArticleQuery += ` UPDATE configuration SET ID_OPTION = ? WHERE (ID_ARTICLE = ? AND ID_OPTION = ?) ; `
                paramsQuery.push(config.new_option);
                paramsQuery.push(data.id_article);
                paramsQuery.push(config.old_option);
            }
        });
    }
    return {updateArticleQuery, paramsQuery};
}

const getArticleQueryBuilderByOption = (requestQuery) => {
    let queryParams = [];
    let baseQuery = `SELECT 
        article_de_produit.*
        FROM configuration 
        JOIN article_de_produit ON article_de_produit.ID_ARTICLE = configuration.ID_ARTICLE
        JOIN option_de_variation ON configuration.ID_OPTION = option_de_variation.ID_OPTION `;
    let groupByQuery = ` GROUP BY article_de_produit.ID_ARTICLE, article_de_produit.QUANTITE_IMPORTE `
    let whereClause = ' WHERE article_de_produit.ID_PRODUIT = ? ';
    queryParams.push(requestQuery.id_produit);
    if(requestQuery.options){
        whereClause += ` AND option_de_variation.ID_OPTION IN (`;
        for (let i = 0; i < requestQuery.options.length; i++) {
            whereClause += `? ${ i < requestQuery.options.length - 1 ? ',' : ''} ${ i = requestQuery.options.length - 1 ? ')' : ''}`;
            queryParams.push(requestQuery.options[i]);
        }
        groupByQuery += ` HAVING COUNT(DISTINCT option_de_variation.ID_OPTION) = ? `;
        queryParams.push(requestQuery.options.length);
    }
    baseQuery += whereClause + groupByQuery + ` ORDER BY ${requestQuery.order_by} LIMIT ${requestQuery.limit} OFFSET ${requestQuery.offset}`;
    let paginationQuery = ` SELECT CEIL(COUNT(*) / ${requestQuery.limit} ) AS total_page 
        FROM configuration 
        JOIN article_de_produit ON article_de_produit.ID_ARTICLE = configuration.ID_ARTICLE
        JOIN option_de_variation ON configuration.ID_OPTION = option_de_variation.ID_OPTION `
        + whereClause + groupByQuery ;

    console.log("################################################################")
    console.log(baseQuery);
    console.log(whereClause);
    console.log(groupByQuery);
    console.log(queryParams);
    return {baseQuery, paginationQuery, queryParams};
}

const getArticleQueryBuilderByUser = (params) => {
    let getQuery = `SELECT * FROM article_de_produit `;
    let paramsQuery = '';
    let queryData = [];

    if(params.additional_parameter !== 0){
        paramsQuery += 'WHERE ';
        let clauseQuery = '';

        if(params.id_produit !== ''){
            clauseQuery += 'ID_PRODUIT = ? ';
            queryData.push(params.id_produit);
        }
        // if(params.id_utilisateur !== ''){
        //     clauseQuery += `${checkClauseQuery(clauseQuery)} ID_UTILISATEUR = ? `;
        //     queryData.push(params.id_utilisateur);
        // }
        if(params.begin_price !== '' && params.end_price !== ''){
            clauseQuery += `${checkClauseQuery(clauseQuery)} PRIX_DE_VENTE BETWEEN ? AND ? `;
            queryData.push(params.begin_price);
            queryData.push(params.end_price);
        }
        if(params.begin_qte !== '' && params.end_qte !== ''){
            clauseQuery += `${checkClauseQuery(clauseQuery)} QUANTITE_IMPORTE BETWEEN ? AND ? `;
            queryData.push(params.begin_qte);
            queryData.push(params.end_qte);
        }
        
        paramsQuery += clauseQuery;
    }
    getQuery += paramsQuery + ` ORDER BY ` + params.order_by + ` LIMIT ` + params.limit + ` OFFSET ` + params.offset;
    let pagitationQuery = 'SELECT CEIL(COUNT(*) / ' + params.limit + ' ) AS total_page FROM article_de_produit ' + paramsQuery;

    console.log(params);
    console.log(getQuery)
    console.log(pagitationQuery);
    console.log(queryData)

    return {getQuery, pagitationQuery, queryData}
}

//tous les articles possibles d'un produit avac leurs options respectifs

const allProductArticlesQueryBuilder = (params, variations) => {
    let getQuery = `SELECT
        article_de_produit.* `;
    // console.log("variation")
    // console.log(variations);
    let maxQuery = "";
    let queryParamsData = []; 
    let crossJoin = '';

    if(Array.isArray(variations) && variations.length > 0){
        //ilaina reh tsamisy variation
        getQuery+= ", ";
        crossJoin = ` CROSS JOIN variation 
                      LEFT JOIN configuration ON article_de_produit.ID_ARTICLE = configuration.ID_ARTICLE 
                      JOIN option_de_variation ON configuration.ID_OPTION = option_de_variation.ID_OPTION AND option_de_variation.ID_VARIATION = variation.ID_VARIATION `

        variations.forEach(variation => {
            if(maxQuery !== ""){
                maxQuery += ","
            }
            maxQuery += "MAX(CASE WHEN variation.ID_VARIATION = ? THEN option_de_variation.VALEUR_OPTION END) AS " + variation.nom_variation;
            queryParamsData.push(variation.id_variation);
        });
    }

    getQuery += maxQuery + ` FROM article_de_produit 
    JOIN produit ON produit.ID_PRODUIT = article_de_produit.ID_PRODUIT 
    ${crossJoin}
    WHERE produit.ID_PRODUIT = ?
    GROUP BY 
    article_de_produit.ID_ARTICLE,
    article_de_produit.QUANTITE_IMPORTE `;
    queryParamsData.push(params.id_produit);
    console.log(getQuery)

    return {getQuery, queryParamsData};
}

