import { Hono } from "hono";

type Bindings = {};

const image = new Hono<{ Bindings: Bindings }>();

image.post("toText", async (c) => {
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

export default image;
