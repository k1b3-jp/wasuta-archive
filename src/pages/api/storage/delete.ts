import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : undefined;
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: token ? { Authorization: `Bearer ${token}` } : {} },
  });

  const { data: roleRows, error: roleError } = await supabase
    .from("user_roles")
    .select("user_id, role")
    .eq("role", "admin")
    .limit(1);
  if (roleError) return res.status(500).json({ error: roleError.message });
  if (!roleRows || roleRows.length === 0) return res.status(403).json({ error: "forbidden" });

  const { path, bucketName } = req.body ?? {};
  if (!path || !bucketName) return res.status(400).json({ error: "missing path/bucketName" });

  const { error } = await supabase.storage.from(bucketName).remove([path]);
  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json({ ok: true });
}