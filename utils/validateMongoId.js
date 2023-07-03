const mongoose = require("mongoose");

const validateDbId = (id) => {
  const isValid = mongoose.Types.ObjectId.isValid(id);
  if (!isValid) throw new Error("Invalid MongoDb Id");
};

module.exports = { validateDbId };
