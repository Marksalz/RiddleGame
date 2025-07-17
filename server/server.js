import express from "express";
import router from "./router.js";
import "dotenv/config";
import { connectToMongo } from "./lib/riddles/riddleDb.js";
const PORT = process.env.PORT || 3000;

const server = express();


server.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

server.use(express.json());
server.use("/api", router);

try {
  await connectToMongo();
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
} catch (err) {
  console.error("Failed to connect to DB:", err);
  process.exit(1);
}


// server.listen(process.env.PORT, () => {
//   console.log(`Server running on port ${process.env.PORT}`);
// });