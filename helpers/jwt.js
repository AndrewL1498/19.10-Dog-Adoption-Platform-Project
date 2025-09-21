const jwt = require("jsonwebtoken");

function generateToken(user) {
    return jwt.sign(
        { id: user._id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );
}

function attachTokenToCookie(res, token) {
    res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
    sameSite: 'strict',
    maxAge: 1000 * 60 * 60 * 24 // 24 hours    
    });
}

module.exports = {
    generateToken,
    attachTokenToCookie
};

