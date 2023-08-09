import { Hono } from "hono";
import { createClient } from "@supabase/supabase-js";
import { ocr } from "./utils/ocr";

type Bindings = {
  SUPABASE_URL: string;
  SUPABASE_KEY: string;
};

const image = new Hono<{ Bindings: Bindings }>();

image.post("toText", async (c) => {
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_KEY);
  const image = await c.req.blob(); // TODO: text olarak çekip direkt istek atılacak ocr
  var name;

  // @ts-ignore
  if (!!c.user) {
    // @ts-ignore
    name = `${c.user.data.user.id}/${Date.now()}`;
  } else {
    name = `unknown/${Date.now()}${Math.random().toString().split(".")[1]}`;
  }

  const { data, error } = await supabase.storage
    .from("images")
    .upload(name, image);

  if (error) {
    return c.json({ error: error }, 400);
  }

  const url = supabase.storage.from("images").getPublicUrl(name).data.publicUrl;

  const ocrData = await ocr(url).then((data: any) => {
    return data.ParsedResults[0].ParsedText;
  });

  return c.json({ text: ocrData, imageUrl: url });
});

export default image;
