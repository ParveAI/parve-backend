import { Hono } from "hono";
import { createClient } from "@supabase/supabase-js";

type Bindings = {
  SUPABASE_URL: string;
  SUPABASE_KEY: string;
};

const image = new Hono<{ Bindings: Bindings }>();

image.post("toText", async (c) => {
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_KEY);
  const image = await c.req.blob(); // TODO: text olarak çekip direkt istek atılacak ocr
  var name;

  if (!!c.user) {
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

  const ocrData = await ocr(url).then((data) => {
    // @ts-ignore
    return data.ParsedResults[0].ParsedText;
  });

  return c.json({ text: ocrData, imageUrl: url });
});

const ocrUrl = "https://api.ocr.space/parse/image";
const ocrKey = "helloworld";
const ocrLanguage = "eng";

const ocr = async (imgUrl: string) => {
  const formData = new FormData();
  formData.append("url", imgUrl);
  formData.append("apikey", ocrKey);
  formData.append("language", ocrLanguage);

  const response = await fetch(ocrUrl, {
    method: "POST",
    headers: {
      apikey: ocrKey,
    },
    body: formData,
  });

  const data = await response.json();
  return data;
};

/* image.post("toText", async (c) => {
  const image = await c.req.blob();
  const img = (await image.text()).toString();

  console.log(img);

  const ocrUrl = "https://api.ocr.space/parse/image";
  const ocrKey = "helloworld";
  const ocrLanguage = "eng";

  const formData = new FormData();
  formData.append("base64image", img);
  formData.append("apikey", ocrKey);
  formData.append("language", ocrLanguage);

  const response = await fetch(ocrUrl, {
    method: "POST",
    headers: {
      apikey: ocrKey,
    },
    body: formData,
  });

  const data = await response.json();
  return c.json(data);

  //   return c.newResponse(image, 200, { "Content-Type": "image/png" });
});
 */
export default image;
