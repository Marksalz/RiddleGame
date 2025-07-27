# RiddleGame 🧩

A terminal-based riddle game built with modern JavaScript, featuring a REST API backend and interactive CLI frontend.

## 🚀 Quick Start

1. **Clone and install:**
   ```bash
   git clone <repository-url>
   cd RiddleGame
   npm install
   ```

2. **Set up environment variables** (see [Environment Setup](#environment-setup))

3. **Start the server:**
   ```bash
   npm run startServer
   ```

4. **Start the game (in new terminal):**
   ```bash
   npm run startApp
   ```

## 🛠 Tech Stack

- **Backend:** Node.js, Express.js, JavaScript (ES Modules)
- **Databases:** 
  - MongoDB (riddle storage)
  - Supabase (player data & scoring)
- **Frontend:** Terminal-based CLI with readline-sync
- **Tools:** dotenv, fetch API

---

## 📋 Project Overview

This project demonstrates a full-stack JavaScript application with clear separation of concerns:

- **Server** (`/server`): REST API handling data persistence and business logic
- **Client** (`/client`): Interactive terminal game consuming the API

The architecture showcases modern JavaScript patterns, database integration, and API design principles.

---

## 📁 Folder Structure

```
RiddleGame/
├── 📁 client/                    # Terminal game application
│   ├── 📄 app.js                 # Main game entry point
│   ├── 📁 classes/               # Game entities
│   │   ├── 📄 Riddle.js
│   │   ├── 📄 Player.js
│   │   └── 📄 MultipleChoiceRiddle.js
│   ├── 📁 managers/              # Game flow controllers
│   │   ├── 📄 gameManager.js
│   │   └── 📄 playerManager.js
│   └── 📁 services/              # API communication
│       ├── 📄 playerService.js
│       └── 📄 riddleService.js
├── 📁 server/                    # REST API server
│   ├── 📄 server.js              # Express server setup
│   ├── 📄 router.js              # Main API router
│   ├── 📁 controllers/           # Request handlers
│   │   ├── 📄 playerController.js
│   │   └── 📄 riddleController.js
│   ├── 📁 routers/               # Route definitions
│   │   ├── 📄 playerRouter.js
│   │   └── 📄 riddleRouter.js
│   ├── 📁 DAL/                   # Data Access Layer
│   │   ├── 📄 riddleCrud.js
│   │   ├── 📄 playerCrud.js
│   │   └── 📄 playerScoreCrud.js
│   └── 📁 lib/                   # Database configurations
│       ├── 📁 riddles/
│       │   ├── 📄 riddleDb.js
│       │   └── 📄 randomRiddles.json
│       └── 📁 players/
│           ├── 📄 playerDb.js
│           └── 📄 playerExampleData.txt
├── 📄 .env                       # Environment variables
├── 📄 .gitignore
├── 📄 package.json
└── 📄 README.md
```

---

## ⚙️ Environment Setup

Create a `.env` file in the project root:

```env
# Server Configuration
PORT=3000

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/riddle_game
# Or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/riddle_game

# Supabase Configuration
PUBLIC_PROJECT_URL=https://your-project.supabase.co
PUBLIC_ANON_API_KEY=your_supabase_anon_key
```

### 🔧 Database Setup

**MongoDB:**
- Install MongoDB locally or use MongoDB Atlas
- Database: `riddle_game`
- Collection: `riddles`

**Supabase:**
1. Create a new project at [supabase.com](https://supabase.com)
2. Create the following tables:

```sql
-- Players table
CREATE TABLE players (
    id SERIAL PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    lowestTime NUMERIC DEFAULT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Player scores table
CREATE TABLE player_scores (
    id SERIAL PRIMARY KEY,
    player_id INTEGER REFERENCES players(id),
    riddle_id TEXT NOT NULL,
    time_to_solve NUMERIC NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🎮 Game Features

### Core Gameplay
- **🧩 Multiple Riddle Types:** Standard and multiple-choice riddles
- **⭐ Difficulty Levels:** Easy, Medium, Hard
- **⏱️ Time Challenges:** Each riddle has configurable time limits
- **💡 Smart Hint System:** Get help when stuck (with time penalty)
- **📊 Progress Tracking:** Only unsolved riddles are presented
- **🏆 Leaderboard:** Compete for the fastest solving times

### Penalty System
- **⏰ Time Limit Exceeded:** +5 seconds penalty
- **💡 Hint Usage:** +10 seconds penalty
- **🎯 Strategic Gameplay:** Balance speed vs. accuracy

### Administrative Features
- **📝 CRUD Operations:** Full riddle management
- **📂 Bulk Import:** Load riddles from JSON files
- **👤 Player Management:** Automatic registration and tracking

---

## 🗄️ Database Schema

### MongoDB Collections

**Riddles Collection:**
```javascript
{
  _id: ObjectId,
  name: String,                    // Riddle title
  taskDescription: String,         // The riddle question
  correctAnswer: String,           // Expected answer
  difficulty: String,              // "easy" | "medium" | "hard"
  timeLimit: Number,              // Seconds allowed
  hint: String,                   // Optional hint text
  choices: Array<String>          // For multiple choice (optional)
}
```

### Supabase Tables

**players:**
```sql
id          SERIAL PRIMARY KEY
username    TEXT UNIQUE NOT NULL
lowestTime  NUMERIC              -- Best overall time
created_at  TIMESTAMP DEFAULT NOW()
```

**player_scores:**
```sql
id            SERIAL PRIMARY KEY
player_id     INTEGER REFERENCES players(id)
riddle_id     TEXT NOT NULL      -- MongoDB ObjectId as string
time_to_solve NUMERIC NOT NULL   -- Time in seconds (including penalties)
created_at    TIMESTAMP DEFAULT NOW()
```

---

## 🔗 API Endpoints

### 🧩 Riddle Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/riddles/create_riddle` | Create a new riddle |
| `GET` | `/api/riddles/read_all_riddles` | Get all riddles |
| `GET` | `/api/riddles/read_all_riddles/:difficulty` | Filter by difficulty |
| `PUT` | `/api/riddles/update_riddle/:id` | Update existing riddle |
| `DELETE` | `/api/riddles/delete_riddle/:id` | Delete riddle |
| `POST` | `/api/riddles/load_initial_riddles` | Bulk import from JSON |

### 👤 Player Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/players/create_player` | Register or retrieve player |
| `PUT` | `/api/players/update_time/:id` | Update best time |
| `GET` | `/api/players/leaderboard` | Get top players |
| `POST` | `/api/players/record_solved_riddle` | Record completion |
| `GET` | `/api/players/unsolved_riddles/:player_id` | Get pending riddles |
| `GET` | `/api/players/unsolved_riddles/:player_id?difficulty=:level` | Filter unsolved by difficulty |

---

## 🎯 Example Gameplay Flow

1. **🏁 Game Initialization:**
   - Server starts and connects to databases
   - Client launches terminal interface

2. **👤 Player Setup:**
   - Enter username (auto-creates if new)
   - Choose difficulty level

3. **🎮 Gameplay Loop:**
   - System fetches unsolved riddles
   - Present riddle with timer
   - Accept answer or hint request
   - Calculate final time (including penalties)
   - Record progress and update leaderboard

4. **🏆 Completion:**
   - View personal statistics
   - Check leaderboard rankings
   - Option to try different difficulty

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- Supabase account

### Installation Steps

1. **Clone repository:**
   ```bash
   git clone <repository-url>
   cd RiddleGame
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment:**
   - Copy `.env.example` to `.env`
   - Fill in your database credentials

4. **Initialize data (optional):**
   ```bash
   # Start server first
   npm run startServer
   
   # In another terminal, load sample riddles
   curl -X POST http://localhost:3000/api/riddles/load_initial_riddles
   ```

5. **Play the game:**
   ```bash
   npm run startApp
   ```

---

## 🔧 Development Scripts

```bash
# Start server in development mode
npm run startServer

# Start client application
npm run startApp

# Run both simultaneously (if using concurrently)
npm run dev
```

---

## 🐛 Troubleshooting

### Common Issues

**Server won't start:**
- ✅ Check `.env` file exists and has correct values
- ✅ Verify MongoDB connection string
- ✅ Ensure port 3000 is available

**Database connection errors:**
- ✅ Confirm MongoDB is running
- ✅ Test Supabase credentials
- ✅ Check network connectivity

**Client can't connect to server:**
- ✅ Verify server is running on correct port
- ✅ Check firewall settings
- ✅ Ensure both processes are running

### Debug Mode
Set `NODE_ENV=development` in your `.env` file for verbose logging.

---

## 🚀 Future Enhancements

- 🌐 Web-based interface
- 🔐 User authentication and profiles
- 📱 Mobile application
- 🎨 Custom riddle categories
- 🏅 Achievement system
- 👥 Multiplayer challenges

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

---

*Built with ❤️ using modern JavaScript and best practices*
