/**
 * @fileoverview Game management layer handling core game functionality and user interactions.
 * Manages riddle gameplay, creation, editing, and administrative functions.
 * Provides console-based interface for all game operations with input validation.
 * @author RiddleGame Team
 */

import readline from 'readline-sync';
import { Riddle } from '../classes/Riddle.js';
import { MultipleChoiceRiddle } from '../classes/MultipleChoiceRiddle.js';
import * as riddleService from '../services/riddleService.js';
import * as playerManager from './playerManager.js'
import * as playerService from '../services/playerService.js';
import riddleDb from '../../server/lib/riddles/riddleDb.js';

/**
 * Prompts user for input until a valid value is provided
 * @param {string} promptText - Text to display to user
 * @param {Function} validateFn - Function to validate input, returns boolean
 * @param {string} errorMsg - Error message to show for invalid input
 * @returns {string} Valid user input
 * @private
 */
function promptUntilValid(promptText, validateFn, errorMsg) {
    let value;
    while (true) {
        value = readline.question(promptText);
        if (validateFn(value)) break;
        if (errorMsg) console.log(errorMsg);
    }
    return value;
}

/**
 * Handles the main game playing experience for a player
 * @param {Player} player - Authenticated player instance
 * @description
 * Game flow:
 * 1. Player selects difficulty level
 * 2. Loads unsolved riddles for that difficulty
 * 3. Player solves riddles one by one with timing
 * 4. Records completion times and updates player stats
 */
export async function handlePlayGame(player) {
    // Get difficulty selection with validation
    const level = promptUntilValid(
        'Choose difficulty: easy / medium / hard: ',
        v => ["easy", "medium", "hard"].includes(v.toLowerCase().trim()),
        "Invalid difficulty. Please enter easy, medium, or hard."
    );
    console.log();

    // Load unsolved riddles for the selected difficulty
    let riddles = await loadUnsolvedRiddlesByLevel(player.id, level);
    if (riddles.length === 0) {
        console.log("No unsolved riddles left for this difficulty!");
        return;
    }

    // Process each riddle with timing and scoring
    for (const riddle of riddles) {
        let times = timedAsk(riddle, player);
        await playerManager.updatePlayerLowestTime(player.id, times.updatedTime);
        await playerService.recordSolvedRiddle(player.id, riddle.id, times.finalTime);
    }
}

/**
 * Handles riddle creation workflow with comprehensive input validation
 * @description
 * Creation process:
 * 1. Collects basic riddle information (name, description, answer, etc.)
 * 2. Validates all inputs according to business rules
 * 3. Optionally handles multiple choice setup
 * 4. Submits riddle to server for storage
 */
export async function handleCreateRiddle() {
    // Collect and validate basic riddle information
    const riddleName = promptUntilValid(
        'Enter riddle name: ',
        v => v && v.trim().length > 0,
        "Riddle name cannot be empty."
    );
    const taskDescription = promptUntilValid(
        'Enter riddle description: ',
        v => v && v.trim().length > 0,
        "Description cannot be empty."
    );
    const correctAnswer = promptUntilValid(
        'Enter correct answer: ',
        v => v && v.trim().length > 0,
        "Answer cannot be empty."
    );
    const difficulty = promptUntilValid(
        'Enter difficulty (easy/medium/hard): ',
        v => ["easy", "medium", "hard"].includes(v.toLowerCase().trim()),
        "Invalid difficulty. Please enter easy, medium, or hard."
    );
    const timeLimit = Number(promptUntilValid(
        'Enter time limit (seconds): ',
        v => !isNaN(Number(v)) && Number(v) > 0,
        "Time limit must be a positive number."
    ));
    const hint = promptUntilValid(
        'Enter a hint: ',
        v => v && v.trim().length > 0,
        "Hint cannot be empty."
    );
    let riddleData = { name: riddleName, taskDescription, correctAnswer, difficulty, timeLimit, hint };

    // Handle multiple choice option
    if (readline.keyInYN('Is this a multiple choice riddle?')) {
        let choices = [];
        for (let i = 1; i <= 4; i++) {
            const choiceText = promptUntilValid(
                `Enter choice ${i}: `,
                v => v && v.trim().length > 0,
                "Choice cannot be empty."
            );
            choices.push(choiceText);
        }
        riddleData.choices = choices;
    }

    // Submit riddle data to service for creation
    const result = await riddleService.createRiddle(riddleData);
    if (result.error) {
        console.log("Failed to create riddle: " + result.error);
        if (result.details) console.log("Details: " + result.details);
    } else {
        console.log("Riddle created successfully!");
    }
}

/**
 * Displays all riddles in the database with formatting
 * @description Shows comprehensive riddle information including metadata
 */
export async function handleReadAllRiddles() {
    const riddles = await riddleService.readAllRiddles();
    if (riddles.error) {
        console.log("Failed to read riddles: " + riddles.error);
        if (riddles.details) console.log("Details: " + riddles.details);
        return;
    }
    riddles.forEach((riddle, idx) => {
        console.log(`Riddle #${idx + 1}`);
        console.log(`Name: ${riddle.name}, Difficulty: ${riddle.difficulty}`);
        console.log(`Description: ${riddle.taskDescription}`);
        if (riddle.choices) {
            console.log('Choices:', riddle.choices.join(', '));
        }
        console.log(`Answer: ${riddle.correctAnswer}, Hint: ${riddle.hint}, Time Limit: ${riddle.timeLimit}`);
        console.log('---');
    });
}

