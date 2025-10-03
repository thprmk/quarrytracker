import mongoose, { Mongoose } from 'mongoose';

// We define a more specific type for our cached connection
interface MongooseCache {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

// Tell TypeScript that the global object can have a 'mongoose' property of our defined type
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let cached: MongooseCache = (global as any).mongoose;

if (!cached) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function connectMongoDB() {
  if (cached.conn) {
    console.log("♻️ Using existing MongoDB connection.");
    return cached.conn;
  }

  if (!cached.promise) {
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
      throw new Error(
        'Please define the MONGODB_URI environment variable inside .env.local'
      );
    }
    
    // Explicitly type the resolved value of the promise
    cached.promise = mongoose.connect(MONGODB_URI).then((mongooseInstance: Mongoose) => {
      console.log("✅ New connection established to MongoDB.");
      return mongooseInstance;
    });
  }
  
  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }
  
  return cached.conn;
}

export default connectMongoDB;