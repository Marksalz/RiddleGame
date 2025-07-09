import { Riddle } from '../classes/Riddle.js';
import { MultipleChoiceRiddle } from '../classes/MultipleChoiceRiddle.js';
import * as riddleService from '../api/riddleService.js';
import { updatePlayerLowestTime } from './playerManager.js';
import readline from 'readline-sync';

export async function loadRiddlesByLevel(level) {
    const allRiddles = await readAllRiddlesService();
    const riddles = allRiddles.map(riddle => {
        if ('choices' in riddle) {
            return new MultipleChoiceRiddle(
                riddle.name, riddle.taskDescription, riddle.correctAnswer,
                riddle.difficulty, riddle.timeLimit, riddle.hint, riddle.choices, riddle.id
            );
        } else {
            return new Riddle(
                riddle.name, riddle.taskDescription, riddle.correctAnswer,
                riddle.difficulty, riddle.timeLimit, riddle.hint, riddle.id
            );
        }
    });
    return riddles.filter(riddle =>
        riddle.difficulty &&
        riddle.difficulty.toLowerCase().trim() === level.toLowerCase().trim()
    );
}

export async function timedAsk(riddle, player) {
    let usedHint = false;
    const start = Date.now();
    if (riddle instanceof MultipleChoiceRiddle) {
        usedHint = riddle.askWithOptions();
    }
    else {
        usedHint = riddle.ask();
    }
    const end = Date.now();
    const time = player.recordTime(start, end, calculatePenaltyTime(riddle, start, end, usedHint));
    await updatePlayerLowestTime(player.id, time);
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

export async function runGame() {
    console.log("Welcome to the Riddle game! ");
    let name;
    while (true) {
        name = readline.question('What is your name? ');
        if (name && name.trim().length > 0) break;
        console.log("Name cannot be empty. Please enter your name.");
    }
    console.log();

    let exit = false;
    const player = await playerManager.welcomePlayer(name);

    while (!exit) {
        console.log("What do you want to do?");
        console.log("1. Play the game");
        console.log("2. Create a new riddle");
        console.log("3. Read all riddles");
        console.log("4. Update an existing riddle");
        console.log("5. Delete a riddle");
        console.log("6. View leaderboard");
        console.log("0. Exit");
        const choice = readline.question('Enter your choice: ');
        console.log();

        switch (choice) {
            case '1':
                await handlePlayGame(player);
                break;
            case '2':
                await handleCreateRiddle();
                break;
            case '3':
                await handleReadAllRiddles();
                break;
            case '4':
                await handleUpdateRiddle();
                break;
            case '5':
                await handleDeleteRiddle();
                break;
            case '6':
                await playerManager.viewLeaderboard();
                break;
            case '0':
                exit = true;
                console.log("Goodbye!");
                break;
            default:
                console.log("Invalid choice. Please try again.");
        }
        console.log();
    }
}

async function handlePlayGame(player) {
    let level;
    while (true) {
        level = readline.question('Choose difficulty: easy / medium / hard: ');
        if (["easy", "medium", "hard"].includes(level.toLowerCase().trim())) break;
        console.log("Invalid difficulty. Please enter easy, medium, or hard.");
    }
    console.log();
    let riddles = await loadRiddlesByLevel(level);
    for (const riddle of riddles) {
        await timedAsk(riddle, player);
    }
}

async function handleCreateRiddle() {
    let riddleName;
    while (true) {
        riddleName = readline.question('Enter riddle name: ');
        if (riddleName && riddleName.trim().length > 0) break;
        console.log("Riddle name cannot be empty.");
    }
    let taskDescription;
    while (true) {
        taskDescription = readline.question('Enter riddle description: ');
        if (taskDescription && taskDescription.trim().length > 0) break;
        console.log("Description cannot be empty.");
    }
    let correctAnswer;
    while (true) {
        correctAnswer = readline.question('Enter correct answer: ');
        if (correctAnswer && correctAnswer.trim().length > 0) break;
        console.log("Answer cannot be empty.");
    }
    let difficulty;
    while (true) {
        difficulty = readline.question('Enter difficulty (easy/medium/hard): ');
        if (["easy", "medium", "hard"].includes(difficulty.toLowerCase().trim())) break;
        console.log("Invalid difficulty. Please enter easy, medium, or hard.");
    }
    let timeLimit;
    while (true) {
        timeLimit = Number(readline.question('Enter time limit (seconds): '));
        if (!isNaN(timeLimit) && timeLimit > 0) break;
        console.log("Time limit must be a positive number.");
    }
    let hint;
    while (true) {
        hint = readline.question('Enter a hint: ');
        if (hint && hint.trim().length > 0) break;
        console.log("Hint cannot be empty.");
    }
    let riddleData = { name: riddleName, taskDescription, correctAnswer, difficulty, timeLimit, hint };
    if (readline.keyInYN('Is this a multiple choice riddle?')) {
        let choices = [];
        for (let i = 1; i <= 4; i++) {
            let choiceText;
            while (true) {
                choiceText = readline.question(`Enter choice ${i}: `);
                if (choiceText && choiceText.trim().length > 0) break;
                console.log("Choice cannot be empty.");
            }
            choices.push(choiceText);
        }
        riddleData.choices = choices;
    }
    try {
        await riddleService.createRiddle(riddleData);
        console.log("Riddle created successfully!");
    } catch (err) {
        console.log("Failed to create riddle: " + err.message);
    }
}

async function handleReadAllRiddles() {
    try {
        const riddles = await riddleService.readAllRiddles();
        riddles.forEach(riddle => {
            console.log(`ID: ${riddle.id}, Name: ${riddle.name}, Difficulty: ${riddle.difficulty}`);
            console.log(`Description: ${riddle.taskDescription}`);
            if (riddle.choices) {
                console.log('Choices:', riddle.choices.join(', '));
            }
            console.log(`Answer: ${riddle.correctAnswer}, Hint: ${riddle.hint}, Time Limit: ${riddle.timeLimit}`);
            console.log('---');
        });
    } catch (err) {
        console.log("Failed to read riddles: " + err.message);
    }
}

async function handleUpdateRiddle() {
    try {
        const id = Number(readline.question('Enter the ID of the riddle to update: '));
        const field = readline.question('Which field do you want to update? (name, taskDescription, correctAnswer, difficulty, timeLimit, hint, choices):');
        let value;
        if (field === 'choices') {
            value = [];
            for (let i = 1; i <= 4; i++) {
                value.push(readline.question(`Enter choice ${i}: `));
            }
        } else if (field === 'timeLimit') {
            value = Number(readline.question('Enter new time limit (seconds): '));
        } else {
            value = readline.question(`Enter new value for ${field}: `);
        }
        await riddleService.updateRiddle(id, field, value);
        console.log("Riddle updated successfully!");
    } catch (err) {
        console.log("Failed to update riddle: " + err.message);
    }
}

async function handleDeleteRiddle() {
    try {
        const id = Number(readline.question('Enter the ID of the riddle to delete: '));
        await riddleService.deleteRiddle(id);
        console.log("Riddle deleted successfully!");
    } catch (err) {
        console.log("Failed to delete riddle: " + err.message);
    }
}