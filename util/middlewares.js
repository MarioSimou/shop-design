const middlewares = {}
const { body } = require('express-validator/check');
const User = require('../models/User');
const bcryptjs = require('bcryptjs');

const isEmpty = term => {
    const type = Object.prototype.toString.call(term).match(/\[object\s(.*)\]/)[1]
    switch (type) {
        case 'Array':
        case 'String':
            return term.length === 0 ? true : false
            break;
        case 'Object':
            return Object.values(term).length === 0 ? true : false
            break;
        case 'Number':
            return Number(ter).toString().length === 0 ? true : false
            break;
    }
}

middlewares.authentication = (req, res, next) => {
    if (req.session.user) next()
    else {
        req.session.message = { type: 'negative', content: { header: 'Unsuccessful Loading', main: `A user needs to register in order to proceed.` } }
        res.redirect(302, '/register')
    }
}

middlewares.validation = {}
middlewares.validation.validateRegistrationData = [
    body('username')
        .custom(username => {
            if (isEmpty(username)) throw new Error()
            else return true
        })
        .withMessage('Fill all the values to proceed.'),
    body('email')
        .custom(email => {
            if (isEmpty(email)) throw new Error()
            else return true
        })
        .withMessage('Fill all the values to proceed.')
        .isEmail()
        .withMessage('Incorrect email')
        .custom((email, { req }) => {
            return Promise.all([
                User.findOne({ _username: req.body.username }),
                User.findOne({ _email: email })
            ])
                .then(matches => {
                    if (matches[0] || matches[1]) return Promise.reject('A user account with that email already exists.')
                    else return true
                })
        })
        .withMessage('A user account with that email already exists.')
    ,
    body('password')
        .custom(password => {
            if (isEmpty(password)) throw new Error()
            else return true
        })
        .withMessage('Fill all the values to proceed.')
        .isLength({ min: 5 })
        .withMessage('The password should at least have 5 characters')
        .custom((password, { req }) => {
            if (password === req.body.confirmPassword) return true
            else throw new Error();
        })
        .withMessage('Passwords do not match'),
    body('confirmPassword')
        .custom(confirmPassword => {
            if (isEmpty(confirmPassword)) throw new Error()
            else return true
        })
        .withMessage('Fill all the values to proceed.')
        .isLength({ min: 5 })
        .withMessage('The password should at least have 5 characters')
        .custom((confirmPassword, { req }) => {
            if (confirmPassword === req.body.password) return true
            else throw new Error();
        })
        .withMessage('Passwords do not match'),
    body('agreeConditions')
        .custom(agreeConditions => {
            if (isEmpty(agreeConditions)) throw new Error()
            else return true
        })
        .withMessage('Fill all the values to proceed.')
]

// LOGIN PAGE
middlewares.validation.validateLoginData = [
    body('email')
        .custom(email => {
            if (isEmpty(email)) throw new Error()
            else return true
        })
        .withMessage('Fill all the values to proceed.')
        .isEmail()
        .withMessage('Please insert a valid email.'),
    body('password')
        .custom(password => {
            if (isEmpty(password)) throw new Error()
            else return true
        })
        .withMessage('Fill all the values to proceed.')
        .isLength({ min: 5 })
        .withMessage('The password should at least have 5 characters')
        .custom( (password , { req }) => {
            return User.findOne( { _email : req.body.email } )
            .then( user => {
                if( user ){
                    const exist = bcryptjs.compareSync( password , user._password );
                    if(exist){
                        req.session.user = user;
                        return true
                    }else{
                        return Promise.reject('User password does not match.');
                    }
                }else{
                    return Promise.reject('User account does not exist.')
                }
            })
        })
]

module.exports = middlewares