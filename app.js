var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var multer = require('multer');
var upload = multer({ dest: './pulic/images' });
// var moment = require('moment');
var ExpressValidator = require('express-validator');
var mongo = require('mongodb');
var indexRouter = require('./routes/index');
var postsRouter = require('./routes/posts');
var categoryRouter = require('./routes/categories');

var app = express();

app.locals.moment = require('moment');
app.locals.truncateText = (text, length) => {
    var truncateText = text.substring(0, length)
    return truncateText
}

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// handle session
app.use(session({
    secret: 'secret',
    saveUninitialized: 'true',
    resave: true
}));

//connect flash
app.use(require('connect-flash')());
app.use((req, res, next) => {
    res.locals.messages = require('express-messages')(req, res);
    next();
})

// make our db acessible to our router
app.use(function(req, res, next) {
        req.db = db;
        next()
    })
    // validator
app.use(ExpressValidator({
    errorFormatter: function(param, msg, value) {
        var namespace = param.split('.')
        root = namespace.shift()
        formParam = root;

        while (namespace.length) {
            formParam += '[' + namespace.shift()
        }
        return {
            param: formParam,
            mas: msg,
            value: value
        }
    }
}))




var db = require('monk')('localhost/nodeblog');

app.use('/', indexRouter);
app.use('/posts', postsRouter);
app.use('/categories', categoryRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;