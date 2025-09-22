const jwt = require("jsonwebtoken");

function generateToken(user) {
    return jwt.sign(
        { id: user._id, username: user.username }, // store user id and username in the token payload
        process.env.JWT_SECRET, // use a strong secret key from environment variables
        { expiresIn: '24h' } // token expiration time
    );
}

function attachTokenToCookie(res, token) {
    res.cookie("token", token, { // "token" is the name of the cookie, token is the value
    httpOnly: true, // Prevents client-side JS from accessing the cookie
    secure: process.env.NODE_ENV === 'production', // if in production, set secure flag to true, meaning the cookie will only be sent over HTTPS, otherwise false for local development
    sameSite: 'strict', // the cookie will only be sent in requests originating from the same site
    maxAge: 1000 * 60 * 60 * 24 // 24 hours    
    });
}

module.exports = {
    generateToken,
    attachTokenToCookie
};

