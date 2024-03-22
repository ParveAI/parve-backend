import { Hono } from "hono";
import { cors } from "hono/cors";
import { createClient, UserResponse } from "@supabase/supabase-js";
import user from "./user/supabase";
import image from "./question/image";
import profile from "./user/profile";
import history from "./question/history";
import upload from "./question/upload";

type Bindings = {
  SUPABASE_URL: string;
  SUPABASE_KEY: string;
};

const app = new Hono<{ Bindings: Bindings }>();

app.use("*", cors());
declare module "hono" {
  interface Context {
    user?: UserResponse;
  }
}

app.use("/*", async (c, next) => {
  const access_token = c.req.header("authorization");
  const { SUPABASE_URL, SUPABASE_KEY } = c.env;

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    global: { headers: { Authorization: `${access_token}` } },
  });
  const user = await supabase.auth.getUser();

  if (user.error) return next();

  c.user = user;
  return next();
});

app.get("/", (c) => c.json({ parve: "Welcome to Parve AI" }));

app.route("/user", user);
app.route("/image", image);
app.route("/profile", profile);
app.route("/history", history);
app.route("/upload", upload);

export default app;
