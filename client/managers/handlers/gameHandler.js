import { Riddle } from '../classes/Riddle.js';
import { MultipleChoiceRiddle } from '../classes/MultipleChoiceRiddle.js';
import * as riddleService from '../services/riddleService.js';

export async function handlePlayGame(player) {
    let level;
    while (true) {
        level = readline.question('Choose difficulty: easy / medium / hard: ');
        if (["easy", "medium", "hard"].includes(level.toLowerCase().trim())) break;
        console.log("Invalid difficulty. Please enter easy, medium, or hard.");
    }
    console.log();
    let riddles = await loadRiddlesByLevel(level);
    for (const riddle of riddles) {
        let time = timedAsk(riddle, player);
        await playerManager.updatePlayerLowestTime(player.id, time);
        //await new Promise(res => setTimeout(res, 500));
    }
}

export async function handleCreateRiddle() {
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
    const result = await riddleService.createRiddle(riddleData);
    if (result.error) {
        console.log("Failed to create riddle: " + result.error);
        if (result.details) console.log("Details: " + result.details);
    } else {
        console.log("Riddle created successfully!");
    }
}

export async function handleReadAllRiddles() {
    const riddles = await riddleService.readAllRiddles();
    if (riddles.error) {
        console.log("Failed to read riddles: " + riddles.error);
        if (riddles.details) console.log("Details: " + riddles.details);
        return;
    }
    riddles.forEach(riddle => {
        console.log(`ID: ${riddle.id}, Name: ${riddle.name}, Difficulty: ${riddle.difficulty}`);
        console.log(`Description: ${riddle.taskDescription}`);
        if (riddle.choices) {
            console.log('Choices:', riddle.choices.join(', '));
        }
        console.log(`Answer: ${riddle.correctAnswer}, Hint: ${riddle.hint}, Time Limit: ${riddle.timeLimit}`);
        console.log('---');
    });
}

export async function handleUpdateRiddle() {
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

export async function handleDeleteRiddle() {
    try {
        const id = Number(readline.question('Enter the ID of the riddle to delete: '));
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

export async function loadRiddlesByLevel(level) {
    const allRiddles = await riddleService.readAllRiddles(level);
    if (allRiddles.error) {
        console.log(`Error loading riddles: ${allRiddles.error}`);
        if (allRiddles.details) console.log(`Details: ${allRiddles.details}`);
        return [];
    }
    const riddlesInClass = allRiddles.map(riddle => {
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
    return riddlesInClass;
}

export function timedAsk(riddle, player) {
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
    //await playerManager.updatePlayerLowestTime(player.id, time);
    return time;
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