const {JWT_SECRET} = require("./config");
const jwt = require("jsonwebtoken");

const middleauth = (req,res,next)=>
{
    const authHeader = req.headers.authorization;

    if(!authHeader || authHeader.split(' ')[0] != "Bearer")
    {
        return res.status(403).json({});
    }
    console.log(authHeader);
    const token = authHeader.split(' ')[1];
    try{
        const decoded = jwt.verify(token,JWT_SECRET);
        decoded.userId = req.body.userId;
        next();
    }
    catch(err){
        return res.status(403).json({
            message : "Failed authorization"
        });
    }
}

module.exports = middleauth;