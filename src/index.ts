import { Hono } from "hono";
import { cors } from "hono/cors";
import user from "./supabase";
import image from "./image";

const app = new Hono();
app.use("*", cors());

app.get("/", (c) => c.json({ parve: "Welcome to Parve AI" }));

app.route("/user", user);
app.route("/image", image);

export default app;
