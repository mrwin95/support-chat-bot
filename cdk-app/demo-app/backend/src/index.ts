import { Request, Response } from "express";

const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Hello from Demo Node.js Backend!" });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
