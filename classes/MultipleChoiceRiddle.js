import { Riddle } from "./Riddle.js";
import readline from 'readline-sync';

export class MultipleChoiceRiddle extends Riddle {
    constructor(id, name, taskDescription, correctAnswer, difficulty, timeLimit, choices) {
        super(id, name, taskDescription, correctAnswer, difficulty, timeLimit);
        this.choices = choices;
    }

    askWithOptions() {
        this.printRiddleWithChoices();
        let flag = false;
        const correctIndex = this.findCorrectAnswerIndex();
        while (!flag) {
            const answer = readline.question('select your answer (1-4)! ');
            let isCorrect = false;
            if (Number(answer) === correctIndex) {
                isCorrect = true;
            }
            if (isCorrect) {
                console.log("Correct!!\n");
                flag = true;
            } else {
                console.log("Wrong answer, try again!\n");
            }
        }
    }

    printRiddleWithChoices() {
        console.log(`Riddle number: ${this.id}`);
        console.log(`Name: ${this.name}`);
        console.log(`Task description: ${this.taskDescription}`);
        console.log(`Time limit: ${this.timeLimit}\n`);
        this.choices.forEach((choice, index) => {
            console.log(`${index + 1}. ${choice}`);
        });
    }

    findCorrectAnswerIndex() {
        return this.choices.findIndex(choice => choice === this.correctAnswer) + 1;
    }
}