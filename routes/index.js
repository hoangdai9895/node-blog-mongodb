var express = require('express');
var router = express.Router();

var mongo = require('mongodb');
var db = require('monk')('localhost/nodeblog');
/* GET home page. */
router.get('/', function(req, res, next) {
    var db = req.db;
    var posts = db.get('posts');
    posts.find({}, {}, (err, posts) => {
        if (err) throw err
        res.render('index', { title: 'Express', posts: posts });
    })

});

module.exports = router;