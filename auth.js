require('dotenv').config()
const jwt = require('jsonwebtoken');

// Middleware de autenticação
function auth(req, res, next) {
    const authToken = req.headers['authorization'];
    
    if(authToken != undefined){
        
        const token = authToken.split(' ')[1];
        const secret = process.env.JWTSECRET;


        jwt.verify(token, secret, (err, data) => {
            if(err){
                res.status(401);
                res.json({err: "Token inválido"});
            } else {
                req.token = token;
                req.loggedUser = {id: data.id, email: data.email};
                next();
            }
        })
        console.log(token);
    }else{
        res.status(401);
        res.json({err: "Token inválido"});
    }
}

module.exports = auth;