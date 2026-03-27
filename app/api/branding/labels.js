import connectDB from "@/lib/mongodb";
import Label from "@/models/Label";

export default async function handler(req, res) {
  await connectDB();

  if (req.method === "GET") {
    const labels = await Label.find();
    return res.status(200).json({ success: true, labels });
  }

  if (req.method === "POST") {
    const data = req.body;
    const label = await Label.create(data);
    return res.status(201).json({ success: true, label });
  }

  if (req.method === "DELETE") {
    const { id } = req.body;
    await Label.findByIdAndDelete(id);
    return res.status(200).json({ success: true, msg: "Deleted" });
  }

  return res.status(405).json({ success: false, msg: "Method not allowed" });
}
