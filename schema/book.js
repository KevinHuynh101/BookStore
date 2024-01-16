var mongoose = require("mongoose");
const crypto = require('crypto');
const configs = require('../helper/configs')
const mongoosePaginate = require('mongoose-paginate-v2');

const schema = new mongoose.Schema({
    name: String,
    image: String,
    price: Number,
    author: String,
    content:String,
    order: Number,
    category_k:{
        type:mongoose.Schema.ObjectId,
        ref:'category'
    }
});
schema.plugin(mongoosePaginate);

module.exports = mongoose.model('book', schema);