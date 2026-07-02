/**
 * Solves the 0/1 Knapsack problem using Dynamic Programming.
 * 
 * Target: Maximize Sum(Impact) subject to Sum(Duration) <= MechanicHours.
 * Time Complexity: O(N * W) where N is the number of tasks and W is capacity.
 * Space Complexity: O(N * W) to reconstruct the chosen tasks.
 * 
 * @param {Array} tasks - Array of task objects, each containing TaskID, Duration, and Impact
 * @param {number} capacity - The maximum allowed duration (MechanicHours)
 * @returns {Object} SelectedTasks, TotalDuration, TotalImpact
 */
function solveKnapsack(tasks, capacity) {
  const W = Math.max(0, Math.floor(capacity));
  if (W === 0 || !Array.isArray(tasks) || tasks.length === 0) {
    return {
      SelectedTasks: [],
      TotalDuration: 0,
      TotalImpact: 0
    };
  }

  // Filter out invalid tasks to ensure reliability
  const validTasks = tasks.filter(
    (task) =>
      task &&
      typeof task.TaskID === 'string' &&
      typeof task.Duration === 'number' &&
      task.Duration > 0 &&
      typeof task.Impact === 'number' &&
      task.Impact >= 0
  );

  const N = validTasks.length;
  if (N === 0) {
    return {
      SelectedTasks: [],
      TotalDuration: 0,
      TotalImpact: 0
    };
  }

  // Use a 2D array to store DP states.
  // dp[i][w] represents the maximum impact using a subset of the first i tasks with total duration <= w.
  // We use standard JS arrays to support non-integer/floating-point Impact values if any.
  const dp = Array.from({ length: N + 1 }, () => new Array(W + 1).fill(0));

  // Build the DP table
  for (let i = 1; i <= N; i++) {
    const task = validTasks[i - 1];
    const wt = Math.floor(task.Duration); // Weight must be integer for indexing
    const val = task.Impact;

    for (let w = 0; w <= W; w++) {
      if (wt <= w) {
        dp[i][w] = Math.max(dp[i - 1][w], dp[i - 1][w - wt] + val);
      } else {
        dp[i][w] = dp[i - 1][w];
      }
    }
  }

  // Backtrack to find the optimal subset of tasks
  let w = W;
  const selectedTasks = [];
  let totalDuration = 0;
  let totalImpact = 0;

  for (let i = N; i > 0; i--) {
    // If the value changed, it means the i-th task was included
    if (dp[i][w] !== dp[i - 1][w]) {
      const task = validTasks[i - 1];
      selectedTasks.push(task);
      totalDuration += task.Duration;
      totalImpact += task.Impact;
      w -= Math.floor(task.Duration);
    }
  }

  // The backtracking process gets the selected tasks in reverse order, so we reverse it.
  selectedTasks.reverse();

  // Round results to handle JavaScript float precision issues
  return {
    SelectedTasks: selectedTasks,
    TotalDuration: Math.round(totalDuration * 100) / 100,
    TotalImpact: Math.round(totalImpact * 100) / 100
  };
}

module.exports = { solveKnapsack };
