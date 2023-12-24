const expressJwt = require("express-jwt");
const config = require("../../config.json");
const db = require("../helpers/db");
const jwtDecode = require("jwt-decode");
const jsonwebtoken = require("jsonwebtoken");

const attachUser = (req, res, next) => {
  const token = req.cookies.authToken;
  if (!token) {
    return res.status(401).json({ message: "Authentication invalid" });
  }
  const decodedToken = jsonwebtoken.decode(token);
  if (decodedToken?.exp * 1000 < Date.now()) {
    res.clearCookie("authToken", {
      httpOnly: true,
      sameSite: "Strict",
      path: "/",
    });
    next();
  }

  if (!decodedToken) {
    return res.status(401).json({
      message: "There was a problem authorizing the request",
    });
  } else {
    req.user = decodedToken;
    next();
  }
};

const optionalAttachUser = (req, res, next) => {
  const token = req.cookies.authToken;

  if (!token) {
    next();
  }
  const decodedToken = jsonwebtoken.decode(token);
  if (decodedToken?.exp * 1000 < Date.now()) {
    res.clearCookie("authToken", {
      httpOnly: true,
      sameSite: "Strict",
      path: "/",
    });
    next();
  }
  // console.log("decodedToken-> ", decodedToken);

  if (decodedToken) {
    req.user = decodedToken;
    next();
  }
};

const requireAuth = jwt({
  secret: config.secret,
  audience: "api.orbit",
  issuer: "api.orbit",
  getToken: (req) => req.cookies.token,
});

function jwt(roles = []) {
  return [
    attachUser,
    async (req, res, next) => {
      const user = await db.User.findById(req.user.sub);

      if (!user || (roles.length && !roles.includes(user.role))) {
        return res.status(401).json({ message: "Only Admin is Authorized!" });
      }
      next();
    },
  ];
}

function jwtOptional() {
  return [
    optionalAttachUser,
    async (req, res, next) => {
      next();
    },
  ];
}

module.exports = { jwt, jwtOptional, attachUser, requireAuth };
