import { Hono } from "hono";
import { createClient } from "@supabase/supabase-js";
import { ocr } from "../utils/ocr";
 
const image = new Hono<{ Bindings: Bindings }>();

image.post("toText", async (c) => {
  const image = await c.req.blob(); // TODO: text olarak çekip direkt istek atılacak ocr
  var userId = null;
  var name = `unknown/${Date.now()}${Math.random().toString().split(".")[1]}`;

  // @ts-ignore
  if (!!c.user) {
    // @ts-ignore
    userId = c.user.data.user.user_metadata.username;
    name = `${userId}/${Date.now()}`;
  }

  const { data, error } = await c.supabase.storage
    .from("images")
    .upload(name, image)
    .then((data: any) => {
      return data;
    });

  const supabaseUrl =
    "https://ewbexihththlkcqybuoa.supabase.co/storage/v1/object/public/images/";
  const url = supabaseUrl + data.path;
  if (error) {
    return c.json({ error: error }, 400);
  }

  const ocrData = await ocr(url).then((data: any) => {
    return data.ParsedResults[0].ParsedText;
  });
  
  const { data: questionData, error: questionError } = await c.supabase
    .from("questions")
    .insert([
      {
        image: url.toString(),
        language: "ENG",
        ocr_text: ocrData.toString(),
        user: userId,
        private: false,
      },
    ])
    .select("*");

  if (questionError) {
    return c.json({ error: questionError }, 400);
  }

  return c.json({ question: questionData[0] });
});

export default image;
