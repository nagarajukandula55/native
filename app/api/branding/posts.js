import connectDB from "@/lib/mongodb";
import Post from "@/models/Post";

export async function GET() {
  await connectDB();
  const posts = await Post.find({});
  return new Response(JSON.stringify({ success: true, posts }), { status: 200 });
}

export async function POST(req) {
  await connectDB();
  const data = await req.json();
  const post = await Post.create(data);
  return new Response(JSON.stringify({ success: true, post }), { status: 201 });
}

export async function PUT(req) {
  await connectDB();
  const { id, ...updates } = await req.json();
  const post = await Post.findByIdAndUpdate(id, updates, { new: true });
  return new Response(JSON.stringify({ success: true, post }), { status: 200 });
}

export async function DELETE(req) {
  await connectDB();
  const { id } = await req.json();
  await Post.findByIdAndDelete(id);
  return new Response(JSON.stringify({ success: true }), { status: 200 });
}
