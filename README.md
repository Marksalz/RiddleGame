# RiddleGame
A terminal-based Riddle Game built with JavaScript (ES Modules) and Object-Oriented Programming.

## Tech Stack

- **JavaScript** (ESM syntax)
- **Node.js**
- **readline-sync** for terminal input

---

## Project Goal

Build a fully synchronous terminal game that:

- Welcomes the player and asks for their name.
- Loads all riddles dynamically from external files in the [`riddles/`](riddles/exportRiddles.js) folder.
- Displays riddles one-by-one, waiting for the correct answer.
- Supports both open-ended and multiple-choice riddles.
- Measures how long the player takes to solve all riddles, applying penalties for exceeding time limits.
- Shows a final report with total and average solving time.

---

## Folder Structure

```
RiddleGame/
├── app.js                   # Main entry point
├── package.json
├── .gitignore
├── README.md
├── classes/                 # OOP class definitions
│   ├── Riddle.js
│   ├── Player.js
│   └── MultipleChoiceRiddle.js
├── riddles/                 # All riddle files (each riddle in a new file)
│   ├── r1.js
│   ├── r2.js
│   ├── r3.js
│   ├── r4.js
│   ├── r5.js
│   ├── r6.js
│   ├── r7.js
│   └── exportRiddles.js
```

---

## Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/Marksalz/RiddleGame.git
   cd RiddleGame
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the game:
   ```bash
   node app.js
   ```

---

## Riddle Format

Each file in the `riddles/` folder should export a riddle object like so:

```js
// riddles/r1.js
export default {
  id: 1,
  name: "Easy Math",
  taskDescription: "What is 5 + 3?",
  correctAnswer: "8",
  difficulty: "easy",
  timeLimit: 5,
  hint: "It's a single-digit number greater than 7."
};
```

For multiple-choice riddles, add a `choices` array:

```js
// riddles/r6.js
export default {
  id: 6,
  name: "Even Number",
  taskDescription: "Which of the following numbers is even?",
  correctAnswer: "8",
  choices: ["7", "8", "13", "21"],
  difficulty: "easy",
  timeLimit: 15,
  hint: "It's the only number divisible by 2."
};
```

---

## Classes

### `Riddle`
Represents a single riddle.

- **Properties:**
  - `id`
  - `name`
  - `taskDescription`
  - `correctAnswer`
  - `difficulty`
  - `timeLimit`
  - `hint`
- **Methods:**
  - `ask()` — prompts the user until the correct answer is given.

### `MultipleChoiceRiddle`
Extends `Riddle` for multiple-choice riddles.

- **Properties:**
  - All `Riddle` properties
  - `choices`
- **Methods:**
  - `askWithOptions()` — prompts the user to select from choices.

### `Player`
Tracks player info and timings.

- **Properties:**
  - `name`
  - `times` — array of time durations per riddle
- **Methods:**
  - `recordTime(start, end, penaltyTime)`
  - `showStats()` — displays total and average solving time

---

## Example Output

```
Welcome to the Riddle game!
What is your name? Sarah

Riddle number: 1
Name: Easy Math
Task description: What is 5 + 3?
Time limit: 5

What is your answer? (type "hint" to get a hint!) 8
Correct!!

...

Total time: 72 seconds
Average time per riddle: 36 seconds
```

---

## Notes

To take user input:
```js
import readline from 'readline-sync';

const name = readline.question('What is your name? ');
console.log(`Hello, ${name}!`);
```

---

## Game Flow

1. **Start the Game:**  
   Run `node app.js` in your terminal.

2. **Welcome & Name:**  
   The game welcomes you and asks for your name.

3. **Choose Difficulty:**  
   Select a difficulty level: `easy`, `medium`, or `hard`.

4. **Riddle Presentation:**  
   Each riddle is displayed one by one.  
   - For open-ended riddles, type your answer.
   - For multiple-choice riddles, select the correct option number.

5. **Hints:**  
   You can type `"hint"` at any prompt to receive a hint for the current riddle.

6. **Timing & Penalties:**  
   Your time to solve each riddle is measured.  
   If you exceed the riddle's time limit, a penalty is applied.

7. **Completion:**  
   After all riddles are answered, the game shows your total and average solving time.
