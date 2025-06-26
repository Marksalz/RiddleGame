
class Riddle {
    constructor(id, name, taskDescription, correctAnswer) {
        this.id = id;
        this.name = name;
        this.taskDescription = taskDescription;
        this.correctAnswer = correctAnswer;
    }

    ask() {
        this.printRiddle();
        
    }

    printRiddle() {
        console.log(`Riddle number: ${this.id}`);
        console.log(`Name: ${this.name}`);
        console.log(`Task description: ${this.taskDescription}`);
    }
}