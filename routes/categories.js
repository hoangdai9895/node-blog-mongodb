var express = require('express');
var router = express.Router();
var multer = require('multer');
var upload = multer({ dest: './uploads' });
var mongo = require('mongodb');
var db = require('monk')('localhost/nodeblog');

router.get('/show/:category', (req, res, next) => {
    var posts = db.get('posts');
    posts.find({ category: req.params.category }, {}, (err, posts) => {
        res.render('index', {
            'title': req.params.category,
            'posts': posts
        })
    })
})

/* GET users listing. */
router.get('/add', function(req, res, next) {
    res.render('addCategory', {
        'title': 'Add Categories'
    })
});

router.post('/add', function(req, res, next) {
    // get form value
    var name = req.body.name;
    // from validation

    req.checkBody("name", 'Name field is required').notEmpty();

    // check errors

    var errors = req.validationErrors();

    if (errors) {
        res.render('addCategory', { errors: errors })
    } else {
        var categories = db.get('categories')
        categories.insert({
            'name': name,
        }, (err, categories) => {
            if (err) {
                req.flash('error', 'Somthing wrong!!!! Added');
            } else {
                req.flash('success', 'Category Added');
                res.location('/');
                res.redirect('/')
            }
        })
    }

});

module.exports = router;