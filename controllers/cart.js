const Router = require('express-promise-router');
const router = new Router(),
    path = require('path'),
    root = require('../util/root'),
    middlewares = require('../util/middlewares'),
    Product = require('../models/Product'),
    Cart = require('../models/Cart'),
    User = require('../models/User')

router.get('/cart', middlewares.authentication, async (req, res) => {
    res.render(path.join(root, 'views', 'cart', 'cart.ejs'), { title: 'Cart' })
});

router.post('/cart/:productId/new', middlewares.authentication, async (req, res) => {
    const { productId } = req.params;
    const cartSession = req.session.cart
    if (productId) {
        // populates the cart
        const cart = new Cart({
            _id: cartSession._id,
            _products: cartSession._products,
            user: new User({
                _id: cartSession._user._id,
                username: cartSession._user._username,
                email: cartSession._user._email,
                password: cartSession._user._password,
                agreeConditions: cartSession._user._agreeConditions
            })
        })
        cart.products = await Product.findOne({ _id: productId })
        //  updates the session
        req.session.cart = cart;

        // commits the changes to the database
        await cart.save();

        req.session.message = { type: 'positive', content: { header: 'Successful add', main: `Product has been correctly added.` } }
        res.redirect(302, '/products')
    } else {
        req.session.message = { type: 'negative', content: { header: 'Unsuccessful add', main: `Product could not add in the cart.` } }
        res.redirect(302, '/products')
    }
});


module.exports = { router: router };