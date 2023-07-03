const bcrypt = require("bcryptjs");

const hashPassword = async (pass) => {
  const salt = await bcrypt.genSalt();
  const hashed = await bcrypt.hash(pass, salt);
  return hashed;
};

const comparePassword = async (password, hash) => {
  const compared = await bcrypt.compare(password, hash);
  return compared;
};


module.exports = {
hashPassword,
comparePassword
}