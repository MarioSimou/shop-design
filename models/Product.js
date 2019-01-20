const crypto = require('crypto')
const Shop = require('./Shop');

class Product extends Shop {
    constructor({ _id, _title, _price, _imageUrl, _description }) {
        super( _id )
        this._title = _title
        this._price = _price
        this._imageUrl = _imageUrl
        this._description = _description
    }

    // Getters and Setter
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

    // Methods
    async save() {
        if (!this.connection) return null

        try {
            const status = await process.MONGO.collection(Product.getClass).update({ _id: this.id }, {
                _id: this.id,
                _title: this.title,
                _price: this.price,
                _imageUrl: this.imageUrl,
                _description: this.description,
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
            const product = await collection.findOne(query);
            
            return product ? new Product( product ) : null ;

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