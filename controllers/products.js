const Router = require('express-promise-router');
const router = new Router(),
    path = require('path'),
    root = require('../util/root'),
    middlewares = require('../util/middlewares'),
    Product = require('../models/Product');

router.get('/products', middlewares.authentication, async (req, res) => {
    const products = await Product.find();
    res.render(path.join(root, 'views', 'products', 'products.ejs'), { title: 'Products', products: products })
});

router.get('/product/new', middlewares.authentication, async (req, res) => {
    res.render(path.join(root, 'views', 'products', 'addProduct.ejs'), { title: 'Add Product' })
});

router.post('/product', middlewares.authentication, async (req, res) => {
    const { title, price, imageUrl, description } = req.body

    if (title && price && imageUrl && description) {
        const product = new Product({ title, price, imageUrl, description })
        console.log(product);
        product.save();
        req.session.message = { type: 'positive', content: { header: 'Valid insert', main: `The product has been successfully inserted.` } }
        res.redirect(302, '/products')
    } else {
        req.session.message = { type: 'negative', content: { header: 'Invalid insert', main: `Fill all the values to proceed.` } }
        res.redirect(302, '/product/new')
    }
})

router.get('/product/:id', middlewares.authentication, async (req, res) => {
    const { id } = req.params;
    const product = await Product.findOne( { _id : id });

    if (product) {
        res.render(path.join(root, 'views', 'products', 'product.ejs'), { title: `${product.title} Details`, product: product })
    } else {
        req.session.message = { type: 'negative', content: { header: 'Unsuccessful load', main: `Page could not load.` } }
        res.redirect(302, `/products`)
    }
});

router.get('/product/:id/edit', middlewares.authentication, async (req, res) => {
    const { id } = req.params;
    const product = await Product.findOne({ _id : id });
    if (product) {
        res.render(path.join(root, 'views', 'products', 'editProduct.ejs'), { title: `${product.title} Edit`, product: product })
    } else {
        req.session.message = { type: 'negative', content: { header: 'Unsuccessful load', main: `Page could not load.` } }
        res.redirect(302, `/products`)
    }
});

router.put('/product/:id', middlewares.authentication, async (req, res) => {
    const { title, price, imageUrl, description } = req.body
    const { id } = req.params

    if (title && price && imageUrl && description) {
        const product = new Product({ _id : id, title, price , imageUrl , description })
        const status = await product.save()
        if (status) {
            req.session.message = { type: 'positive', content: { header: 'Valid update', main: `The product has been successfully updated.` } }
            res.redirect(302, `/product/${id}`)
        } else {
            req.session.message = { type: 'negative', content: { header: 'Unsuccessful edit', main: `The product update was unsuccessful.` } }
            res.redirect(302, `/product/${id}/edit`)
        }
    } else {
        req.session.message = { type: 'negative', content: { header: 'Unsuccessful edit', main: `Fill all the values to proceed` } }
        res.redirect(302, `/product/${id}/edit`)
    }
});


router.delete('/product/:id', middlewares.authentication, async (req, res) => {
    const { id } = req.params;
    const status = await Product.deleteOne({ _id: id });
    if (status) {
        req.session.message = { type: 'positive', content: { header: 'Successful deletion', main: `The product has been successfully deleted.` } }
        res.redirect(302, '/products')
    } else {
        req.session.message = { type: 'negative', content: { header: 'Unsuccessful deletion', main: `The product was unable to delete.` } }
        res.redirect(302, `/product/${id}`)
    }
});


module.exports = { router: router };