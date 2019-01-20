const User = require('./User');
const crypto = require('crypto');
const Shop = require('./Shop');

class Cart extends Shop {
    constructor({ _id, _products, _user }) {
        super( _id )
        this._user = _user
        this._products = _products ? _products : []
        this._modifiedDate = new Date()
    }
    // Getters and Setters
    set user(value) {
        this._user = value
    }

    get user() {
        return this._user
    }

    set products(value) {
        let existingProduct;
        if (this.products.length > 0) existingProduct = this.products.find(v => v.product._id === value._id)
        if (existingProduct) {
            existingProduct.quantity += 1
        } else {
            this.products.push({
                product: value,
                quantity: 1
            })
        }
    }
    get products() {
        return this._products
    }

    // Methods
    async save() {
        if (!this.connection) return null

        try {
            const status = await process.MONGO.collection(Cart.getClass).update({ _id: this.id }, {
                _id: this.id,
                _products: this.products,
                _user: this.user,
                _modifiedDate: this.modifiedDate
            }, { upsert: true })

            return status ? status.result.ok : null
        } catch (e) {
            throw new Error('Unsuccessful cart insert')
        }
    }

    async checkout(){
        if(!this.connection) return null

        const status = await process.MONGO.collection(Cart.getClass).updateOne({ _id : this.id } , { $set : { _products : [] } } )

        return status ? status.result.ok : null
    }

    static async findOne(query = {}) {
        if (!process.MONGO) return null

        try {
            // checks if the query has any values

            if (Object.values(query).length < 1) return null

            // searches for the cart
            const cart = await process.MONGO.collection(Cart.getClass).findOne(query)
            // returns null if the cart was not found
            
            return cart ? new Cart( cart ) : null

        } catch (e) {
            throw new Error('Unsuccessful cart findOne')
        }
    }
}

module.exports = Cart;