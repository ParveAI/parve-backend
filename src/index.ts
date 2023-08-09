import { Hono } from "hono";
import { cors } from "hono/cors";
import { createClient } from "@supabase/supabase-js";
import user from "./supabase";
import image from "./image";
import profile from "./profile";

type Bindings = {
  SUPABASE_URL: string;
  SUPABASE_KEY: string;
};

const app = new Hono<{ Bindings: Bindings }>();

app.use("*", cors());

app.use("/*", async (c, next) => {
  const access_token = c.req.header("authorization");
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_KEY, {
    global: { headers: { Authorization: `${access_token}` } },
  });
  const user = await supabase.auth.getUser();

  if (user.error) {
    console.log("not logged in");
    return next();
  }
  // @ts-ignore
  c.user = user;
  console.log("logged in!!!");

  return next();
});

app.get("/", (c) => c.json({ parve: "Welcome to Parve AI" }));

app.route("/user", user);
app.route("/image", image);
app.route("/profile", profile);

export default app;
