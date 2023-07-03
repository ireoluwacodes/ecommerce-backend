const jwt = require("jsonwebtoken");
const secret = process.env.JWT_KEY;

const genToken = async (id) => {
  const payload = {
    id,
  };
  return jwt.sign(payload, secret, {
    expiresIn: "7 days",
  });
};

const verifyToken = async (token) => {
  try {
    const decoded = await jwt.verify(token, secret);
    return decoded.id;
  } catch (err) {
    throw new Error(err);
  }
};

module.exports = {
  genToken,
  verifyToken,
};
