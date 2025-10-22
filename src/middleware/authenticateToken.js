const jwt = require("jsonwebtoken");
const {StatusCodes} = require("http-status-codes")


const authentication = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(StatusCodes.UNAUTHORIZED).json(
        { message: "you are not authorized for this request" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = decoded; // attach admin info to request
    next();
  } catch (error) {
    res.status(StatusCodes.UNAUTHORIZED).json({ message: "Token invalid or expired" });
  }
};

module.exports =authentication