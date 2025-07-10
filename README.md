# RiddleGame
A terminal-based Riddle Game built with JavaScript (ES Modules), Node.js, and Express.

## Tech Stack

- **JavaScript** (ESM syntax)
- **Node.js**
- **Express** (for REST API server)
- **readline-sync** (for terminal input)

---

## Project Overview

This project is split into two main parts:

- **Server** (`/server`):  
  Handles all data storage and retrieval for riddles and players via a REST API. Data is stored in simple `.txt` files as JSON arrays.
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
│   └── DAL/
│       ├── crud.js
│       ├── players/
│       │   └── playerDb.txt
│       └── riddles/
│           └── riddleDb.txt
├── utils/
│   └── README.md
├── package.json
├── package-lock.json
└── .gitignore
```

---

## How It Works

### Server

- Start the server with `npm run startServer`.
- The server exposes REST API endpoints for riddles and players (CRUD operations).
- Data is stored in `/server/DAL/players/playerDb.txt` and `/server/DAL/riddles/riddleDb.txt`.

### Client

- Start the game with `npm run startApp`.
- The client uses `fetch` to communicate with the server's API endpoints.
- All game logic, user prompts, and timing are handled in the terminal.
- Players can play riddles, create/update/delete riddles, and view the leaderboard.

---

## Example Workflow

1. **Start the server:**
   ```bash
   npm run startServer
   ```
2. **Start the client/game:**
   ```bash
   npm run startApp
   ```
3. **Play the game:**  
   - Enter your name.
   - Choose to play, create riddles, view riddles, update/delete riddles, or view the leaderboard.
   - All actions are sent to the server via HTTP requests.

---

## Notes

- All riddle and player data is persisted on the server.
- The client and server must both be running for the game to work.
- The project is modular: you can extend it with more features or swap out the storage layer.

---

## API Endpoints

- `POST /api/riddles/create_riddle`
- `GET /api/riddles/read_all_riddles`
- `PUT /api/riddles/update_riddle/:id`
- `DELETE /api/riddles/delete_riddle/:id`
- `POST /api/players/create_player`
- `PUT /api/players/update_time/:id`
- `GET /api/players/leaderboard`

---
