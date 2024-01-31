const jwt = require("jsonwebtoken");
const secret = "chessBoard"; // This should be your actual secret key

const authMidd = (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log(authHeader);

  const parts = authHeader ? authHeader.split(" ") : [];

  if (parts.length === 2 && parts[0] === "Bearer") {
    const token = parts[1];

    // Verify the token using jwt.verify
    jwt.verify(token, secret, (err, decoded) => {
      if (err) {
        // If token is not valid or expired, respond with an error
        return res
          .status(401)
          .send({ status: false, msg: "Unauthorized: Invalid token" });
      } else {
        // If token is valid, attach decoded token to request and continue
        req.user = decoded;
        next();
      }
    });
  } else {
    // If the correct authorization header is not present, respond with an error
    return res.status(401).send({ status: false, msg: "Unauthorized user" });
  }
};

module.exports = authMidd;
