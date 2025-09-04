/**
 * @fileoverview Controller layer for riddle operations.
 * Handles business logic, validation, and data processing for riddles.
 * @author RiddleGame Team
 */

import * as crud from "../DAL/riddleCrud.js";

/**
 * Creates a new riddle after validation
 * @param {Object} riddle - Riddle object to create
 * @param {string} riddle.name - Name/title of the riddle
 * @param {string} riddle.taskDescription - The riddle question/task
 * @param {string} riddle.correctAnswer - Correct answer to the riddle
 * @param {string} riddle.difficulty - Difficulty level (easy, medium, hard)
 * @param {number} riddle.timeLimit - Time limit in seconds
 * @param {string} riddle.hint - Hint for the riddle
 * @param {Array} [riddle.choices] - Optional multiple choice options
 * @throws {Error} If validation fails or database operation fails
 */
export async function createRiddle(riddle) {
  try {
    validateRiddle(riddle);
    await crud.createRiddle(riddle);
  } catch (err) {
    throw new Error("Could not create riddle: " + err.message);
  }
}

/**
 * Retrieves riddles from database, optionally filtered by difficulty
 * @param {string} [difficulty] - Optional difficulty filter (easy, medium, hard)
 * @returns {Array} Array of riddle objects
 * @throws {Error} If database operation fails
 */
export async function readAllRiddles(difficulty) {
  try {
    let riddles = null;
    if (difficulty) {
      riddles = await crud.getRiddlesByDifficulty(difficulty);
    } else {
      riddles = await crud.getRiddles();
    }
    return riddles;
  } catch (err) {
    throw new Error("Could not read riddles: " + err.message);
  }
}

/**
 * Updates a riddle with new data
 * @param {string} id - MongoDB ObjectId of the riddle
 * @param {Object} updatedRiddle - Object containing all updated riddle fields
 * @throws {Error} If update operation fails
 */
export async function updateRiddle(id, updatedRiddle) {
  try {
    validateRiddle(updatedRiddle);
    await crud.updateRiddle(id, updatedRiddle);
  } catch (err) {
    throw new Error("Could not update riddle: " + err.message);
  }
}

/**
 * Deletes a riddle from the database
 * @param {string} id - MongoDB ObjectId of the riddle to delete
 * @throws {Error} If delete operation fails
 */
export async function deleteRiddle(id) {
  try {
    await crud.deleteRiddle(id);
  } catch (err) {
    throw new Error("Could not delete riddle: " + err.message);
  }
}

/**
 * Validates riddle object structure and data types
 * @param {Object} riddle - Riddle object to validate
 * @throws {Error} If any validation rules fail
 * @private
 */
function validateRiddle(riddle) {
  // Check required fields
  if (
    !riddle.name ||
    !riddle.taskDescription ||
    !riddle.correctAnswer ||
    !riddle.difficulty ||
    !riddle.timeLimit ||
    !riddle.hint
  ) {
    throw new Error("Missing required riddle fields.");
  }

  // Validate time limit
  if (typeof riddle.timeLimit !== "number" || riddle.timeLimit <= 0) {
    throw new Error("Invalid time limit.");
  }

  // Validate difficulty level
  if (
    !["easy", "medium", "hard"].includes(riddle.difficulty.toLowerCase().trim())
  ) {
    throw new Error("Invalid difficulty.");
  }

  // Validate multiple choice options if present
  if (
    riddle.choices &&
    (!Array.isArray(riddle.choices) || riddle.choices.length < 2)
  ) {
    throw new Error("Multiple choice riddles must have at least 2 choices.");
  }
}

export const riddleCtrl = {
  createRiddle,
  readAllRiddles,
  updateRiddle,
  deleteRiddle,
};
