const express = require('express');
const app = express(),
    port = process.env.PORT || 5000,
    mainRoutes = require('./controllers/main'),
    productsRoutes = require('./controllers/products'),
    cartRoutes = require('./controllers/cart'),
    authenticationRoutes = require('./controllers/authentication'),
    path = require('path'),
    root = require('./util/root'),
    mongo = require('./util/mongodb'),
    session = require('express-session'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override');

// Embedded Javascript
app.set('view-engine', 'ejs')

// 
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized : true,
    cookie : { secure : false, maxAge : 60 * 60 * 1000, httpOnly : false },
    unset : 'destroy'
}));

// Body Parser that allows to submit form data
app.use(bodyParser.urlencoded({ extended: false }))

// Listen to public and view directories as well
app.use(express.static(path.join(root, 'public')))
app.use(express.static(path.join(root, 'views')))

// Allows the use of DELETE AND PUT request
// overrides a POST request with ?_method=DELETE
app.use(methodOverride('_method'))

// Middleware function
app.use( async(req, res, next) => {
    // the user object will be available in any EJS file
    res.locals.user = req.session.user
    // makes available flash messages in the current request-response cycle
    res.locals.message = req.session.message
    delete req.session.message
    
    next();
});
// Routes
app.use(authenticationRoutes.router);
app.use(productsRoutes.router)
app.use(cartRoutes.router)
app.use(mainRoutes.router)

mongo.connect('mongodb://admin:admin@localhost:27000/mystore', () => {
    app.listen(port, () => {
        console.log(`The app listens on port ${port}`)
    })
})
