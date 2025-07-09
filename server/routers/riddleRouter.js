import express from "express";
import { riddleCtrl } from "../controllers/riddleController.js";
const riddleRouter = express.Router();

riddleRouter.post("/create_riddle", async (req, res) => {
    try {
        const riddle = req.body;
        await riddleCtrl.createRiddle(riddle);
        res.json({ message: "Riddle created successfully" });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

riddleRouter.get("/read_all_riddles", async (req, res) => {
    try {
        const riddles = await riddleCtrl.readAllRiddles();
        res.json(riddles);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

riddleRouter.put("/update_riddle/:id", async (req, res) => {
    try {
        const { field, value } = req.body;
        const id = Number(req.params.id);
        await riddleCtrl.updateRiddle(id, field, value);
        res.json({ message: "Riddle updated successfully" });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});


riddleRouter.delete("/delete_riddle/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);
        await riddleCtrl.deleteRiddle(id);
        res.json({ message: "Riddle deleted successfully" });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

export default riddleRouter;