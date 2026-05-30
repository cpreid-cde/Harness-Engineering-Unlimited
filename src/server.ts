import { createApp } from "./routes/app";

const port = Number(process.env.PORT ?? 4317);
const app = createApp();

app.listen(port, "127.0.0.1", () => {
  console.log(`agentic-supportdesk API listening on http://127.0.0.1:${port}`);
});
