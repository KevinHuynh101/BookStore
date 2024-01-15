var SchemaBook = require('../schema/book')
module.exports ={
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
            Search.name = new RegExp(query.key, 'i'); 
        }

        var limit = parseInt(query.limit) || 10; 
        var page = parseInt(query.page) || 1;
        var skip = (page - 1) * limit;

        return SchemaBook.find(Search)
            .select('name image price content author order category_k')
            .populate('category_k', 'name') 
            .sort(sort)
            .limit(limit)
            .skip(skip)
            .exec();
    },
    createBook: function (book) {
        return new SchemaBook(book).save();
    },
    getByName: function (name) {
        return SchemaBook.findOne({ name: name }).exec();
    },
    getOne: function (id) {
        return SchemaBook.findById(id);
    },
}