import { Hono } from "hono";
import { createClient } from "@supabase/supabase-js";

type Bindings = {
  SUPABASE_URL: string;
  SUPABASE_KEY: string;
};

const profile = new Hono<{ Bindings: Bindings }>();

profile.get("/me", async (c, next) => {
  if (!!!c.user) {
    return c.json({ error: "Not logged in" }, 400);
  }
  return c.json({ user: c.user });
});

profile.get("/user", async (c, next) => {
  const { id } = c.req.query();
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_KEY);

  const { data, error } = await supabase.auth.admin.getUserById(id);
  if (error) {
    return c.json({ error: error }, 400);
  }

  // @ts-ignore
  if (!!c.user && c.user.data.user.id === data.user.id) {
    // @ts-ignore
    data.myProfile = true;
  }

  return c.json({ user: data });
});

export default profile;
