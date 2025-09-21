const jwt = require("jsonwebtoken");

function requireAuth(req, res, next) {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ error: "Authentication required" });
    }

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.user = payload; // Attach user info to request object
        next();
    } catch (error) {
        return res.status(401).json({ error: "Invalid token" });
    }
}

module.exports = requireAuth;