const multer = require('multer'),
      path   = require('path');

module.exports.filter = ( req , file , cb ) => {
    switch(file.mimetype){
        case 'image/png':
        case 'image/jpg':
        case 'image/jpeg':
            cb( null , true )
            break;
        default:
            cb( null , false )
            break;
    }
}

// Allows to parse files to binary
module.exports.storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const destDir = path.join( 'public' , 'img' , 'products')
        cb(null, destDir )
    },
    filename: function (req, file, cb) {
        const fileName = `img-${Date.now()}${ file.mimetype.replace('image/' , '.')}` 
        cb(null, fileName ) 
    }
})

