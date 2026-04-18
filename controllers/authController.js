const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// USER REGISTER CONTROLLER // 

const registerUser = async (req, res) => {
    try {
        const  { name, email, password } = req.body; // data extraction from body

        const userExists = await User.findOne({ email }); // this checks if the user already exists in the database 
        if (userExists) {                                 // If found, the function will stop there. 
            return res.status(400).json({ message: "User already exists"}); // The return is used to prevent further code from running.
        }

        const hashedPassword  = await bcrypt.hash(password, 10); // I hash the password using bcrypt before saving it to MongoDB. 
                                                                // I never store plain passwords in the database for security reasons
        const user = await User.create({ // User create and user save in the database with hashed password 
            name,
            email,
            password: hashedPassword,
        });

        res.status(201).json({                         // 201 means creted successfully and password is not sent in the response.
                                                       // best practices to not send password 
            message: "User registered successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            },
        });
    } catch (error) {                                  // If an error occurs (duplicate error, server crash, etc.), 
        res.status(500).json({ message: error.message }); // it will return a 500 status.
    }
};


// USER LOGIN CONTROLLER // 

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;  // data extraction from body

        const user = await User.findOne({ email }); // check a email in database or exist or not 
        if (!user) {
            return res.status(400),json({ message: "Invalid email or password" }); // supoose if email is not found in db then return a 400 message
        }

        const isMatch = await bcrypt.compare(password, user.password); // compare client plain password with hashed password in database
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid email or password" }); // password or incorrect then return 400
        }

        const token = jwt.sign(                  // jwt token creation
            { id: user._id, role: user.role }, // Payload : we enter the data that will be stored inside the token.
            process.env.JWT_SECRET,           // Secret Key : This is a secret password which is known only to the server. ex- .env
            { expiresIn: "1d" }               // Expiry Time : The token will expire after 1 day. 
        );

        res.status(200).json({               // Success Response : if the login is successful, the server will send a 200 status code and a success message.
            message: "Login successful",     
            token,
        });

    } catch (error) {
        res.status(500).json({ message: error.message });  // if an error occures during the login process, the server will return a 500 status code and an error message,
    }
};



module.exports = { registerUser, loginUser };