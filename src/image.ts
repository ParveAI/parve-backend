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
  var userId;
  var name;

  // @ts-ignore
  if (!!c.user) {
    // @ts-ignore
    userId = c.user.data.user.id;
    name = `${userId}/${Date.now()}`;
  } else {
    userId = null;
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



  const { data: questionData, error: questionError } = await supabase
    .from("questions")
    .insert([
      {
        image: url.toString(),
        language: "ENG",
        ocr_text: ocrData.toString(),
        user: userId,
      },
    ])
    .select("*");

  if (questionError) {
    return c.json({ error: questionError }, 400);
  }

  return c.json({ question: questionData[0] });
});

export default image;
