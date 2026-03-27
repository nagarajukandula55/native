import connectDB from "@/lib/mongodb";
import Label from "@/models/Label";

export async function GET() {
  await connectDB();
  const labels = await Label.find({});
  return new Response(JSON.stringify({ success: true, labels }), { status: 200 });
}

export async function POST(req) {
  await connectDB();
  const data = await req.json();
  const label = await Label.create(data);
  return new Response(JSON.stringify({ success: true, label }), { status: 201 });
}

export async function PUT(req) {
  await connectDB();
  const { id, ...updates } = await req.json();
  const label = await Label.findByIdAndUpdate(id, updates, { new: true });
  return new Response(JSON.stringify({ success: true, label }), { status: 200 });
}

export async function DELETE(req) {
  await connectDB();
  const { id } = await req.json();
  await Label.findByIdAndDelete(id);
  return new Response(JSON.stringify({ success: true }), { status: 200 });
}
