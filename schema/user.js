var mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const configs = require('../helper/configs')

const schema = new mongoose.Schema({
    email: String,
    userName: String,
    password: String,
    role: String,
    tokenForgot:String,
    tokenForgotExp:String,
    carts:[{
        book:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "book",
        },
        quantity:{
            type: Number,
            required: true,
            default: 1
        }
    }]

});

schema.pre('save', function (next) {
    if(!this.isModified("password")){
        return next();
    }
    const salt = bcrypt.genSaltSync(10);
    this.password = bcrypt.hashSync(this.password, salt);
    next();
})

schema.methods.getJWT = function () {
    var token = jwt.sign({ id: this._id }, configs.SECRET_KEY,
        { expiresIn: configs.EXP });
    return token;
}

schema.methods.addTokenForgotPassword= function(){
    var tokenForgot = crypto.randomBytes(31).toString('hex');
    this.tokenForgot = tokenForgot;
    this.tokenForgotExp = Date.now()+15*60*1000;
    return tokenForgot;
}

schema.statics.checkLogin = async function (userName, password) {
    if (!userName || !password) {
        return { err: 'Hay nhap day du username va password' };
    }
    var user = await this.findOne({userName:userName});
    if (!user) {
        return { err: 'userName khong ton tai' };
    }
    var result = bcrypt.compareSync(password, user.password);
    if (!result) {
        return { err: 'password sai' };
    }
    console.log(user);
    return user;
}
//JWT
schema.statics.findUser = async ( token ) => {
    const users = await this.find({});
    for(let i = 0; i < users.length; i++){
        for(let j = 0; j < users[i].tokens.length; j++){
            if( token === users[i].tokens[j].token )
                return users[i];
        }
    }
}

module.exports = mongoose.model('user', schema);;

