import express from "express";

const app = express();
const port = 4000;

import questionsRouter from "./routers/questions.mjs";
import answersRouter from "./routers/answers.mjs";

app.use(express.json());

app.use("/questions", questionsRouter);
app.use("/answers", answersRouter);

app.get("/test", (req, res) => {
  return res.json("Server API is working 🚀");
});

app.listen(port, () => {
  console.log(`Server is running at ${port}`);
});
