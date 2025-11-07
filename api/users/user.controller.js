const {
    createUser,
    getUserByMailOrContact,
    createNewUserPromised,
    getUsers,
    updateUserByUser,
    updateUserByAdmin
} = require("./user.service");

const {genSaltSync, hashSync, compareSync} = require("bcrypt");
const { access } = require("fs");
const {sign} = require("jsonwebtoken");

module.exports = {
    creatingUser : (req, res) => {
        const body = req.body.data;
        // console.log(req.body)
        // const salt = genSaltSync(10);
        if(body !== undefined && body !== null){
            body.mot_de_passe = hashSync(body.mot_de_passe, genSaltSync(10));
        }else{
            return res.status(200).json({
                success: 0,
                message : "Valeur vide soumis"
            })
        }
        //validator
        //if body null handler
        createUser(body,  (err, result, fields) => {
            if(err){
                console.log("erreur");
                console.log(err);
                if(err.code === "ER_DUP_ENTRY"){
                    return res.status(200).json({
                        success: 0,
                        message: "L' email et/ou le numero de telephone est déja utilisé"
                    });
                }
                return res.status(500).json({
                    success: 0,
                    message: "Database connection error"
                });
            }

            return res.status(200).json({
                success: 1,
                message : "Inscription reussi",
            });

            
        })
    },


    login : (req, res) => {
        console.log(req.body.credential);
        getUserByMailOrContact(req.body.credential, (err, result) => {
            if(err){
                console.log(err);
                return;
            }
            if(!result){
                return res.status(400).json({
                    success: 0,
                    message: "Mail ou Numero de telephone introuvable"
                });
            }

            const matching = compareSync(req.body.mot_de_passe, result.MOT_DE_PASSE);
        
            if(matching){
                const jsonAccessToken = sign({
                    id_utilisateur : result.ID_UTILISATEUR, 
                    nom_utilisateur : result.NOM_UTILISATEUR,
                    role : result.ROLE,
                    contact : result.CONTACT,
                    mail : result.MAIL,
                    peut_vendre : result.PEUT_VENDRE,
                    suspendu : result.SUSPENDU
                }, process.env.JSON_TOKEN_KEY, { expiresIn: "24h"});
                return res.json({
                    success : 1,
                    user : result,
                    accessToken : jsonAccessToken
                })
            }else{
                return res.json({
                    success : 0,
                    message : " Mot de passe invalide"
                })
            }
        })
    },

    refreshToken: (req, res) => {
        const token = req.body.token;
        if(!token){
            
        }
    },

    deletingUser : (req, res) => {
        if(req.user.id_utilisateur === req.params.id_utilisateur || req.user.role === "administrateur"){
            res.status(200).json("utilisateur supprime");
        }else{
            res.status(403).json("Vous n'etes pas authorizé à supprimer cet utilisateur");
        }
    },

    UserRegistering : async (req, res) => {
        try {

            const body = req.body.data;

            if(body !== undefined && body !== null){
                body.mot_de_passe = hashSync(body.mot_de_passe, genSaltSync(10));
            }else{
                return res.status(200).json({
                    success: 0,
                    message : "Valeur vide soumis"
                })
            }

            const newUser = await createNewUserPromised(body, (err) => {
                if(err){
                    console.log(err)
                    return res.json({
                        success : 0,
                        message : "Inscription échoué",
                    })
                }
            });

            console.log(newUser.insertId);

            const accessToken  =  sign({
                id_utilisateur : newUser.insertId, 
                nom_utilisateur : body.nom_utilisateur,
                role : "utilisateur",
                contact : body.contact,
                mail : body.mail,
                peut_vendre : "1",
                suspendu : "0"
            }, process.env.JSON_TOKEN_KEY, { expiresIn: "24h"});

            return res.status(200).json({
                success : 1,
                message : "Inscription réussi",
                accessToken : accessToken
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                success : 0,
                message : "Erreur de serveur interne"
            });
        }
    },

    gettingUsers : (req, res) => {
        if(!req.query){
            return res.json({
                success : 0,
                message : "Paramatre de requette vide envoyé"
            })
        }
        getUsers(req.query, (err, result) => {
            if(err){
                console.log(err);
                return
            }
            if(!result.userList || (Array.isArray(result.userList) && result.userList.length === 0)){
                return res.json({
                    success: 0,
                    message: "Pas d'utilisateur trouvé"
                })
            }
            //console.log(result.userList)
            return res.json({
                success: 1,
                data: result
            })
        });
    },

    updatingUserByUser : (req, res) => {
        //check token userUpdater sy toUpdate
        updateUserByUser(req.body.userToUpdate, (err, result) => {
            if(err){
                console.log(err);
                return
            }
            if(!result){
                console.log(result)
                return res.json({
                    success : 0,
                    message : "Mis a jour échouée"
                })
            }
            return res.json({
                success : 1,
                message : "Mis a jour reussi"
            });
        })
    },

    updatingUserByAdmin : (req, res) => {
        //check auth
        updateUserByAdmin(req.body.userToUpdate, (err, result) => {
            if(err){
                console.log(err);
                return
            }
            if(!result){
                console.log(result)
                return res.json({
                    success : 0,
                    message : "Mis a jour échouée"
                })
            }
            return res.json({
                success : 1,
                message : "Mis a jour reussi"
            });
        })
    }
    
}


const inscriptionToken =  (data) => {   
    getUserByMailOrContact(data.email , (err, result) => {
        if(err){
            console.log(err);
            // return res.json({
            //     success : 3,
            //     message : "n'a pas pu s'authentifier directement"
            // })
            return null;
        }
        if(!result){
            // return res.json({
            //     success: 3,
            //     message : "n'a pas pu s'authentifier directement"
            // })
            return null;
        }
        console.log(result);

       return sing({
            id_utilisateur : result.ID_UTILISATEUR, 
            nom_utilisateur : result.NOM_UTILISATEUR,
            role : result.ROLE,
            contact : result.CONTACT,
            mail : result.MAIL,
            peut_vendre : result.PEUT_VENDRE,
            suspendu : result.SUSPENDU
        }, process.env.JSON_TOKEN_KEY,  { expiresIn: "60m"});
    })
}