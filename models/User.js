const Shop = require('./Shop');

class User extends Shop {
    constructor( { _id, _username, _email, _password, _agreeConditions , _cartId } ) {
        super( _id )
        this._username = _username;
        this._email = _email;
        this._password = _password;
        this._agreeConditions = _agreeConditions === 'on' ? true : false;
        this._cartId = _cartId // object
    }

    // Getters and setters of user object
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

    // Methods
    async save() {
        // checks whether a connection exists
        if (!this.connection) return null
        // collection object
        const collection = process.MONGO.collection(User.getClass);

        // async code that stores the user object
        try {
        
            const status = await collection.update({ _email: this.email }, {
                _id: this.id,
                _username: this.username,
                _email: this.email,
                _password: this.password,
                _agreeConditions: this.agreeConditions,
                _cartId: this.cartId
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
        const user = await connection.collection(User.getClass).find(query).next();
        return user ? new User( user ) : null

    }
}


module.exports = User