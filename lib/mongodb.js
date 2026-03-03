import { MongoClient } from "mongodb";

let client;
let clientPromise;

if (!process.env.MONGODB_URI) {
  throw new Error("Please add your MongoDB URI to .env or Vercel env");
}

if (process.env.NODE_ENV === "development") {
  // Use global variable to prevent multiple connections in dev
  if (!global._mongoClientPromise) {
    client = new MongoClient(process.env.MONGODB_URI);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // Production
  client = new MongoClient(process.env.MONGODB_URI);
  clientPromise = client.connect();
}

export default clientPromise;
