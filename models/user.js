var SchemaUser = require('../schema/user')

module.exports = {
    getall: function (query) {
        var sort = {};
        var Search = {};
        if (query.sort) {
            if (query.sort[0] == '-') {
                sort[query.sort.substring(1)] = 'desc';
            } else {
                sort[query.sort] = 'asc';
            }
        }
        if (query.key) {
            Search.userName = new RegExp(query.key, 'i');
        }
        var limit = parseInt(query.limit) || 10;
        var page = parseInt(query.page) || 1;
        var skip = (page - 1) * limit;
        return SchemaUser.find(Search).select('userName password carts role').sort(sort).limit(limit).skip(skip).exec();
    },
    getCartByUserId: function (Id, query) {
        var sort = {};
        var Search = {};

        if (query.sort) {
            if (query.sort[0] === '-') {
                sort[query.sort.substring(1)] = 'desc';
            } else {
                sort[query.sort] = 'asc';
            }
        }

        if (query.key) {
            Search.userName = new RegExp(query.key, 'i');
        }

        var limit = parseInt(query.limit) || 2;
        var page = parseInt(query.page) || 1;
        var skip = (page - 1) * limit;

        return SchemaUser.findById(Id)
            .select('userName password carts role') // Select fields you want
            // .populate('carts.book','name image price author')
            // // select('userName password carts role') // Select fields you want
            // // .populate('carts', 'name')
            // .sort(sort)
            // .limit(limit)
            // .skip(skip)
            // .exec();
            .populate({
                path: 'carts.book',
                select: 'name image price author' // Chọn các trường từ sách
            })
            .sort(sort)
            .limit(limit)
            .skip(skip)
            .lean() // Thêm lean để trả về đối tượng JavaScript thay vì đối tượng Mongoose
            .exec()
            .then(user => {
                // Lặp qua giỏ hàng và thêm giá trị quantity từ subdocument vào sách
                user.carts.forEach(cartItem => {
                    cartItem.book.quantity = cartItem.quantity;
                });
                return user;
            });
    },
    getOne: function (id) {
        return SchemaUser.findById(id);
    },
    getByName: function (name) {
        return SchemaUser.findOne({ userName: name }).exec();
    },
    createUser: function (user) {
        return new SchemaUser(user).save();
    },
    login: function (userName, password) {
        return SchemaUser.checkLogin(userName, password);
    },
    getByEmail: function (email) {
        return SchemaUser.findOne({ email: email }).exec();
    },
    getByTokenForgot: function (token) {
        return SchemaUser.findOne(
            {
                tokenForgot: token,
                tokenForgotExp: { $gte: Date.now() }
            }
        ).exec();
    },
}