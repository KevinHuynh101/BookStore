var express = require('express');
const { model } = require('mongoose');
const { use } = require('.');
var router = express.Router();
var responseData = require('../helper/responseData');
var modelUser = require('../models/user')
var validate = require('../validates/user')
var userDepartment = require('../schema/user');
var modelBook = require('../models/book')
const { checkLogin } = require('../middlewares/protect');
const {validationResult} = require('express-validator');
var BookDepartment = require('../schema/book');


router.get('/', async function (req, res, next) {
  
  console.log(req.query);
  var usersAll = await modelUser.getall(req.query);
  responseData.responseReturn(res, 200, true, usersAll);
});

router.get('/:id', async function (req, res, next) {// get by ID
  try {
    var user = await modelUser.getOne(req.params.id);
    responseData.responseReturn(res, 200, true, user);
  } catch (error) {
    responseData.responseReturn(res, 404, false, "khong tim thay user");
  }
});

router.post('/add',validate.validator(),
  async function (req, res, next) {
    var errors = validationResult(req);
    if(!errors.isEmpty()){
      responseData.responseReturn(res, 400, false, errors.array().map(error=>error.msg));
      return;
    }
  var user = await modelUser.getByName(req.body.userName);
  if (user) {
    responseData.responseReturn(res, 404, false, "user da ton tai");
  } else {
   
    const newUser = await modelUser.createUser({
      userName: req.body.userName,
      email: req.body.email,
      password: req.body.password,
    })
    
    responseData.responseReturn(res, 200, true, newUser);
  }
});
router.put('/edit/:id', async function (req, res, next) {
  try {
    var user = await modelUser.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after' });
    responseData.responseReturn(res, 200, true, user);
  } catch (error) {
    responseData.responseReturn(res, 404, false, "khong tim thay user");
  }
});

router.delete('/delete/:id', function (req, res, next) {//delete by Id
  try {
    var user = modelUser.findByIdAndDelete(req.params.id);
    responseData.responseReturn(res, 200, true, "xoa thanh cong");
  } catch (error) {
    responseData.responseReturn(res, 404, false, "khong tim thay user");
  }
});

router.get('/dashboard',async (req, res) => {
  var result = await checkLogin(req);
      if(result.err){
        responseData.responseReturn(res, 400, true, result.err);
        return;
      }
      console.log(result);
      req.userID = result;
      var user = await modelUser.getOne(req.userID);
      var role = user.role;
      // console.log(role);
      var DSRole = ['admin','publisher'];
      if(DSRole.includes(role)){
      modelUser.findById(req.user.id)
      .populate('carts.book')
      .exec((err, user) => {
        if (err) {
          res.redirect('/books/');
        } else {
          //  res.json(user);
          res.render('users/dashboard', { user: user });
        }
      });
  } else {
    responseData.responseReturn(res, 403, true,"ban khong du quyen");
  }
});

router.put('/cart/:id',  async (req, res) => {
  try {
    var result = await checkLogin(req);
    if(result.err){
      responseData.responseReturn(res, 400, true, result.err);
      return;
    }
    console.log(result);
    req.userID = result;
    var user = await modelUser.getOne(req.userID);
    var book = await BookDepartment.findById(req.params.id);
    // const user = req.user;
    user.carts.push({ book });
    userDepartment.findByIdAndUpdate(req.userID, user, (err, savedUser) => {
      if (err) {
        console.log(err);
        res.redirect('back');
      } else {
        // res.redirect('/users/dashboard');
        res.redirect('/books/');
      }
    });
  } catch (e) {
    console.log(e);
    res.redirect('back');
  }
});

module.exports = router;