/**
 * Handles riddle update workflow for administrators
 * @description
 * Update process:
 * 1. Prompts for riddle ID to update
 * 2. Selects field to modify
 * 3. Handles special cases (choices array, numeric fields)
 * 4. Submits update to server
 */
export async function handleUpdateRiddle() {
    try {
        const id = readline.question('Enter the ID of the riddle to update: ');
        const field = readline.question('Which field do you want to update? (name, taskDescription, correctAnswer, difficulty, timeLimit, hint, choices):');

        let value;
        // Handle special field types
        if (field === 'choices') {
            // Multiple choice array input
            value = [];
            for (let i = 1; i <= 4; i++) {
                value.push(readline.question(`Enter choice ${i}: `));
            }
        } else if (field === 'timeLimit') {
            // Numeric field validation
            value = Number(readline.question('Enter new time limit (seconds): '));
        } else {
            // Standard text field
            value = readline.question(`Enter new value for ${field}: `);
        }
        const result = await riddleService.updateRiddle(id, field, value);
        if (result.error) {
            console.log("Failed to update riddle: " + result.error);
            if (result.details) console.log("Details: " + result.details);
        } else {
            console.log("Riddle updated successfully!");
        }
    } catch (err) {
        console.log("Failed to update riddle: " + err.message);
    }
}

/**
 * Handles riddle deletion workflow for administrators
 * @description Simple ID-based deletion with confirmation
 */
export async function handleDeleteRiddle() {
    try {
        const id = readline.question('Enter the ID of the riddle to delete: ');
        const result = await riddleService.deleteRiddle(id);
        if (result.error) {
            console.log("Failed to delete riddle: " + result.error);
            if (result.details) console.log("Details: " + result.details);
        } else {
            console.log("Riddle deleted successfully!");
        }
    } catch (err) {
        console.log("Failed to delete riddle: " + err.message);
    }
}

/**
 * Loads riddles that a player hasn't solved yet for a specific difficulty
 * @param {number} player_id - Player's database ID
 * @param {string} level - Difficulty level (easy, medium, hard)
 * @returns {Promise<Array<Riddle|MultipleChoiceRiddle>>} Array of riddle instances
 * @description
 * Process:
 * 1. Fetches unsolved riddles from server
 * 2. Converts raw data to appropriate riddle class instances
 * 3. Handles both regular and multiple choice riddles
 */
export async function loadUnsolvedRiddlesByLevel(player_id, level) {
    const allRiddles = await playerService.getUnsolvedRiddles(player_id, level);

    if (allRiddles.error) {
        console.log(`Error loading riddles: ${allRiddles.error}`);
        if (allRiddles.details) console.log(`Details: ${allRiddles.details}`);
        return [];
    }

    // Convert raw riddle data to appropriate class instances
    const riddlesInClass = allRiddles.map(riddle => {
        if ('choices' in riddle) {
            return new MultipleChoiceRiddle(
                riddle._id, riddle.name, riddle.taskDescription, riddle.correctAnswer,
                riddle.difficulty, riddle.timeLimit, riddle.hint, riddle.choices
            );
        } else {
            return new Riddle(
                riddle._id, riddle.name, riddle.taskDescription, riddle.correctAnswer,
                riddle.difficulty, riddle.timeLimit, riddle.hint
            );
        }
    });

    return riddlesInClass;
}

/**
 * Executes timed riddle-solving with penalty calculations
 * @param {Riddle|MultipleChoiceRiddle} riddle - Riddle instance to solve
 * @param {Player} player - Player solving the riddle
 * @returns {Object} Object containing finalTime and updatedTime
 * @description
 * Timing process:
 * 1. Records start time before riddle presentation
 * 2. Handles riddle interaction (regular or multiple choice)
 * 3. Calculates penalties for hints and time overruns
 * 4. Updates player's best time if improved
 */
export function timedAsk(riddle, player) {
    let usedHint = false;
    const start = Date.now();

    // Handle riddle based on type
    if (riddle instanceof MultipleChoiceRiddle) {
        usedHint = riddle.askWithOptions();
    }
    else {
        usedHint = riddle.ask();
    }

    const end = Date.now();
    // Calculate final time including penalties
    const finalTime = ((end - start) / 1000) + calculatePenaltyTime(riddle, start, end, usedHint);
    const updatedTime = player.recordTime(finalTime);

    return { finalTime, updatedTime };
}

/**
 * Calculates penalty time based on game rules
 * @param {Riddle} riddle - Riddle that was solved
 * @param {number} start - Start timestamp in milliseconds
 * @param {number} end - End timestamp in milliseconds
 * @param {boolean} usedHint - Whether player used the hint
 * @returns {number} Total penalty time in seconds
 * @description
 * Penalty rules:
 * - 5 seconds for exceeding time limit
 * - 10 seconds for using hint
 */
export function calculatePenaltyTime(riddle, start, end, usedHint) {
    const actualTime = (end - start) / 1000;
    let penaltyTime = 0;

    // Time limit penalty
    if (actualTime > riddle.timeLimit) {
        penaltyTime += 5;
        console.log("Too slow! 5 seconds penalty applied.\n");
    }

    // Hint usage penalty
    if (usedHint) {
        penaltyTime += 10;
        console.log("Penalty! 10 seconds added to recorded time!\n");
    }

    return penaltyTime;
}