import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

  export async function GET(req) {
    try {
      const token = req.cookies.get("token")?.value;
  
      if (!token) {
        return NextResponse.json({ success: false }, { status: 401 });
      }
  
      const user = jwt.verify(token, process.env.JWT_SECRET);
  
      return NextResponse.json({
        success: true,
        user,
      });
    } catch {
      return NextResponse.json({ success: false }, { status: 401 });
    }
  }
    const user = jwt.verify(token, process.env.JWT_SECRET);

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: "Invalid token" },
      { status: 401 }
    );
  }
}
