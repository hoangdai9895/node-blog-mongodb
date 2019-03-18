var express = require('express');
var router = express.Router();
var multer = require('multer');
var upload = multer({ dest: './public/images' });
var mongo = require('mongodb');
var db = require('monk')('localhost/nodeblog');

var ObjectId = require('mongodb').ObjectID;
/* GET users listing. */

router.get('/show/:id', function(req, res, next) {
    // var db = req.db;
    var posts = db.get('posts')
    posts.find({ _id: req.params.id }, {}, (err, post) => {
        console.log(post)
        res.render('show', {
            'post': post
        })
    })

});

router.get('/add', function(req, res, next) {
    // var db = req.db;
    var categories = db.get('categories')
    categories.find({}, {}, (err, categories) => {
        res.render('addposts', {
            'title': 'Add post',
            'categories': categories
        })
    })

});

router.post('/add', upload.single('mainimage'), function(req, res, next) {
    // get form value
    var title = req.body.title;
    var category = req.body.category;
    var body = req.body.body;
    var author = req.body.author;
    var date = req.body.date;
    var date = new Date();
    // console.log(title)

    if (req.file) {
        console.log(req.file)
        var mainimage = req.file.filename;
    } else {
        console.log('no file choosen')
    }

    // from validation
    req.checkBody("title", 'Title field is required').notEmpty();
    req.checkBody("body", 'Body field is required').notEmpty();

    // check errors

    var errors = req.validationErrors();

    if (errors) {
        res.render('addposts', { errors: errors })
    } else {
        var posts = db.get('posts')
        posts.insert({
            'title': title,
            'body': body,
            'category': category,
            'date': date,
            'author': author,
            'mainimage': mainimage
        }, (err, post) => {
            if (err) {
                req.flash('error', 'Post Added');
            } else {
                req.flash('success', 'Post Added');
                res.location('/');
                res.redirect('/')
            }
        })
    }

});



router.post('/addcomment', function(req, res, next) {
    // get form value
    var name = req.body.name;
    var email = req.body.email;
    var body = req.body.body;
    var postid = req.body.postid;
    console.log(name)
    var commentdate = new Date();
    // console.log(title)

    // from validation
    req.checkBody("name", 'name field is required').notEmpty();
    req.checkBody("email", 'email field is required but never displayed').notEmpty();
    req.checkBody("email", 'email is not format probly').isEmail();
    req.checkBody("body", 'body field is required').notEmpty();

    // check errors

    var errors = req.validationErrors();

    if (errors) {
        var posts = db.get('posts')
        posts.find({ _id: postid }, {}, (err, post) => {
            res.render('show', { errors: errors, post: post })
        })
    } else {
        var comment = {
            'name': name,
            'email': email,
            'body': body,
            'commentdate': commentdate
        }
        var posts = db.get('posts')
            // console.log(posts)
        posts.update({
            '_id': postid
        }, {
            $push: {
                'comments': comment
            }
        }, (err, doc) => {
            if (err) throw err
            else {
                req.flash('success', 'Comment Added');
                res.location('/post/show/' + postid);
                res.redirect('/')
            }
        })
    }

});

module.exports = router;