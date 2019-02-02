const path = require('path'),
      root = require('./root'),
      fs   = require('fs');

module.exports = ( relPath ) => {
    try{
        fs.unlink( path.join( root , 'public' , relPath ) , (err , res ) => {
            if(err) throw new Error();
            console.log('image successfully deleted')
        } )
    }catch ( e ) {
        next( e )
    }
}