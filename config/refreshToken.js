const jwt = require("jsonwebtoken");
const secret = process.env.JWT_KEY;

const genRefreshToken = async (id) => {
  const payload = {
    id,
  };
  return jwt.sign(payload, secret, {
    expiresIn: "3d",
  });
};

module.exports = { genRefreshToken };
