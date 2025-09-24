const jwt = require("jsonwebtoken");

function requireAuth(req, res, next) {
    const token = req.cookies.token; // Assuming the token is stored in a cookie named "token"
    if (!token) { // No token found, user is not authenticated
        return res.status(401).json({ error: "Authentication required" });
    }

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET); // Verify the token using the same secret key
        req.user = payload; //req.user is undefined until we set it here
        next(); //call the next middleware or function in the route handler
    } catch (error) {
        return res.status(401).json({ error: "Invalid token" });
    }
}

module.exports = requireAuth;