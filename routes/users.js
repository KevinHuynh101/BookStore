var express = require('express');
var router = express.Router();
var responseData = require('../helper/responseData');
var modelUser = require('../models/user')
var validate = require('../validates/user')
var userDepartment = require('../schema/user');
var modelBook = require('../models/book')
const { checkLogin } = require('../middlewares/protect');
const {validationResult} = require('express-validator');
var BookDepartment = require('../schema/book');



router.get('/cart',async function (req, res, next) {
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
      var DSRole = ['user'];
      if(DSRole.includes(role)){
        var userWithCart  = await modelUser.getCartByUserId(req.userID,req.query);
        res.render('users/cart',{ user: userWithCart  });
     

  } else {
    responseData.responseReturn(res, 403, true,"ban khong du quyen");
  }    
} catch (error) {
  responseData.responseReturn(res, 401, false, "khong tim thay");
}  
});


router.put('/cart/:id', async (req, res) => {
  try {
      var result = await checkLogin(req);
      if (result.err) {
          responseData.responseReturn(res, 400, true, result.err);
          return;
      }
      req.userID = result;
      var user = await modelUser.getOne(req.userID);
      var book = await BookDepartment.findById(req.params.id);
      // Kiểm tra xem sách đã tồn tại trong giỏ hàng chưa
      var existingCartItem = user.carts.find(cartItem => cartItem.book.equals(book._id));
      if (existingCartItem) {
          // Nếu sách đã tồn tại trong giỏ hàng, tăng số lượng
          existingCartItem.quantity++;
      } else {
          // Nếu sách chưa có trong giỏ hàng, thêm vào giỏ hàng với số lượng là 1
          user.carts.push({ book });
      }
      // Lưu cập nhật vào cơ sở dữ liệu
      await user.save();
      // Chuyển hướng sau khi cập nhật giỏ hàng
      res.redirect('/books/');
  } catch (e) {
    responseData.responseReturn(res, 401, false, "khong tim thay");
  }
});

// router.delete('/cart/:id/delete', async (req, res) => {
//   try {
//     var result = await checkLogin(req);
//     if (result.err) {
//         responseData.responseReturn(res, 400, true, result.err);
//         return;
//     }
//     req.userID = result;
//     var user = await modelUser.getOne(req.userID);

//     // const user = await userDepartment.findById(req.user.id);
//     const index = user.carts.findIndex((book) => book.equals(req.params.id));
//     user.carts.splice(index, 1);
//     userDepartment.findByIdAndUpdate(user.id, user, (err, savedUser) => {
//       if (err) {
//         console.log(err);
//         res.redirect('back');
//       } else {
//         res.redirect('/users/cart');
//       }
//     });
//   } catch (e) {
//     responseData.responseReturn(res, 401, false, "khong tim thay");
//   }
// });

router.delete('/cart/:id/delete', async (req, res) => {
  try {
      var result = await checkLogin(req);

      if (result.err) {
          responseData.responseReturn(res, 400, true, result.err);
          return;
      }

      req.userID = result;
      var user = await modelUser.getOne(req.userID);

      // Tìm vị trí của sách cần xóa trong giỏ hàng
      const index = user.carts.findIndex(cartItem => cartItem.book.equals(req.params.id));

      if (index !== -1) {
          // Nếu sách tồn tại trong giỏ hàng, xóa nó
          user.carts.splice(index, 1);

          // Lưu cập nhật vào cơ sở dữ liệu
          await user.save();
          res.redirect('/users/cart');
      } else {
          responseData.responseReturn(res, 404, false, "Sách không tồn tại trong giỏ hàng");
      }
  } catch (e) {
      responseData.responseReturn(res, 401, true, "Lỗi nội server");
  }
});

module.exports = router;
