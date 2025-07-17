import express from "express";
import router from "./router.js";
import "dotenv/config";
export const PORT = 1234;
const server = express();


server.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

server.use(express.json());
server.use("/api", router);

server.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});