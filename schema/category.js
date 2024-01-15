var mongoose = require("mongoose");
const configs = require('../helper/configs')

const schema = new mongoose.Schema({
    name: String,
    isdelete: Boolean,
    

});


module.exports = mongoose.model('category', schema);