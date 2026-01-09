import mongoose from "mongoose";

//Handles connection to the mongo database
let isConnected = false;

const mongoose_connector = async () => {
  if (isConnected) {
    return;
  }

  try {
    const db = await mongoose.connect(process.env.MONGO_URI, {
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
    });

    isConnected = db.connections[0].readyState === 1;
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    throw err;
  }
};

export default mongoose_connector;
