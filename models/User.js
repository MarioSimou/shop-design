const crypto = require('crypto');

class User {
    constructor({ _id, username, email, password, agreeConditions }) {
        this._id = _id ? _id : crypto.pseudoRandomBytes(30).toString('hex');
        this._username = username;
        this._email = email;
        this._password = password;
        this._agreeConditions = agreeConditions === 'on' ? true : false;
        this._connection = process.MONGO ? true : false;
        this._cartId = undefined // object
    }

    // Getters and setters of user object
    get id() {
        return this._id
    }
    get username() {
        return this._username
    }
    get email() {
        return this._email
    }
    get agreeConditions() {
        return this._agreeConditions
    }

    get password(){
        return this._password
    }

    set cartId(value) {
        this._cartId = (value)
    }

    get cartId() {
        return this._cartId
    }

    static get getClass() {
        return 'users'
    }

    // Methods
    async save() {
        // checks whether a connection exists
        if (!this._connection) return null
        // collection object
        const collection = process.MONGO.collection(User.getClass);

        // async code that stores the user object
        try {
        
            const status = await collection.update({ email: this.email }, {
                _id: this.id,
                username: this.username,
                email: this.email,
                password: this.password,
                agreeConditions: this.agreeConditions,
                cartId: this.cartId
            }, { upsert: true })

            return status ? status.result.ok : null

        } catch (e) {
            throw new Error('Unsuccessful user insert')
        }
    }
    // Static Methods
    static async find(query = {}) {
        // array with query values
        const values = Object.values(query);
        // connection to mongodb
        const connection = process.MONGO;
        let user;

        if (!connection) return null
        // connects to users collection
        const collection = connection.collection(User.getClass)

        if (values.length > 1) {
            users = await collection.find(query).toArray();
        } else {
            users = await collection.find().toArray();
        }
        return users;
    }

    static async findOne(query = {}) {
        const connection = process.MONGO;

        if (!connection) return null
        if (Object.values(query).length < 1) return null

        // connects to users collection
        const userDB = await connection.collection(User.getClass).find(query).next();

        if (!userDB) return null

        // creates a user object
        const user = new User({
            _id: userDB._id,
            username: userDB.username,
            email: userDB.email,
            password: userDB.password,
            agreeConditions: userDB.agreeConditions
        })
        // populates the carts id
        user.cartId = userDB.cartId;
        return user;
    }
}


module.exports = User