import { Player } from './classes/Player.js';
import { Riddle } from './classes/Riddle.js';
import * as gameManager from './services/gameManager.js';
import * as playerManager from './services/playerManager.js';
import readline from 'readline-sync';


async function main() {
    await Riddle.initializeNextIdFromDb();
    console.log("Welcome to the Riddle game! ");
    const name = readline.question('What is your name? ');
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
                const level = readline.question('Choose difficulty: easy / medium / hard: ');
                console.log();
                let riddles = await gameManager.loadRiddlesByLevel(level);
                for (const riddle of riddles) {
                    await gameManager.timedAsk(riddle, player);
                }
                break;
            case '2':
                // Collect riddle data from user
                const name = readline.question('Enter riddle name: ');
                const taskDescription = readline.question('Enter riddle description: ');
                const correctAnswer = readline.question('Enter correct answer: ');
                const difficulty = readline.question('Enter difficulty (easy/medium/hard): ');
                const timeLimit = Number(readline.question('Enter time limit (seconds): '));
                const hint = readline.question('Enter a hint: ');
                let riddleData = { name, taskDescription, correctAnswer, difficulty, timeLimit, hint };
                if (readline.keyInYN('Is this a multiple choice riddle?')) {
                    let choices = [];
                    for (let i = 1; i <= 4; i++) {
                        choices.push(readline.question(`Enter choice ${i}: `));
                    }
                    riddleData.choices = choices;
                }
                try {
                    await gameManager.createRiddle(riddleData);
                    console.log("Riddle created successfully!");
                } catch (err) {
                    console.log(err.message);
                }
                break;
            case '3':
                try {
                    const riddles = await gameManager.readAllRiddles();
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
                    console.log(err.message);
                }
                break;
            case '4':
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
                    await gameManager.updateRiddle(id, field, value);
                    console.log("Riddle updated successfully!");
                } catch (err) {
                    console.log(err.message);
                }
                break;
            case '5':
                try {
                    const id = Number(readline.question('Enter the ID of the riddle to delete: '));
                    await gameManager.deleteRiddle(id);
                    console.log("Riddle deleted successfully!");
                } catch (err) {
                    console.log(err.message);
                }
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

main();