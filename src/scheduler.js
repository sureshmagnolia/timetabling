/**
 * TIMETABLE GENERATION LOGIC
 * This acts as the "Backend" script. It runs purely on data.
 */

const generateId = () => Math.floor(Math.random() * 100000);

export const runBacktrackingAlgorithm = (workload, classes, subjects, faculty, constraints) => {
  const DAYS = 5; // Mon-Fri
  const PERIODS = 5; // 5 hours/day
  
  // Initialize empty schedule grid for each class
  // Structure: schedule[classId][dayIndex][periodIndex]
  const schedule = {}; 
  classes.forEach(cls => {
    schedule[cls.id] = Array(DAYS).fill(null).map(() => Array(PERIODS + 1).fill(null)); 
  });

  // Flatten Workload into individual "Session Units"
  let tasks = [];
  workload.forEach(w => {
    for (let i = 0; i < w.hoursPerWeek; i++) {
      tasks.push({ ...w, uniqueId: generateId() });
    }
  });

  // Heuristic Sort: Schedule hardest tasks first
  tasks.sort((a, b) => {
    if (a.type === 'Joint' && b.type !== 'Joint') return -1;
    return 0;
  });

  // Backtracking Solver
  const solve = (taskIndex) => {
    if (taskIndex >= tasks.length) return true; // Success

    const task = tasks[taskIndex];
    
    // Try every Day (0-4) and Period (1-5)
    for (let day = 0; day < DAYS; day++) {
      for (let period = 1; period <= PERIODS; period++) {
        
        if (isValid(task, day, period, schedule, classes, constraints)) {
          // Place task
          schedule[task.classId][day][period] = task;

          // Recurse
          if (solve(taskIndex + 1)) return true;

          // Backtrack
          schedule[task.classId][day][period] = null;
        }
      }
    }
    return false; // Failure
  };

  if (solve(0)) {
    return schedule;
  } else {
    throw new Error("Conflict found! Could not generate a valid timetable. Try reducing workload or relaxing constraints.");
  }
};

const isValid = (task, day, period, currentSchedule, classes, constraints) => {
  // Rule 1: Class Room must be free
  if (currentSchedule[task.classId][day][period] !== null) return false;

  // Rule 2: Teachers must be free
  for (const cls of classes) {
    const slot = currentSchedule[cls.id][day][period];
    if (slot) {
      // Check Primary Teacher
      if (slot.teacherId === task.teacherId || slot.assistantId === task.teacherId) return false;
      
      // Check Assistant Teacher (if this task has one)
      if (task.assistantId) {
        if (slot.teacherId === task.assistantId || slot.assistantId === task.assistantId) return false;
      }
    }
  }

  // Rule 3: Max Consecutive Hours
  if (constraints.maxConsecutive && period > constraints.maxConsecutive) {
    let consecutiveCount = 0;
    for (let p = period - 1; p >= 1; p--) {
      let isTeacherBusyInThisSlot = false;
      for (const cls of classes) {
        const slot = currentSchedule[cls.id][day][p];
        if (slot && (slot.teacherId === task.teacherId || slot.assistantId === task.teacherId)) {
          isTeacherBusyInThisSlot = true;
          break;
        }
      }
      if (isTeacherBusyInThisSlot) consecutiveCount++;
      else break;
    }
    if (consecutiveCount >= constraints.maxConsecutive) return false;
  }

  return true;
};
