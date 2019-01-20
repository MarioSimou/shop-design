const Router = require('express-promise-router');
const router = new Router(),
    path = require('path'),
    root = require('../util/root'),
    middlewares = require('../util/middlewares'),
    Product = require('../models/Product'),
    Cart = require('../models/Cart'),
    User = require('../models/User')

router.get('/cart', middlewares.authentication, async (req, res) => {
    const cart =  await req.session.cart 
    res.render(path.join(root, 'views', 'cart', 'cart.ejs'), { title: 'Cart' , cart : cart  })
});

router.post('/cart/:productId/new', middlewares.authentication, async (req, res) => {
    const { productId } = req.params;

    if (productId) {
        // populates the cart object
        let cart = await req.session.cart
        cart._user = new User( cart._user ) // creates a user object
        cart = new Cart( cart )
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

router.post('/checkout', middlewares.authentication , async ( req , res ) => {
    // gets the cart objec and checks out
    let cart = await req.session.cart
    cart._user = new User( cart._user ) 
    cart = new Cart( cart )
    
    if(cart){
        await cart.checkout();
        req.session.message = { type: 'positive', content: { header: 'Successful transaction', main: `Successful payment. Your order will be delivered immediatly` } }
        res.redirect(302,'/products');
    }else{
        req.session.message = { type: 'negative', content: { header: 'Unsuccessful transaction', main: `Transactional error.` } }
        res.redirect(302, '/cart')
    }
});

module.exports = { router: router };