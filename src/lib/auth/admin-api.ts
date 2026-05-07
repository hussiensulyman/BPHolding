import { NextResponse } from "next/server";

import { getAdminSessionUser } from "@/lib/auth/admin-session";

export async function requireAdminApiUser(section = "dashboard") {
  const user = await getAdminSessionUser(section);

  if (!user) {
    return {
      user: null,
      response: NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 },
      ),
    };
  }

  return {
    user,
    response: null,
  };
}

export function ok<T>(data: T) {
  return NextResponse.json({
    success: true,
    data,
    error: null,
  });
}

export function badRequest(message: string, status = 400) {
  return NextResponse.json(
    {
      success: false,
      data: null,
      error: message,
    },
    { status },
  );
}
