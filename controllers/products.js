const Router = require('express-promise-router');
const router = new Router(),
    path = require('path'),
    root = require('../util/root'),
    middlewares = require('../util/middlewares'),
    Product = require('../models/Product'),
    eraseImg = require('../util/eraseImg'),
    k = 4; // number of items per page ; 

router.get('/products', middlewares.authentication, async (req, res) => {
    const cpage = +req.query.page || 1 // loaded page number
    const nDoc = await Product.count(); // number of products
    const lpage = Math.ceil( nDoc / k ) // last page number
    // finds all products related to the displayed page
    const products = await Product.find( null , { skip : ((cpage - 1) * k) , limit : k  } );

    res.render(path.join(root, 'views', 'products', 'products.ejs'), { title: 'Products', products: products, cpage : cpage , lpage : lpage })
});

router.get('/product/new', middlewares.authentication, async (req, res) => {
    res.render(path.join(root, 'views', 'products', 'addProduct.ejs'), { title: 'Add Product' })
});

router.post('/product', middlewares.authentication, async (req, res) => {
    const { title : _title , price : _price , description : _description } = req.body
    const _image = req.file.path.replace('public' , '')

    if (_title && _price && _image && _description) {
        const product = new Product({ _title, _price, _image, _description })
        product.save();
        req.session.message = { type: 'positive', content: { header: 'Valid insert', main: `The product has been successfully inserted.` } }
        res.redirect(302, '/products')
    } else {
        req.session.message = { type: 'negative', content: { header: 'Invalid insert', main: `Fill all the values to proceed.` } }
        res.redirect(302, '/product/new')
    }
})

router.get('/product/:_id', middlewares.authentication, async (req, res) => {
    const { _id } = req.params;
    const product = await Product.findOne( { _id });

    if (product) {
        res.render(path.join(root, 'views', 'products', 'product.ejs'), { title: `${product.title} Details`, product: product })
    } else {
        req.session.message = { type: 'negative', content: { header: 'Unsuccessful load', main: `Page could not load.` } }
        res.redirect(302, `/products`)
    }
});

router.get('/product/:_id/edit', middlewares.authentication, async (req, res) => {
    const { _id } = req.params;
    const product = await Product.findOne({ _id });
    if (product) {
        res.render(path.join(root, 'views', 'products', 'editProduct.ejs'), { title: `${product.title} Edit`, product: product })
    } else {
        req.session.message = { type: 'negative', content: { header: 'Unsuccessful load', main: `Page could not load.` } }
        res.redirect(302, `/products`)
    }
});

router.put('/product/:_id', middlewares.authentication, async (req, res) => {
    const { title : _title , price : _price ,  description : _description } = req.body
    const _image = req.file.path.replace( 'public' , '' )
    const { _id } = req.params

    if (_title && _price && _image && _description) {
        // updated product
        const product = await Product.findOne( { _id  } )
        // custom routine that deletes the file from the file system
        eraseImg( product.image )

        // updates the product image
        product.image = _image
        // save the chagnes
        const status = await product.save()
        if (status) {
            req.session.message = { type: 'positive', content: { header: 'Valid update', main: `The product has been successfully updated.` } }
            res.redirect(302, `/product/${_id}`)
        } else {
            req.session.message = { type: 'negative', content: { header: 'Unsuccessful edit', main: `The product update was unsuccessful.` } }
            res.redirect(302, `/product/${_id}/edit`)
        }
    } else {
        req.session.message = { type: 'negative', content: { header: 'Unsuccessful edit', main: `Fill all the values to proceed` } }
        res.redirect(302, `/product/${_id}/edit`)
    }
});


router.delete('/product/:_id', middlewares.authentication, async (req, res) => {
    // returns the product id from the DELETE request using fetch API
    const { _id } = req.params;
    // finds the produc and deletes the related image
    let product = await  Product.findOne( { _id  } )
    eraseImg( product.image )
    
    // deletes the product from the daabase and returns the process status to the client
    let status = await  Product.deleteOne( { _id  } )
    // checks the returned status from the database
    status = status === 1 ? 200 : 500    
    // returns a json object to the client side that indicates the result
    res.status( status ).json( { status } )

});


module.exports = { router: router };