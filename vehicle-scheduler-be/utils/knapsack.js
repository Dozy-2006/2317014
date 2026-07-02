function solveKnapsack(tasks, capacity) {
  const W = Math.max(0, Math.floor(capacity));
  if (W === 0 || !Array.isArray(tasks) || tasks.length === 0) {
    return {
      SelectedTasks: [],
      TotalDuration: 0,
      TotalImpact: 0
    };
  }

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

  const dp = Array.from({ length: N + 1 }, () => new Array(W + 1).fill(0));

  for (let i = 1; i <= N; i++) {
    const task = validTasks[i - 1];
    const wt = Math.floor(task.Duration);
    const val = task.Impact;

    for (let w = 0; w <= W; w++) {
      if (wt <= w) {
        dp[i][w] = Math.max(dp[i - 1][w], dp[i - 1][w - wt] + val);
      } else {
        dp[i][w] = dp[i - 1][w];
      }
    }
  }

  let w = W;
  const selectedTasks = [];
  let totalDuration = 0;
  let totalImpact = 0;

  for (let i = N; i > 0; i--) {
    if (dp[i][w] !== dp[i - 1][w]) {
      const task = validTasks[i - 1];
      selectedTasks.push(task);
      totalDuration += task.Duration;
      totalImpact += task.Impact;
      w -= Math.floor(task.Duration);
    }
  }

  selectedTasks.reverse();

  return {
    SelectedTasks: selectedTasks,
    TotalDuration: Math.round(totalDuration * 100) / 100,
    TotalImpact: Math.round(totalImpact * 100) / 100
  };
}

module.exports = { solveKnapsack };
