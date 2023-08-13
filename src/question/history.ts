import { Hono } from "hono";
import { createClient } from "@supabase/supabase-js";

type Bindings = {
  SUPABASE_URL: string;
  SUPABASE_KEY: string;
};

const history = new Hono<{ Bindings: Bindings }>();

history.get("myQuestions", async (c) => {
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_KEY);
  if (!c.user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const { data, error } = await supabase
    .from("questions")
    .select("*")
    .eq("user", c.user.data.user.user_metadata.username);

  if (error) {
    return c.json({ error: error }, 400);
  }
  return c.json({ questions: data });
});

history.get(":user", async (c) => {
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_KEY);
  const user = c.req.param("user");
  const { data, error } = await supabase
    .from("questions")
    .select("*")
    .eq("user", user)
    .eq("private", false);

  if (error) {
    return c.json({ error: error }, 400);
  }
  return c.json({ questions: data });
});

export default history;
