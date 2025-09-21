import { Request, Response } from "express";

const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

app.get("/api", (req: Request, res: Response) => {
  res.json({ message: "Hello from Demo Node.js Backend!" });
});

app.get("/api/message", (req: Request, res: Response) => {
  res.json({ message: "Hello from Demo Node.js Backend!" });
});

app.get("/api/health", (req: Request, res: Response) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
