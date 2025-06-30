import allRiddles from '../riddles/exportRiddles.js';
import { Riddle } from '../classes/Riddle.js';
import { MultipleChoiceRiddle } from '../classes/MultipleChoiceRiddle.js';

/**
 * Loads riddles of a specific difficulty level.
 * @param {string|number} level - The difficulty level to filter riddles by.
 * @returns {Array<Riddle|MultipleChoiceRiddle>} Array of riddle instances matching the level.
 */
export function loadRiddles(level) {
    let riddles = [];
    allRiddles.forEach(riddle => {
        if ('choices' in riddle) {
            riddles.push(new MultipleChoiceRiddle(riddle.id, riddle.name, riddle.taskDescription, riddle.correctAnswer,
                riddle.difficulty, riddle.timeLimit, riddle.hint, riddle.choices));
        }
        else {
            riddles.push(new Riddle(riddle.id, riddle.name, riddle.taskDescription, riddle.correctAnswer,
                riddle.difficulty, riddle.timeLimit, riddle.hint));
        }
    });
    const filterdRiddles = riddles.filter(riddle => riddle.difficulty === level);
    return filterdRiddles;
}

/**
 * Returns a function that asks the riddle to the player and records the time taken, including penalties.
 * @param {Riddle|MultipleChoiceRiddle} riddle - The riddle to ask.
 * @param {Object} player - The player object with a recordTime method.
 * @returns {Function} Function that, when called, asks the riddle and records time.
 */
export function timedAsk(riddle, player) {
    let usedHint = false;
    return function () {
        const start = Date.now();
        if (riddle instanceof MultipleChoiceRiddle) {
            usedHint = riddle.askWithOptions();
        }
        else {
            usedHint = riddle.ask();
        }
        const end = Date.now();
        player.recordTime(start, end, calculatePenaltyTime(riddle, start, end, usedHint));
    }
}

/**
 * Calculates penalty time based on time taken and hint usage.
 * @param {Riddle|MultipleChoiceRiddle} riddle - The riddle being answered.
 * @param {number} start - Start timestamp (ms).
 * @param {number} end - End timestamp (ms).
 * @param {boolean} usedHint - Whether a hint was used.
 * @returns {number} The penalty time in seconds.
 */
export function calculatePenaltyTime(riddle, start, end, usedHint) {
    const actualTime = (end - start) / 1000;
    let penaltyTime = 0;
    if (actualTime > riddle.timeLimit) {
        penaltyTime += 5;
        console.log("Too slow! 5 seconds penalty applied.\n");
    }
    if (usedHint) {
        penaltyTime += 10;
        console.log("Penalty! 10 seconds added to recorded time!\n");
    }
    return penaltyTime;
}