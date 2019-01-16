const User = require('./User');
const crypto = require('crypto');


class Cart {
    constructor({ _id, _products, user }) {
        this._id = _id ? _id : crypto.pseudoRandomBytes(30).toString('hex')
        this._connection = process.MONGO ? true : false
        this._user = user
        this._products = _products ? _products : []
        this._modifiedDate = new Date()
    }
    // Getters and Setters
    get id() {
        return this._id
    }
    get connection() {
        return this._connection
    }

    set user(value) {
        this._user = value
    }

    get user() {
        return this._user
    }

    set products(value) {
        let existingProduct;
        if (this.products.length > 0) existingProduct = this.products.find(v => v.product._id === value._id)
        console.log(existingProduct)
        if (existingProduct) {
            existingProduct.quantity += 1
        } else {
            this._products.push({
                product: value,
                quantity: 1
            })
        }
    }
    get products() {
        return this._products
    }

    static get getClass() {
        return 'carts'
    }

    // Methods
    async save() {
        if (!this._connection) return null

        try {
            const status = await process.MONGO.collection(Cart.getClass).update({ _id: this.id }, {
                _id: this.id,
                _products: this.products,
                user: this.user,
                modifiedDate: this.modifiedDate
            }, { upsert: true })

            return status ? status.result.ok : null
        } catch (e) {
            throw new Error('Unsuccessful cart insert')
        }
    }

    static async findOne(query = {}) {
        if (!process.MONGO) return null

        try {
            // checks if the query has any values

            if (Object.values(query).length < 1) return null

            // searches for the cart
            const cart = await process.MONGO.collection(Cart.getClass).findOne(query)
            // returns null if the cart was not found
            if (!cart) return null

            // creates a cart object to be returned
            const user = new User({
                _id: cart.user._id,
                username: cart.user._username,
                email: cart.user._email,
                password: cart.user._password,
                agreeConditions: cart.user._agreeConditions
            })
            user.cartId = cart._id
            
            return new Cart({ _id: cart._id, _products: cart._products, user: user })

        } catch (e) {
            throw new Error('Unsuccessful cart findOne')
        }
    }
}

module.exports = Cart;