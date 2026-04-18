const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => { // next is used to pass control to the next middleware function in the stack
    try {
        let token;           // store a token to make a variable to store the token

        if (req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer")) {   //to verify that a request's Authorization header exists and is in the correct Bearer <token> format

            token = req.headers.authorization.split(" ")[1]; // token is extract from the header by split 

            const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify the token using the secret key defined in the env 
                                                                       // check token original or not matchhing with secret key and token are expired or not

            req.user = await User.findById(decoded.id).select("-password"); // search db in user token id user and remove password field and store user data in req.user
            next(); // all correct then pass control to the next middleware
        } else {
            res.status(401).json({ message: "Not authorized, no token "}); // if token is not find
        }

    } catch (error) {
        res.status(401).json({ message: "Not authorized, token failed" }); // if token are wrong or expired 
    }
 };

 module.exports = protect;
