var express = require('express');
var router = express.Router();

//localhost:3000/

/* GET home page. */
router.get('/', function(req, res, next) {//get all
  res.render("users/dashboard");
});

module.exports = router;
