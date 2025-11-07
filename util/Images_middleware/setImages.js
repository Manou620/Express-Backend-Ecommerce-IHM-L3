const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination : ( req, file, callback) => {
        callback(null, 'public/images/product_image')
    },
    filename: (req, file, callback) => {
        callback(null, file.fieldname + "_" + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage
})

module.exports = upload

// const setProductImage = (req, file, callback) => {
//     try {
        
//     } catch (error) {
        
//     }
//     const storage = multer.diskStorage({
//         destination : ( req, file, callback) => {
//             callback(null, 'public/images/product_image')
//         },
//         filename: (req, file, callback) => {
//             callback(null, file.fieldname + "_" + Date.now() + path.extname(file.originalname));
//         }
//     });

//     const upload = multer({
//         storage: storage
//     })

//     return upload;
// }


