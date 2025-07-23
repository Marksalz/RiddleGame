# RiddleGame
A terminal-based Riddle Game built with JavaScript (ES Modules), Node.js, Express, MongoDB, and Supabase.

## Tech Stack

- **JavaScript** (ESM syntax)
- **Node.js**
- **Express** (for REST API server)
- **MongoDB** (for riddle storage)
- **Supabase** (for player data and scoring)
- **readline-sync** (for terminal input)
- **dotenv** (for environment variables)

---

## Project Overview

This project is split into two main parts:

- **Server** (`/server`):  
  Handles all data storage and retrieval for riddles and players via a REST API. Riddles are stored in MongoDB, while player data and scores are managed through Supabase.
- **Client** (`/client`):  
  A terminal-based game that interacts with the server using HTTP requests. All game logic, user interaction, and timing are handled here.

---

## Folder Structure

```
RiddleGame/
├── client/
│   ├── app.js
│   ├── classes/
│   │   ├── Riddle.js
│   │   ├── Player.js
│   │   └── MultipleChoiceRiddle.js
│   ├── managers/
│   │   ├── gameManager.js
│   │   └── playerManager.js
│   └── services/
│       ├── playerService.js
│       └── riddleService.js
├── server/
│   ├── server.js
│   ├── router.js
│   ├── controllers/
│   │   ├── playerController.js
│   │   └── riddleController.js
│   ├── routers/
│   │   ├── playerRouter.js
│   │   └── riddleRouter.js
│   ├── DAL/
│   │   ├── riddleCrud.js
│   │   ├── playerCrud.js
│   │   └── playerScoreCrud.js
│   └── lib/
│       ├── riddles/
│       │   ├── riddleDb.js
│       │   └── randomRiddles.json
│       └── players/
│           ├── playerDb.js
│           └── playerExampleData.txt
├── .env
├── .gitignore
├── package.json
└── README.md
```

---

## Environment Setup

Create a `.env` file in the project root with the following variables:

```env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
PUBLIC_PROJECT_URL=your_supabase_project_url
PUBLIC_ANON_API_KEY=your_supabase_anon_key
```

---

## How It Works

### Server

- Start the server with `npm run startServer`.
- The server exposes REST API endpoints for riddles and players (CRUD operations).
- Riddle data is stored in MongoDB (`riddle_game` database, `riddles` collection).
- Player data is stored in Supabase (`players` table).
- Player scores/progress is tracked in Supabase (`player_scores` table).

### Client

- Start the game with `npm run startApp`.
- The client uses `fetch` to communicate with the server's API endpoints.
- All game logic, user prompts, and timing are handled in the terminal.
- Players can play riddles, create/update/delete riddles, and view the leaderboard.

---

## Features

### Game Features
- **Multiple Riddle Types**: Regular riddles and multiple-choice riddles
- **Difficulty Levels**: Easy, Medium, Hard
- **Time Limits**: Each riddle has a configurable time limit
- **Hint System**: Players can request hints (with time penalty)
- **Penalty System**: 
  - 5 seconds penalty for exceeding time limit
  - 10 seconds penalty for using hints
- **Progress Tracking**: Only unsolved riddles are presented to players
- **Leaderboard**: Track players' best times

### Administrative Features
- **CRUD Operations**: Create, read, update, delete riddles
- **Initial Data Loading**: Load riddles from JSON file
- **Player Management**: Automatic player creation and time tracking

---

## Database Schema

### MongoDB (Riddles)
```javascript
{
  _id: ObjectId,
  name: String,
  taskDescription: String,
  correctAnswer: String,
  difficulty: String, // "easy", "medium", "hard"
  timeLimit: Number,
  hint: String,
  choices: Array // Optional, for multiple choice riddles
}
```

### Supabase (Players)
```sql
-- players table
{
  id: SERIAL PRIMARY KEY,
  username: TEXT,
  lowestTime: NUMERIC
}

-- player_scores table
{
  id: SERIAL PRIMARY KEY,
  player_id: INTEGER REFERENCES players(id),
  riddle_id: TEXT,
  time_to_solve: NUMERIC,
  created_at: TIMESTAMP
}
```

---

## Example Workflow

1. **Set up environment:**
   - Create `.env` file with database credentials
   - Ensure MongoDB and Supabase are accessible

2. **Start the server:**
   ```bash
   npm run startServer
   ```

3. **Load initial riddles (optional):**
   ```bash
   # Make a POST request to /api/riddles/load_initial_riddles
   # This loads riddles from randomRiddles.json
   ```

4. **Start the client/game:**
   ```bash
   npm run startApp
   ```

5. **Play the game:**  
   - Enter your name (creates player if doesn't exist)
   - Choose difficulty level
   - Solve riddles within time limits
   - Use hints if needed (with penalty)
   - Track your progress and compete on leaderboard

---

## API Endpoints

### Riddle Endpoints
- `POST /api/riddles/create_riddle` - Create a new riddle
- `GET /api/riddles/read_all_riddles` - Get all riddles
- `GET /api/riddles/read_all_riddles/:difficulty` - Get riddles by difficulty
- `PUT /api/riddles/update_riddle/:id` - Update a riddle
- `DELETE /api/riddles/delete_riddle/:id` - Delete a riddle
- `POST /api/riddles/load_initial_riddles` - Load riddles from JSON file

### Player Endpoints
- `POST /api/players/create_player` - Create or get existing player
- `PUT /api/players/update_time/:id` - Update player's best time
- `GET /api/players/leaderboard` - Get leaderboard (sorted by best time)
- `POST /api/players/record_solved_riddle` - Record a solved riddle
- `GET /api/players/unsolved_riddles/:player_id` - Get unsolved riddles for player
- `GET /api/players/unsolved_riddles/:player_id?difficulty=:level` - Get unsolved riddles by difficulty

---

## Installation & Setup

1. **Clone the repository**
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Set up environment variables** (see Environment Setup section)
4. **Start the server:**
   ```bash
   npm run startServer
   ```
5. **In a new terminal, start the client:**
   ```bash
   npm run startApp
   ```

---

## Notes

- The client and server must both be running for the game to work
- Player progress is automatically tracked - players only see unsolved riddles
- The project uses a hybrid database approach: MongoDB for riddles, Supabase for players
- All riddle and player data is persisted across sessions
- The project is modular and can be extended with additional features or swapped out
