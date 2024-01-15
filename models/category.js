var SchemaCategory = require('../schema/category')

module.exports = {
    getall: function (query) {
        var sort = {};
        if (query.sort) {
          if (query.sort[0] == '-') {
            sort[query.sort.substring(1)] = 'desc';
          } else {
            sort[query.sort] = 'asc';
          }
        }
    
        var limit = parseInt(query.limit) || 6;
        var page = parseInt(query.page) || 1;
        var skip = (page - 1) * limit;
        const categoryQuery = {
          isdelete: false,
        };
        return SchemaCategory.find(categoryQuery)
          .sort(sort)
          .limit(limit)
          .skip(skip)
          .exec();
    },
    createCategory: function (category) {
        return new SchemaCategory(category).save();
    },
    getByName: function (name) {
        return SchemaCategory.findOne({ name: name }).exec();
    },
}