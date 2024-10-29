var express = require("express");
var router = express.Router();


router.get("/", function (req, res) {
 res.render("pages/index")
});

router.get("/calendario", function (req, res) {
    res.render("pages/calendario")
   });

   router.get("/cadastro", function (req, res) {
    res.render("pages/cadastro")
   });

   router.get("/cadlog", function (req, res) {
    res.render("pages/cadlog")
   });
   
   router.get("/Brocolis", function (req, res) {
    res.render("pages/Brocolis")
   });

   router.get("/ameixa", function (req, res) {
    res.render("pages/ameixa")
   });

   router.get("/abacaxi", function (req, res) {
    res.render("pages/abacaxi")
   });

   router.get("/alface", function (req, res) {
    res.render("pages/alface")
   });

   router.get("/alfacef", function (req, res) {
    res.render("pages/alfacef")
   });

   router.get("/abacaxif", function (req, res) {
    res.render("pages/abacaxif")
   });

   router.get("/ameixaf", function (req, res) {
    res.render("pages/ameixaf")
   });

   router.get("/brocolisf", function (req, res) {
    res.render("pages/brocolisf")
   });

   router.get("/carrinho", function (req, res) {
    res.render("pages/carrinho")
   });

   router.get("/cadastro2", function (req, res) {
    res.render("pages/cadastro2")
   });

   router.get("/finalizar", function (req, res) {
    res.render("pages/finalizar")
   });

// router.post("???", function (req, res) {


// });



module.exports = router;