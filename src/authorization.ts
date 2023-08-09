import { Hono } from "hono";
import { createClient } from "@supabase/supabase-js";

type Bindings = {
  SUPABASE_URL: string;
  SUPABASE_KEY: string;
};

const app = new Hono<{ Bindings: Bindings }>();

app.use("*", async (c, next) => {
  const access_token = c.req.header("authorization");
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_KEY, {
    global: { headers: { Authorization: `${access_token}` } },
  });
  const user = await supabase.auth.getUser();

  if (user.error) {
    return next();
  }
  // @ts-ignore
  c.user = user;

  return next();
});

app.get("/", async (c) => {
  // @ts-ignore
  return c.json({ girdi: "yeltaslrsfa", user: c.user });
});

export default app;
