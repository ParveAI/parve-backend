import { Hono } from "hono";
import { createClient } from "@supabase/supabase-js";

const history = new Hono<{ Bindings: Bindings }>();

history.get("myQuestions", async (c) => {
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_KEY);
  if (!c.user?.data.user) {
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

history.post("save", async (c) => {
  const { SUPABASE_URL, SUPABASE_KEY } = c.env;
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  const id = c.req.queries("id");

  const {
    collection,
    private: isPrivate,
    ai_response,
    ocr_text,
  } = await c.req.json();

  if (!c.user?.data.user || id) return c.json({ error: "Unauthorized" }, 401);

  const { data, error } = await supabase
    .from("questions")
    .update({
      collection,
      private: isPrivate,
      ai_response,

      ocr_text,
    })
    .eq("id", id)
    .eq("user", c.user.data.user.user_metadata.username)
    .select();

  return c.json({ data, error });
});

history.get(":user", async (c) => {
  const { SUPABASE_URL, SUPABASE_KEY } = c.env;
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  const user = c.req.param("user");

  const { data, error } = await supabase
    .from("questions")
    .select("*")
    .eq("user", user)
    .eq("private", false);

  if (error) return c.json({ error: error }, 400);

  return c.json({ questions: data });
});

export default history;
