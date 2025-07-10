import express from "express";
import { riddleCtrl } from "../controllers/riddleController.js";
const riddleRouter = express.Router();

riddleRouter.post("/create_riddle", async (req, res) => {
    console.log("[POST] /riddles/create_riddle", req.body);
    try {
        const riddle = req.body;
        await riddleCtrl.createRiddle(riddle);
        console.log("Riddle created:", riddle);
        res.json({ message: "Riddle created successfully" });
    } catch (err) {
        console.error("Failed to create riddle:", err);
        res.status(400).json({ error: "Failed to create riddle.", details: err.message });
    }
});


riddleRouter.get("/read_all_riddles", async (req, res) => {
    console.log("[GET] /riddles/read_all_riddles");
    try {
        const riddles = await riddleCtrl.readAllRiddles();
        console.log("All riddles fetched:", riddles.length);
        res.json(riddles);
    } catch (err) {
        console.error("Failed to fetch riddles:", err);
        res.status(500).json({ error: "Failed to fetch riddles.", details: err.message });
    }
});


riddleRouter.get("/read_all_riddles/:difficulty", async (req, res) => {
    console.log(`[GET] /riddles/read_all_riddles/${req.params.difficulty}`);
    try {
        const { difficulty } = req.params;
        const riddles = await riddleCtrl.readAllRiddles(difficulty);
        console.log(`Riddles fetched for difficulty "${difficulty}":`, riddles.length);
        res.json(riddles);
    } catch (err) {
        console.error("Failed to fetch riddles by difficulty:", err);
        res.status(500).json({ error: "Failed to fetch riddles.", details: err.message });
    }
});

riddleRouter.put("/update_riddle/:id", async (req, res) => {
    console.log(`[PUT] /riddles/update_riddle/${req.params.id}`, req.body);
    try {
        const { field, value } = req.body;
        const id = Number(req.params.id);
        await riddleCtrl.updateRiddle(id, field, value);
        console.log(`Riddle ${id} updated: ${field} = ${value}`);
        res.json({ message: "Riddle updated successfully" });
    } catch (err) {
        console.error("Failed to update riddle:", err);
        res.status(400).json({ error: "Failed to update riddle.", details: err.message });
    }
});

riddleRouter.delete("/delete_riddle/:id", async (req, res) => {
    console.log(`[DELETE] /riddles/delete_riddle/${req.params.id}`);
    try {
        const id = Number(req.params.id);
        await riddleCtrl.deleteRiddle(id);
        console.log(`Riddle ${id} deleted`);
        res.json({ message: "Riddle deleted successfully" });
    } catch (err) {
        console.error("Failed to delete riddle:", err);
        res.status(400).json({ error: "Failed to delete riddle.", details: err.message });
    }
});

export default riddleRouter;