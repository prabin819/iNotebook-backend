const jwt = require("jsonwebtoken");
const secret = "secret123";

const authenticate = (req, res, next)=>{
    // get the user from the jwt token and add id  to the req object
    const token = req.header("auth-token");
    if(!token){
        return res.status(401).send({error: "please authenticate using a valid token"});
    }
    try {
        const data = jwt.verify(token,secret);
        req.user = data.user;
        next();
        
    } catch (error) {
        return res.status(401).send({error: "please authenticate using a valid token"});
    }

}

module.exports = authenticate;