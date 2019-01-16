const crypto = require('crypto')

class Product {
    constructor({ _id, title, price, imageUrl, description }) {
        this._id = _id ? _id : crypto.pseudoRandomBytes(30).toString('hex')
        this._title = title
        this._price = price
        this._imageUrl = imageUrl
        this._description = description
        this._connection = process.MONGO ? true : false
    }

    // Getters and Setter
    get id() {
        return this._id
    }
    get title() {
        return this._title
    }
    get price() {
        return this._price
    }
    get imageUrl() {
        return this._imageUrl
    }
    get description() {
        return this._description
    }
    get connection() {
        return this._connection
    }

    static get getClass() {
        return 'products'
    }

    // Methods
    async save() {
        if (!this.connection) return null

        try {
            const status = await process.MONGO.collection(Product.getClass).update({ _id: this.id }, {
                _id: this.id,
                title: this.title,
                price: this.price,
                imageUrl: this.imageUrl,
                description: this.description,
            }, { upsert: true })

            return status ? status.result.ok : null

        } catch (e) {
            throw new Error('Unsuccessful product insert')
        }
    }
    // Static Methods
    static async find(query = {}) {
        if (!process.MONGO) return null

        try {
            const collection = process.MONGO.collection(Product.getClass)
            const values = Object.values(query);
            let products;

            if (values.length > 1)
                products = await collection.find(query).toArray()
            else
                products = await collection.find({}).toArray();

            return products ? products : null
        } catch (e) {
            throw new Error('Unsuccessful product find')
        }
    }

    static async findOne(query = {}) {
        if (!process.MONGO) return null

        try {
            // checks whether the query has values
            if (Object.values(query).length < 1) return null

            // Variables
            const collection = process.MONGO.collection(Product.getClass);
            const productDB = await collection.findOne(query);
            
            // if the returned product is null return null
            if(!productDB) return null
            
            // creates a product object and returns it
            const product = new Product({
                _id: productDB._id,
                title: productDB.title,
                price: productDB.price,
                imageUrl: productDB.imageUrl,
                description: productDB.description
            })

            return product;

        } catch (e) {
            throw new Error('Unsuccessful product findById')
        }
    }

    static async deleteOne(query = {}) {
        if (!process.MONGO) return null

        try {
            // Variables
            const values = Object.values(query);
            const collection = process.MONGO.collection(Product.getClass);
            let status;

            if (values.length > 0) status = await collection.deleteOne(query);

            return status ? status.result.ok : null
        } catch (e) {
            throw new Error('Unsuccessful product deletion')
        }
    }
}

module.exports = Product;