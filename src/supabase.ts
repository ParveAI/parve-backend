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
    return c.json({ error: error }, 400);
  }

  return c.json({
    jwt: data.session.access_token,
    user: {
      id: data.user.id,
      email: data.user.email,
      fullname: data.user.user_metadata.fullname,
      avatar: data.user.user_metadata.avatar,

    }
  });
});

login.post("/signup", async (c) => {
  const { email, password, fullname } = await c.req.json();
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_KEY);

  const key = email.split("@")[0]; // TODO: save it to bucket
  const url = `https://api.dicebear.com/6.x/bottts-neutral/svg?seed=${key}&backgroundColor=8e24aa,b6e3f4,c0aede,d81b60,ffd5dc&eyes=bulging,eva,frame1,frame2,happy,hearts,robocop,roundFrame01,roundFrame02,sensor,shade01&mouth=bite,diagram,grill03,smile01,square01,square02`;

  const { data, error } = await supabase.auth.signUp({
    email: email,
    password: password,
    options: {
      data: {
        confirmation_sent_at: Date.now(),
        avatar: url,
        fullname: fullname,
      },
    },
  });
  if (error) {
    return c.json({ error: error }, 400);
  }

  return c.json({
    token: data.session?.access_token,
    data: data,
    error: error,
  });
});

login.get("/twitter", async (c) => {
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_KEY);
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "twitter",
  });
  return c.json({ data: data, error: error });
});

export default login;
