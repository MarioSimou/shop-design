const Router = require('express-promise-router');
const router = new Router(),
    path = require('path'),
    root = require('../util/root'),
    User = require('../models/User'),
    Cart = require('../models/Cart'),
    bcryptjs = require('bcryptjs');

router.get('/register', async (req, res) => {
    res.render(path.join(root, 'views', 'authentication', 'register.ejs'), { title: 'Register' })
});

router.post('/register', async (req, res) => {
    const { username : _username, email : _email , password : _password , confirmPassword : _confirmPassword, agreeConditions : _agreeConditions } = req.body;

    if (_username && _email && _password && _confirmPassword && _agreeConditions) {

        // checks whether a similar EMAIL OR USERNAME already exists
        const existingUser = await Promise.all([
            User.findOne({ _email }),
            User.findOne({ _username })
        ])
        if (!existingUser[0] && !existingUser[1]) {
            if ( _password ===  _confirmPassword ) {
                // hashes user password
                const hashedPassword = await bcryptjs.hash( _password , 12 );
                // Creates a user object and cart object
                const user = new User({ _username, _email, _password: hashedPassword, _agreeConditions });
                const cart = new Cart({ _user : user });

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
                req.session.message = { type: 'negative', content: { header: 'Unsuccessful registration', main: `Passwords do not match` } }
                res.redirect(302, '/register')
            }
        } else {
            req.session.message = { type: 'negative', content: { header: 'Unsuccessful registration', main: `A user account already exists.` } }
            res.redirect(302, '/register')
        }
    } else {
        req.session.message = { type: 'negative', content: { header: 'Unsuccessful registration', main: `Please fill all the values` } }
        res.redirect(302, '/register');
    }
});

router.get('/login', async (req, res) => {
    res.render(path.join(root, 'views', 'authentication', 'login.ejs'), { title: 'Login' })
});

router.post('/login', async (req, res) => {
    const { email:_email, password:_password } = req.body;
    const user = await User.findOne({ _email });

    if (user) {
        const samePassword = await bcryptjs.compare( _password, user._password);

        if (samePassword) {
            // checks whether the identified user has a similar password
            const cart = await Cart.findOne({ _id: user._cartId })
            
            if (!cart) throw new Error('Unable to track user cart')

            // updates session object
            req.session.user = user
            req.session.cart = cart
            // sets a flash Message
            req.session.message = {
                type: 'positive', content: { header: 'Your user login was successful.', main: `Welcome to our site ${user.username}.` }
            }
            res.redirect(302, '/');
        } else {
            req.session.message = {
                type: 'negative', content: { header: 'Unsuccessful Login', main: `User password does not match.` }
            }
            res.redirect(302, '/login');
        }
    } else {
        req.session.message = { type: 'negative', content: { header: 'Unsuccessful Login', main: `The user account does not exist.` } }
        res.redirect(302, '/login');
    }
});

router.get('/logout', async (req, res) => {
    await req.session.destroy();
    res.redirect(302, '/');
});

module.exports = { router: router };
