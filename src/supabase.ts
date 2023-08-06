import { createClient } from "@supabase/supabase-js";
import { Hono } from "hono";

// const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY)

type Bindings = {
  SUPABASE_URL: string;
  SUPABASE_KEY: string;
};

const login = new Hono<{ Bindings: Bindings }>();

login.post("/login", async (c) => {
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_KEY);
  const { email, password } = await c.req.json();
  if (!email || !password) {
    return c.json({ error: "Email and password required" });
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password,
  });

  if (error) {
    return c.json({ error: error });
  }

  return c.json({
    jwt: data.session.access_token,
    userId: data.user.id,
    data: data,
  });
});

login.post("/signup", async (c) => {
  const { email, password } = await c.req.json();
  if (!email || !password) {
    return c.json({ error: "Email and password required" });
  }

  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_KEY);

  const { data, error } = await supabase.auth.signUp({
    email: email,
    password: password,
  });

  return c.json({ data: data, error: error });
});

export default login;
