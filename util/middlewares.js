const middlewares = {}

middlewares.authentication = (req, res, next)=> {
    if(req.session.user) next()
    else{
        req.session.message = { type: 'negative', content: { header: 'Unsuccessful Loading', main: `A user needs to register in order to proceed.` } }
        res.redirect(302,'/register')
    }
}

module.exports = middlewares