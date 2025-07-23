/**
 * @fileoverview Router handling all riddle-related API endpoints.
 * Provides CRUD operations for riddles and initial data loading.
 * @author RiddleGame Team
 */

import express from "express";
import { riddleCtrl } from "../controllers/riddleController.js";
import fs from "fs/promises";
const riddleRouter = express.Router();

/**
 * POST /api/riddles/create_riddle
 * Creates a new riddle in the database
 * @route POST /api/riddles/create_riddle
 * @param {Object} req.body - Riddle object containing name, taskDescription, correctAnswer, difficulty, timeLimit, hint, and optional choices
 * @returns {Object} Success message or error details
 */
riddleRouter.post("/create_riddle", async (req, res) => {
    //console.log("[POST] /riddles/create_riddle", req.body);
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

/**
 * GET /api/riddles/read_all_riddles
 * Retrieves all riddles from the database
 * @route GET /api/riddles/read_all_riddles
 * @returns {Array} Array of all riddle objects
 */
riddleRouter.get("/read_all_riddles", async (req, res) => {
    //console.log("[GET] /riddles/read_all_riddles");
    try {
        const riddles = await riddleCtrl.readAllRiddles();
        console.log("All riddles fetched:", riddles.length);
        res.json(riddles);
    } catch (err) {
        console.error("Failed to fetch riddles:", err);
        res.status(500).json({ error: "Failed to fetch riddles.", details: err.message });
    }
});

/**
 * GET /api/riddles/read_all_riddles/:difficulty
 * Retrieves riddles filtered by difficulty level
 * @route GET /api/riddles/read_all_riddles/:difficulty
 * @param {string} req.params.difficulty - Difficulty level (easy, medium, hard)
 * @returns {Array} Array of riddles matching the difficulty
 */
riddleRouter.get("/read_all_riddles/:difficulty", async (req, res) => {
    //console.log(`[GET] /riddles/read_all_riddles/${req.params.difficulty}`);
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

/**
 * PUT /api/riddles/update_riddle/:id
 * Updates a specific field of a riddle
 * @route PUT /api/riddles/update_riddle/:id
 * @param {string} req.params.id - MongoDB ObjectId of the riddle
 * @param {Object} req.body - Object containing field and value to update
 * @param {string} req.body.field - Field name to update
 * @param {*} req.body.value - New value for the field
 * @returns {Object} Success message or error details
 */
riddleRouter.put("/update_riddle/:id", async (req, res) => {
    //console.log(`[PUT] /riddles/update_riddle/${req.params.id}`, req.body);
    try {
        const { field, value } = req.body;
        const id = req.params.id;
        await riddleCtrl.updateRiddle(id, field, value);
        console.log(`Riddle ${id} updated: ${field} = ${value}`);
        res.json({ message: "Riddle updated successfully" });
    } catch (err) {
        console.error("Failed to update riddle:", err);
        res.status(400).json({ error: "Failed to update riddle.", details: err.message });
    }
});

/**
 * DELETE /api/riddles/delete_riddle/:id
 * Deletes a riddle from the database
 * @route DELETE /api/riddles/delete_riddle/:id
 * @param {string} req.params.id - MongoDB ObjectId of the riddle to delete
 * @returns {Object} Success message or error details
 */
riddleRouter.delete("/delete_riddle/:id", async (req, res) => {
    //console.log(`[DELETE] /riddles/delete_riddle/${req.params.id}`);
    try {
        await riddleCtrl.deleteRiddle(req.params.id);
        console.log(`Riddle ${req.params.id} deleted`);
        res.json({ message: "Riddle deleted successfully" });
    } catch (err) {
        console.error("Failed to delete riddle:", err);
        res.status(400).json({ error: "Failed to delete riddle.", details: err.message });
    }
});

/**
 * POST /api/riddles/load_initial_riddles
 * Loads initial riddles from JSON file into the database
 * Used for seeding the database with sample riddles
 * @route POST /api/riddles/load_initial_riddles
 * @returns {Object} Success message with count of loaded riddles or error details
 */
riddleRouter.post("/load_initial_riddles", async (req, res) => {
    try {
        // Path to the JSON file containing initial riddles
        const riddlesPath = "C:\\JSProjects\\RiddleGame\\server\\lib\\riddles\\randomRiddles.json";
        const data = await fs.readFile(riddlesPath, "utf-8");
        const riddles = JSON.parse(data);

        for (const riddle of riddles) {
            await riddleCtrl.createRiddle(riddle);
        }

        res.json({ message: "Initial riddles loaded successfully", count: riddles.length });
    } catch (err) {
        console.error("Failed to load initial riddles:", err);
        res.status(500).json({ error: "Failed to load initial riddles.", details: err.message });
    }
});

export default riddleRouter;