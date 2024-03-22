import { Hono } from "hono";
import { createClient } from "@supabase/supabase-js";

const upload = new Hono<{ Bindings: Bindings }>();

upload.post("", async (c) => {
  const { SUPABASE_URL, SUPABASE_KEY } = c.env;
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  
  const image = await c.req.blob(); // TODO: text olarak çekip direkt istek atılacak ocr
  
  var userId = null;
  var name = `unknown/${Date.now()}${Math.random().toString().split(".")[1]}`;

  if (c.user?.data.user) {
    userId = c.user.data.user.user_metadata.username;
    name = `${userId}/${Date.now()}`;
  }

  const { data, error } = await supabase.storage
    .from("images")
    .upload(name, image)
    .then((data: any) => data);

  const supabaseUrl =
    "https://ewbexihththlkcqybuoa.supabase.co/storage/v1/object/public/images/";
  const url = supabaseUrl + data.path;
  if (error) {
    return c.json({ error: error }, 400);
  }

  return c.json({ url });
});

export default upload;
