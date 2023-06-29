import { connect } from "mongoose";

const selectDB = () => {
  if (process.env.NODE_ENV !== "prodution") return process.env.LOCAL_MONGO_URL;
      return process.env.MONGO_URL;
};

const createDB = async () => {
  try {
    // mongoose.set("strictQuery", false);
    await connect(selectDB());
     console.log(`Database connected sucessfully to mongoDB`.green.underline);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

export {
  createDB
}
