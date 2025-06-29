import allRiddles from './riddles/exportRiddles.js';
import { Player } from './classes/Player.js';
import { Riddle } from './classes/Riddle.js';
import { MultipleChoiceRiddle } from './classes/MultipleChoiceRiddle.js'
import readline from 'readline-sync';


function loadRiddles() {
    let riddles = [];
    allRiddles.forEach(riddle => {
        if ('choices' in riddle) {
            riddles.push(new MultipleChoiceRiddle(riddle.id, riddle.name, riddle.taskDescription, riddle.correctAnswer, riddle.choices));
        }
        else {
            riddles.push(new Riddle(riddle.id, riddle.name, riddle.taskDescription, riddle.correctAnswer));
        }
    });
    return riddles;
}

function timedAsk(riddle, player) {
    return function () {
        const start = Date.now();
        if (riddle instanceof MultipleChoiceRiddle) {
            riddle.askWithOptions();
        }
        else {
            riddle.ask();
        }
        const end = Date.now();
        player.recordTime(start, end);
    }
}

function main() {
    console.log("Welcome to the Riddle game! ");
    const name = readline.question('What is your name? ');
    console.log();
    const player = new Player(name);
    let riddles = loadRiddles();
    riddles.forEach(riddle => {
        timedAsk(riddle, player)();
    });
    player.showStats();
}

main();

