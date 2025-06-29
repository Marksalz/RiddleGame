import allRiddles from './riddles/exportRiddles.js';
import { Player } from './classes/Player.js';
import { Riddle } from './classes/Riddle.js';
import { MultipleChoiceRiddle } from './classes/MultipleChoiceRiddle.js'
import readline from 'readline-sync';


function loadRiddles(level) {
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

function timedAsk(riddle, player) {
    const usedHint = false;
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

function calculatePenaltyTime(riddle, start, end, usedHint) {
    const actualTime = (end - start) / 1000;
    let penaltyTime = 0;
    if (actualTime > riddle.timeLimit) {
        penaltyTime += 5;
        console.log("Too slow! 5 seconds penalty applied.\n");
    }
    if (usedHint) {
        penaltyTime += 10;
    }
    return penaltyTime;
}

function main() {
    console.log("Welcome to the Riddle game! ");
    const name = readline.question('What is your name? ');
    console.log();
    const player = new Player(name);
    const level = readline.question('Choose difficulty: easy / medium / hard: ');
    console.log();
    let riddles = loadRiddles(level);
    riddles.forEach(riddle => {
        timedAsk(riddle, player)();
    });
    player.showStats();
}

main();

// 

