const pool = require('../config/database')

const executeQuery = (query, params, callback) => {
    return new Promise ((resolve, reject) => {
        pool.query(
            query,
            params,
            (err, result, fields) => {
                if(err){
                    callback(err);
                    reject(err);
                } else {
                    resolve (result);
                }
            }
        )
    })
}

const checkClauseQuery = (query) => {
    if(query !== ''){
        return 'AND '
    }

    return '';
}

const deleteQueryBuilder = (tableName, columName, ids) => {
    let baseQuery = `DELETE FROM ` + tableName +` WHERE `+ columName +` IN (`;
    
    for (let i = 0; i < ids.length -1 ; i++){
        baseQuery += '?,'
    }

    baseQuery += '?)'
    console.log(baseQuery);
    return baseQuery;
}

const FormatVariationOptionList = (queryResult) => {
    const formattedVariationsData = {};
    queryResult.forEach(row => {
        // If the attribute doesn't exist in the formatted data, create it
        //vo tsa mandahatra azy
        const {ID_VARIATION, NOM_VARIATION, ID_OPTION, VALEUR_OPTION} = row;
        if (!formattedVariationsData[ID_VARIATION]){
            formattedVariationsData[ID_VARIATION] = {
                id_variation : ID_VARIATION,
                nom_variation : NOM_VARIATION,
                options : []
            };
        }
        formattedVariationsData[ID_VARIATION].options.push({
            id_option : ID_OPTION,
            valeur_option : VALEUR_OPTION
        })
    });
    // Sort options for each attribute
    //alahatra amzay afaka parcourena any am front
    Object.values(formattedVariationsData).forEach( variation => {
        variation.options.sort((a, b) => a.valeur_option.localeCompare(b.valeur_option));
    });

    return Object.values(formattedVariationsData);
}

module.exports = {
    executeQuery,
    checkClauseQuery,
    deleteQueryBuilder,
    FormatVariationOptionList
}