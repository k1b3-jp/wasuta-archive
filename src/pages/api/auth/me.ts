import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : undefined;

    if (!token) {
      return res.status(200).json({ isAdmin: false });
    }

    if (
      !supabaseUrl ||
      supabaseUrl === "undefined" ||
      !supabaseAnonKey ||
      supabaseAnonKey === "undefined"
    ) {
      console.error(
        "Supabase environment variables are missing: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY"
      );
      return res
        .status(500)
        .json({
          isAdmin: false,
          error:
            "Server misconfiguration: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY",
        });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });

    const { data, error } = await supabase
      .from("user_roles")
      .select("user_id, role")
      .eq("role", "admin")
      .limit(1);

    if (error) {
      return res.status(500).json({ isAdmin: false, error: error.message });
    }

    const isAdmin = Array.isArray(data) && data.length > 0;
    return res.status(200).json({ isAdmin });
  } catch (e: any) {
    return res
      .status(500)
      .json({ isAdmin: false, error: e?.message ?? "Unknown error" });
  }
}
