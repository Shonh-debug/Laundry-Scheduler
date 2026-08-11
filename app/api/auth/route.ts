export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { readDb, writeDb } from "@/lib/db";
import { signJwtToken } from "@/lib/auth";

const AVATARS = ["👨‍💻", "🛹", "🎧", "🏀", "🎨", "👾", "🦊", "🐯", "🐼"];
const COLORS = ["bg-blue-600 text-white", "bg-emerald-600 text-white", "bg-amber-600 text-white", "bg-purple-600 text-white", "bg-rose-600 text-white"];

export async function POST(req: NextRequest) {
  try {
    const { action, username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ success: false, error: "Username and password are required" }, { status: 400 });
    }

    const db = await readDb();
    let user = db.users.find(u => u.name.toLowerCase() === username.toLowerCase());

    if (action === "register") {
      if (user) {
        return NextResponse.json({ success: false, error: "Username already exists" }, { status: 400 });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      user = {
        id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        name: username,
        avatar: AVATARS[Math.floor(Math.random() * AVATARS.length)],
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        password: hashedPassword
      };

      db.users.push(user);
      await writeDb(db);
    } else if (action === "login") {
      if (!user) {
        return NextResponse.json({ success: false, error: "Invalid username or password" }, { status: 400 });
      }
      
      const isValid = await bcrypt.compare(password, user.password || "");
      if (!isValid) {
        return NextResponse.json({ success: false, error: "Invalid username or password" }, { status: 400 });
      }
    } else {
      return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
    }

    // Sign JWT
    const tokenPayload = {
      id: user.id,
      name: user.name,
      avatar: user.avatar,
      color: user.color
    };
    
    const token = await signJwtToken(tokenPayload);

    const response = NextResponse.json({ success: true, user: tokenPayload });
    response.cookies.set({
      name: "auth_token",
      value: token,
      httpOnly: true,
      path: "/",
      maxAge: 12 * 60 * 60, // 12 hours in seconds
      sameSite: "strict"
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Server error" }, { status: 500 });
  }
}
