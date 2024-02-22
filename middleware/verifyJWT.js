const jwt = require("jsonwebtoken");

const verifyJWT = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  //console.log("req headers", req.headers);
  //console.log("authheader", authHeader, authHeader?.split(" "));

  // const length = authHeader?.split(" ").length;
  // console.log("LENGTH", length);
  // console.log(
  //   "split",
  //   authHeader?.split(" ")[1],
  //   authHeader?.split(" ")[1] === "null"
  // );

  if (authHeader?.split(" ")[1] === "null") {
    return res.status(401).json({ message: "Unauthorized:no token" });
  }

  const token = authHeader.split(" ")[1];
  //console.log("token", token);

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      console.log(err);
      return res.status(403).json({ message: "Forbidden:token expired" });
    }
    console.log("decoded", decoded);
    req.user = decoded.UserInfo.username;
    req.roles = decoded.UserInfo.roles;
    next();
  });
};

module.exports = verifyJWT;
