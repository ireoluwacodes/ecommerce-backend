const { connect, default: mongoose } = require("mongoose");

const selectDB = () => {
  if (process.env.NODE_ENV == "production"){
    return process.env.MONGO_URL;
  }else{
    return process.env.LOCAL_MONGO_URL;
  }

};

const createDB = async () => {
  try {
    // mongoose.set("strictQuery", false);
    await connect(selectDB());
   
     console.log(`Database connected sucessfully to mongoDB at ${ mongoose.connection.host}`.green.underline);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

module.exports = {
  createDB
}
