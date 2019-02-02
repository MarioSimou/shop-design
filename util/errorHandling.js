handleByStatusCode = ( e, req ,res ,next) => {
    switch(e.statusCode){
        case 404:
            res.send('404 Error');
            break;
        case 500:
            res.send('500 Error')
            break;
    }
    
}


module.exports =  {
    handleByStatusCode
}