import clientPromise from "@/lib/mongodb";

export async function getProducts() {
  const client = await clientPromise;
  const db = client.db("native"); // Database name
  return db.collection("products").find({}).toArray();
}

export async function addProduct(product) {
  const client = await clientPromise;
  const db = client.db("native");
  return db.collection("products").insertOne(product);
}

export async function updateProduct(id, updatedFields) {
  const client = await clientPromise;
  const db = client.db("native");
  return db
    .collection("products")
    .updateOne({ _id: new ObjectId(id) }, { $set: updatedFields });
}

export async function deleteProduct(id) {
  const client = await clientPromise;
  const db = client.db("native");
  return db.collection("products").deleteOne({ _id: new ObjectId(id) });
}
