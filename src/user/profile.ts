import { Hono } from "hono";
import { createClient } from "@supabase/supabase-js";

type Bindings = {
  SUPABASE_URL: string;
  SUPABASE_KEY: string;
};

const profile = new Hono<{ Bindings: Bindings }>();

profile.get("/me", async (c, next) => {
  // @ts-ignore
  if (!!!c.user) {
    return c.json({ error: "Not logged in" }, 400);
  }
  // @ts-ignore
  return c.json({ user: c.user });
});

profile.get("/:user", async (c, next) => {
  const username = c.req.param("user");
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_KEY);

  const { data, error } = await supabase
    .from("profile")
    .select("*")
    .eq("user_name", username)
    .single();

  if (!!error) {
    return c.json({ error: error.message }, 400);
  }

  data.myProfile = false;


  // @ts-ignore
  if (!!c.user && c.user.data.user.user_metadata.username === data.user_name) {

    data.myProfile = true;
  }

  return c.json({ user: data });
});

export default profile;
