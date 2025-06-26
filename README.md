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
- Loads all riddles dynamically from external files.
- Displays riddles one-by-one, waiting for the correct answer.
- Measures how long the player takes to solve all riddles.
- Shows a final report with total and average solving time.

---

## Folder Structure

```
riddle-game/
├── app.js               # Main entry point
├── riddles/             # All riddle files (e.g. r1.js, r2.js, ...)
├── classes/             # OOP class definitions
│   ├── Riddle.js
│   ├── Player.js
```

---

## Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/your-username/riddle-game.git
   cd riddle-game
   ```

2. Install dependencies:
   ```bash
   npm install readline-sync
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
  correctAnswer: "8"
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
- **Methods:**
  - `ask()` — prompts the user until the correct answer is given.

### `Player`
Tracks player info and timings.

- **Properties:**
  - `name`
  - `times` — array of time durations per riddle
- **Methods:**
  - `recordTime(start, end)`
  - `showStats()` — displays total and average solving time

---

## Example Output

```
Welcome to the Riddle Game!
What is your name? Sarah

Riddle 1: Easy Math
What is 5 + 3? → 8
Correct!

Riddle 2: Mystery
I speak without a mouth. What am I? → echo
Correct!

Great job, Sarah!
Total time: 72 seconds
Average per riddle: 36 seconds
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

## 📄 License

MIT License
