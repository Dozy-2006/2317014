# Vehicle Maintenance Scheduler Microservice

A production-ready microservice built with Node.js and Express to calculate optimal vehicle maintenance schedules for depots. The service fetches depot capacities and vehicle task profiles from an external evaluation API and resolves the scheduling using an efficient 0/1 Knapsack Dynamic Programming algorithm.

---

## Folder Structure

The project follows a modular, clean-architecture structure:

```text
vehicle-scheduler-be/
├── config/
│   └── logger.js          # Reusable logger abstraction (integrates external logging)
├── middleware/
│   ├── errorHandler.js    # Centralized HTTP error handler
│   └── requestLogger.js   # Request logging middleware adapter
├── routes/
│   └── schedule.js        # GET /schedule API route
├── services/
│   └── apiService.js      # External API client wrapper with Axios
├── utils/
│   └── knapsack.js        # Bottom-up 0/1 Knapsack Dynamic Programming solver
├── .env.example           # Reference environment variables layout
├── .gitignore             # Git ignore definitions
├── package.json           # Node configuration and scripts
├── server.js              # Application entrypoint
└── README.md              # Documentation
```

---

## Installation & Setup

### 1. Install Dependencies
Navigate to the project folder and run:
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root of the `vehicle-scheduler-be` directory by copying `.env.example`:
```bash
cp .env.example .env
```
Update the variables to match your environment:
```env
PORT=3000
BASE_URL=http://4.224.186.213
ACCESS_TOKEN=your_bearer_token_here
```

---

## Running the Application

To start the server, run:
```bash
npm start
```
The server will start listening on the configured `PORT` (default: `3000`).

---

## API Documentation

### GET `/schedule`
Fetches all depots and maintenance tasks, and computes the optimal subset of tasks for each depot.

- **URL**: `/schedule`
- **Method**: `GET`
- **Headers**: None (Internal authorization token is automatically attached to outgoing external API requests).
- **Success Response Code**: `200 OK`

#### Sample Response Body
```json
[
  {
    "DepotID": 1,
    "MechanicHours": 10,
    "SelectedTasks": [
      {
        "TaskID": "task-2",
        "Duration": 4,
        "Impact": 40
      },
      {
        "TaskID": "task-4",
        "Duration": 6,
        "Impact": 60
      }
    ],
    "TotalDuration": 10,
    "TotalImpact": 100
  },
  {
    "DepotID": 2,
    "MechanicHours": 15,
    "SelectedTasks": [
      {
        "TaskID": "task-1",
        "Duration": 3,
        "Impact": 30
      },
      {
        "TaskID": "task-2",
        "Duration": 4,
        "Impact": 40
      },
      {
        "TaskID": "task-5",
        "Duration": 8,
        "Impact": 90
      }
    ],
    "TotalDuration": 15,
    "TotalImpact": 160
  }
]
```

### GET `/health`
Simple check to monitor if the microservice is up.
- **URL**: `/health`
- **Method**: `GET`

---

## Dynamic Programming Knapsack Algorithm

### How It Works
The vehicle scheduling task is mapped to the classical **0/1 Knapsack Problem**:
- **Knapsack Capacity ($W$)**: Represented by the depot's `MechanicHours`.
- **Item Weight ($w_i$)**: Represented by the vehicle task's `Duration`.
- **Item Value ($v_i$)**: Represented by the vehicle task's `Impact`.

We implement a bottom-up Dynamic Programming (DP) state-space solver:
1. Define a 2D grid `dp[i][w]` where $i$ ranges from $0$ to $N$ (number of tasks) and $w$ ranges from $0$ to $W$ (MechanicHours).
2. `dp[i][w]` stores the maximum possible `Impact` achievable using a subset of the first $i$ tasks under a total duration limit of $w$.
3. The recurrence relation is:
   - If the task duration is greater than the current capacity $w$:
     $$dp[i][w] = dp[i-1][w]$$
   - If the task duration is less than or equal to $w$:
     $$dp[i][w] = \max(dp[i-1][w], dp[i-1][w - \text{Duration}_i] + \text{Impact}_i)$$
4. Once the grid is fully built, we backtrack starting from `dp[N][W]`. By comparing the values of `dp[i][w]` and `dp[i-1][w]`, we can identify which tasks were selected, subtract their durations, and update our capacity pointer to reconstruct the list of selected tasks.

### Complexity Analysis
- **Time Complexity**: $\mathcal{O}(N \times W)$ where $N$ is the number of valid vehicle tasks and $W$ is the depot's `MechanicHours` capacity. This scales linearly with both inputs and avoids the exponential $\mathcal{O}(2^N)$ brute force recursion.
- **Space Complexity**: $\mathcal{O}(N \times W)$ to store the DP grid. This space is required to support traceback for identifying the exact selected tasks.
