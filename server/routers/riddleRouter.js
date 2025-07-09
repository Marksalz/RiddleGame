import express from "express";
const riddleRouter = express.Router();

riddleRouter.post("/create_riddle", /* controller or handler */);
riddleRouter.get("/read_all_riddles", /* controller or handler */);
riddleRouter.put("/update_riddle", /* controller or handler */);
riddleRouter.delete("/delete_riddle", /* controller or handler */);

export default riddleRouter;