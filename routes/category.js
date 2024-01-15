var express = require('express');
var router = express.Router();
var categoryDepartment = require('../schema/category');
var modelCategory = require('../models/category')
var responseData = require('../helper/responseData');


router.get('/', async function (req, res, next) {
  console.log(req.query);
  var categoryAll = await modelCategory.getall(req.query);
  responseData.responseReturn(res, 200, true, categoryAll);
});


router.post('/add',async function (req, res, next) {
  var category = await modelCategory.getByName(req.body.name);
  if (category) {
    responseData.responseReturn(res, 404, false, "category da ton tai");
  } else {
   
    const newCategory = await modelCategory.createCategory({
      name: req.body.name,
      isdelete: req.body.isdelete,

    })
    responseData.responseReturn(res, 200, true, newCategory);
  }
});

module.exports = router;