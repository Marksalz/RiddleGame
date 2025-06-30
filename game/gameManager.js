import allRiddles from '../riddles/exportRiddles.js';
import { Riddle } from '../classes/Riddle.js';
import { MultipleChoiceRiddle } from '../classes/MultipleChoiceRiddle.js';

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