var express = require('express');
var router = express.Router();
var BookDepartment = require('../schema/book');
var UserDepartment = require('../schema/user');
var modelBook = require('../models/book')
var responseData = require('../helper/responseData');
var modelUser = require('../models/user')
var modelCategory = require('../models/category')
const { checkLogin } = require('../middlewares/protect');


router.get('/', async function (req, res, next) {
  var result = await checkLogin(req);
  if(result.err){
    responseData.responseReturn(res, 400, true, result.err);
    return;
    // return res.redirect("/login");
  }
  console.log(result);
  req.userID = result;
  var user = await modelUser.getOne(req.userID);
  var BookAll = await modelBook.getall(req.query);
    res.render('books/home',{ books: BookAll, user: user });
  // responseData.responseReturn(res, 200, true, BookAll);
});

router.get('/view/:id', async function (req, res, next) {
  var result = await checkLogin(req);
  if(result.err){
    responseData.responseReturn(res, 400, true, result.err);
    return;
  }
  console.log(result);
  req.userID = result;
  var user = await modelUser.getOne(req.userID);
  var Bookdetail = await modelBook.getOne(req.params.id).populate('category_k', 'name') ;
  res.render('books/view',{ book: Bookdetail, user: user });

});

router.get('/add', async(req,res) =>{
  try{
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
    var categorysAll = await modelCategory.getall(req.query);

      res.render('books/new',{ categories: categorysAll, user: user });
    }else{
          responseData.responseReturn(res, 403, true,"ban khong du quyen");
    }
    
  }
  catch(e){
      res.status(500).send(e);
  }
});



router.post('/add',async function (req, res, next) {
  var result = await checkLogin(req);
  if(result.err){
    responseData.responseReturn(res, 400, true, result.err);
    return;
  }
  console.log(result);
  req.userID = result;
  var user = await modelUser.getOne(req.userID);
    var book = await modelBook.getByName(req.body.name);
    if (book) {
      responseData.responseReturn(res, 404, false, "book da ton tai");
    } else {
     
      const newBook = await modelBook.createBook({
        name: req.body.name,
        image: req.body.image,
        price: req.body.price,
        content: req.body.content,
        author: req.body.author,
        // order: req.body.order,
        category_k:req.body.category_k
      })
      // responseData.responseReturn(res, 200, true, newBook);
      res.redirect('/books/');
    }
  });


  router.get('/edit/:id', async(req,res) =>{
    try{
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
      var categorysAll = await modelCategory.getall(req.query);
      var Bookdetail = await modelBook.getOne(req.params.id).populate('category_k', 'name') ;
      res.render('books/edit',{ categories: categorysAll, user: user, book:Bookdetail });
      }else{
            responseData.responseReturn(res, 403, true,"ban khong du quyen");
      }
    }
    catch(e){
        res.status(500).send(e);
    }
  });


router.put('/edit/:id', async function (req, res, next) {
  var result = await checkLogin(req);
  if(result.err){
    responseData.responseReturn(res, 400, true, result.err);
    return;
  }
  console.log(result);
  req.userID = result;
  var user = await modelUser.getOne(req.userID);
  const book = {
    name: req.body.name,
    image: req.body.image,
    author: req.body.author,
    content: req.body.content,
    price:  parseFloat(req.body.price),
    category_k:req.body.category_k
};
try{
    const updatedBook = await BookDepartment.findByIdAndUpdate(req.params.id, book);
    await updatedBook.save();
    res.redirect(`/books/view/${updatedBook._id}`);
    // res.redirect('/books/');
}catch(e){
    console.log(e);
    res.render('books/new', {book: book});
}
});

router.delete('/delete/:id',async function (req, res, next) {//delete by Id
  try {
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
        var Book = await BookDepartment.findByIdAndDelete(req.params.id);
        // responseData.responseReturn(res, 200, true, "xoa thanh cong");
        res.redirect('/books/');
      }else{
            responseData.responseReturn(res, 403, true,"ban khong du quyen");
      }

  } catch (error) {
    responseData.responseReturn(res, 404, false, "khong tim thay user");
  }
});


module.exports = router;