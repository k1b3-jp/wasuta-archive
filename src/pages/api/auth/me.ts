import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : undefined;

    if (!token) {
      return res.status(200).json({ isAdmin: false });
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
    return res.status(500).json({ isAdmin: false, error: e?.message ?? "Unknown error" });
  }
}