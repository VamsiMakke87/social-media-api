const jwt = require("jsonwebtoken");

const authenticateJWT = (req, res, next) => {
  try {
    const token = req.header("Authorization").substring(7);

    if (!token) {
      res.status(401).json({ message: "Access denied! no token provided" });
    }
    try {
      const verified = jwt.verify(token, process.env.JWT_SECRET);
      res.user = verified;
      next();
    } catch (err) {
      res.status(403).json({ message: "Invalid or expired token" });
    }
  } catch (err) {
    res.status(500).json({"message":"Invalid request token"});
  }
};

module.exports = authenticateJWT;
