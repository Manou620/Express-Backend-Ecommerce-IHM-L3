require("dotenv").config();

const express = require('express');
const app = express();
//routers
const userRouter = require('./api/users/user.router');
const produitRouter = require('./api/produits/produit.router');
const VariationRouter = require('./api/variations/variation.router');
const ArticleRouter = require('./api/Articles/article.router');
const categoriesRouter = require('./api/categories/categories.router');
const adresseRouter = require('./api/adresses/adresses.router');
const paymentRouter = require('./api/payments/payment.router');
const commandRouter = require('./api/commands/commandes.router');

//other middleWare
const cors = require('cors');

//using MiddleWare
app.use(cors());
app.use(express.json()); //convert json object to javascript object
app.use(express.urlencoded({extended:true}));
app.use(express.static('public'));

//using routes
app.use("/api/users", userRouter);
app.use("/api/produits", produitRouter);
app.use("/api/variations", VariationRouter);
app.use("/api/articles", ArticleRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/adresses", adresseRouter);
app.use("/api/payments", paymentRouter);
app.use("/api/commandes", commandRouter);


app.listen(process.env.APP_PORT, () => {
    console.log("server running at port " + process.env.APP_PORT);
})
