custom = Object.create(null)
custom.util = Object.create(null)

// Utilities dictionary
custom.util.fadeMessage = () => {
    if (document.querySelector('.message-wrapper')) {
        setTimeout(() => {
            // add the class hide
            document.querySelector('.message-wrapper').remove();
        }, 5000)
    }
}

// PRODUCTS SITE
custom.util.products = Object.create( null );

// routine that asynchronously delete a product
custom.util.products.addDelProdListener = () => {
    // iterates over each delete btn
    document.querySelectorAll('.delete-btn').forEach( product => {
        // adds the related event
        product.addEventListener('click' , function ( e ) {
            let el = e.target
            
            // functionality that looks to the closest div and finds the product Id
            switch( el.tagName.toLowerCase() ){
                case 'i':
                case 'button':
                    el = el.closest('div')
                case 'div':
                    // set request variables
                    const prodId = el.dataset.prodid
                    const url = `/product/${prodId}`
                    const csrf = el.querySelector('input').value
                    fetch( url , {
                        method : 'DELETE',
                        headers: { 
                            'Content-Type' : 'application/json',
                            'csrf-token' : csrf
                         }
                    })
                    .then( data => {
                        return data.json();
                    })
                    .then( json => {
                        if( json.status === 200 ){
                            el.closest('.column').remove()
                        } else {
                            throw new Error('Unsuccessful product deletion.')    
                        }
                    })
                    .catch(error => {
                        throw new Error(error.message)
                    })
                    console.log(prodId)
            }
        })
    })
}

custom.util.products.execute = () => {
    // delete btns now listen to on-click events
    custom.util.products.addDelProdListener();
}  

// IIEF
(() => {
    // always executed
    custom.util.fadeMessage();

    console.log(`PATHNAME : ${window.location.pathname}`)
    switch (window.location.pathname) {
        case '/register':
            console.log('inside /register')
            break
        case '/':
            console.log('inside /')
            break;
        case '/products/':
            custom.util.products.execute()
            console.log('inside products')
            break;
        default:
            console.log('DEFUALT')
            break;

    }

})()


