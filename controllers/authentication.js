const Router = require('express-promise-router');
const router = new Router(),
    path = require('path'),
    root = require('../util/root'),
    User = require('../models/User'),
    Cart = require('../models/Cart'),
    bcryptjs = require('bcryptjs'),
    { validationResult } = require('express-validator/check'),
    middlewares = require('../util/middlewares');

router.get('/register', async (req, res) => {
    res.render(path.join(root, 'views', 'authentication', 'register.ejs'), {
        title: 'Register',
        oldInput: {
            username: '',
            email: '',
            password: '',
            confirmPassword: '',
            agreeConditions: 'on'
        },
        validationArray : []
    })
});

router.post('/register', middlewares.validation.validateRegistrationData, async (req, res) => {
    const errors = validationResult(req)
    if (errors.isEmpty()) {
        const { username: _username, email: _email, password: _password, agreeConditions: _agreeConditions } = req.body;
        // hashes user password
        const hashedPassword = await bcryptjs.hash(_password, 12);
        // Creates a user object and cart object
        const user = new User({ _username, _email, _password: hashedPassword, _agreeConditions });
        const cart = new Cart({ _user: user });

        // Updates user with the cart   
        user._cartId = cart._id

        // commits the user object to the database (cart object is not commited because it will be keep updated)
        await Promise.all([
            user.save(),
            cart.save()
        ])

        // updates the session storage
        req.session.user = user
        req.session.cart = cart
        // sets a flash Message
        req.session.message = {
            type: 'positive', content: { header: 'Your user registration was successful.', main: `Welcome to our site ${user.username}` }
        }
        // redirection
        res.redirect(302, '/');
    } else {
        // we directlu set the res.locals.message object because there is no other middleware that will be executed
        res.locals.message = {
            type: 'negative', content: { header: 'Unsuccessful registration', main: errors.array()[0].msg }
        }
        res.render(path.join(root, 'views', 'authentication', 'register.ejs'), {
            title: 'Register',
            oldInput: req.body,
            validationArray: errors.array()
        })
    }
});

router.get('/login', async (req, res) => {
    res.render(path.join(root, 'views', 'authentication', 'login.ejs'), { title: 'Login' , errors: [] , prevReq : { email : '' ,  password : '' } })
});

router.post('/login', middlewares.validation.validateLoginData , async (req, res) => {
    const user = await req.session.user;
    const errors = validationResult( req );
    if (errors.isEmpty()) {
            // checks whether the identified user has a similar password
            const cart = await Cart.findOne({ _id: user._cartId })

            if (!cart) throw new Error('Unable to track user cart')

            // updates session object
            // req.session.user = user
            req.session.cart = cart
            // sets a flash Message
            req.session.message = {
                type: 'positive', content: { header: 'Your user login was successful.', main: `Welcome to our site ${user.username}.` }
            }
            res.redirect(302,'/')
    } else {
        res.locals.message = { type: 'negative', content: { header: 'Unsuccessful Login', main: errors.array()[0].msg } }
        res.render(path.join(root, 'views', 'authentication', 'login.ejs'), { title: 'Login' , prevReq : req.body , errors : errors.array() })
    }
});

router.get('/logout', async (req, res) => {
    await req.session.destroy();
    res.redirect(302, '/');
});

module.exports = { router: router };
