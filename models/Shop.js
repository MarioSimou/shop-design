const crypto = require('crypto')
class Shop {
    constructor( _id ) {
        this._connection = process.MONGO ? true : false;
        this._id = _id ? _id : crypto.pseudoRandomBytes(30).toString('hex');
    }
    // this = current instance
    get id(){
        return this._id
    }

    get connection() {
        return this._connection
    }
    // returns the class name in plural
    static get getClass() {
        return `${this.prototype.constructor.name.toLocaleLowerCase()}s`
    }
}

module.exports = Shop