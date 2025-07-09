import express from "express";
import router from "./router";

const server = express();
server.use(express.json());
server.use("/api", router);

server.listen(4545, () => {
    console.log("Server running on port 4545");
});