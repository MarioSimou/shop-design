const Router = require('express-promise-router');
const router = new Router(),
      path = require('path'),
      root = require('../util/root');

router.get('/', async (req,res) => {
    res.render(path.join(root, 'views', 'index.ejs'), { title : 'Home'});
})

module.exports = { router : router }