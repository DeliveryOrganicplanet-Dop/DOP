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
   

// router.post("???", function (req, res) {


// });



module.exports = router;