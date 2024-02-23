const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");

//@desc Login
//@route POST/auth
//@acess Public

const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  //confirm data
  if (!username || !password) {
    return res.status(400).json({ message: "All fields are requried" });
  }

  const foundUser = await User.findOne({ username }).exec();

  if (!foundUser || !foundUser.active) {
    return res.status(400).json({ message: "Unauthorized" });
  }

  const match = await bcrypt.compare(password, foundUser.password);

  if (!match) {
    return res.status(401).json({ message: "Invalid username or password" });
  }

  // console.log("access", process.env.ACCESS_TOKEN_SECRET);
  // console.log("refresh", process.env.REFRESH_TOKEN_SECRET);

  //creating access token

  const accessToken = jwt.sign(
    {
      UserInfo: {
        username: foundUser.username,
        roles: foundUser.roles,
      },
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" }
  );

  //creating refreshtoken

  const refreshToken = jwt.sign(
    { username: foundUser.username },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" }
  );

  //create secure cookie with refresh token

  res.cookie("jwt", refreshToken, {
    httpOnly: true, //accessible only by web server
    secure: true, //https
    sameSite: "none", //cross-site cookie
    maxAge: 7 * 24 * 60 * 60 * 1000, //to match refresh token expiry
    path: "http://localhost:3500/auth/refresh",
  });

  //send back accessToken containing username and roles
  res.json({ accessToken });
});

//@desc Refresh
//@route GET /auth/refresh
//@acess Public - because access token has expired

const refresh = (req, res) => {
  //console.log("inside refresh");
  const cookies = req.cookies;
  // console.log("cookies", cookies);

  if (!cookies?.jwt) {
    return res
      .status(401)
      .json({ message: "Unauthorized:Refresh Token Expired" });
  }

  const refreshToken = cookies.jwt;

  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    asyncHandler(async (err, decoded) => {
      if (err) {
        return res
          .status(403)
          .json({ message: "Forbidden: Refresh Token Expired" });
      }

      const foundUser = await User.findOne({ username: decoded.username });
      if (!foundUser) {
        res
          .status(401)
          .json({ message: "Unauthorized: wrong cookie send, no user found" });
      }

      const accessToken = jwt.sign(
        {
          UserInfo: {
            username: foundUser.username,
            roles: foundUser.roles,
          },
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "15m" }
      );
      //res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
      res.json({ accessToken });
    })
  );
};

//@desc Logout
//@ POST /auth/logout
//@acess Public just to clear cookies if exists

const logout = (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) {
    return res.sendStatus(204);
  }

  res.clearCookie("jwt", { httpOnly: true, sameSite: "none", secure: true });

  res.json({ message: "cookie cleared" });
};

module.exports = { login, refresh, logout };
