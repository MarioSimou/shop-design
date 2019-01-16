const MongoClient = require('mongodb').MongoClient;
const mongo = {};

// Method that allows the connection with mongoDB
mongo.connect = async (url, cb) => {
    return new Promise((resolve, reject) => {
        MongoClient.connect(url, { useNewUrlParser: true }, (err, client) => {
            if (!err) {
                resolve(client)
            } else {
                reject('error')
            }
        });
    })
        .then(client => {
            // Regex that extracts the name of the database
            const regex = /(?<=mongodb:\/\/.*?\/)(.*)/g
            // checks for the database name
            const dbName = regex.test(url) ? url.match(regex)[0] : null

            // Makes the Database object available globally
            return dbName ? client.db(dbName) : null
        })
        .then(db => {
            if(db){
                process.MONGO = db;
                cb()    
            }else {
                throw new TypeError('Undefined Database Object')
            }
        })
        .catch(err => {
            throw new Error('Client connection was not reachable.')
        })
}


module.exports = mongo
