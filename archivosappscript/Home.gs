function getHome(user) {
  const now = new Date();

  const taskRows = getTasksTable().slice(1);
  const programmingRows = getProgrammingTable().slice(1);
  const historyRows = getCachedHistory().filter(row => row[3]);
  const pointsConfig = getPointsConfiguration();

  const tasksById = homeBuildTasksById(taskRows);
  const latestExecutionByTask = homeBuildLatestExecutionByTask(historyRows);

  const today = homeGetToday(
    programmingRows,
    tasksById,
    latestExecutionByTask,
    pointsConfig,
    now
  );

  const weeklyScore = homeGetWeeklyScore(historyRows, now);

  return {
    today,
    week: weeklyScore.score,
    weekDetails: weeklyScore.details,
    record: homeGetRecentRecord(historyRows, now),
    recent: homeGetRecentTasks(historyRows, tasksById),
    stats: {
      weeklyWinners: homeGetWeeklyWinners(historyRows),
      topTasks: homeGetTopTasks(historyRows, tasksById),
      topTasksByUser: homeGetTopTasksByUser(historyRows, tasksById),
      weeklyHistory: homeGetWeeklyHistory(historyRows)
    }
  };
}

// Reutilizado por RegisterScreen.gs para que "Hoy" coincida en Inicio y Registrar.
function getTodayPendingTasks() {
  const now = new Date();
  const programmingRows = getProgrammingTable().slice(1);
  const historyRows = getCachedHistory().filter(row => row[3]);

  return homeGetToday(
    programmingRows,
    homeBuildTasksById(getTasksTable().slice(1)),
    homeBuildLatestExecutionByTask(historyRows),
    getPointsConfiguration(),
    now
  );
}

function homeBuildTasksById(taskRows) {
  const tasksById = Object.create(null);

  taskRows.forEach(row => {
    tasksById[String(row[0])] = {
      id: row[0],
      nombre: row[1],
      categoriaId: row[2],
      puntos: Number(row[3]) || 0,
      bonusEnabled: isTaskBonusEnabled(row[8])
    };
  });

  return tasksById;
}

function homeBuildLatestExecutionByTask(historyRows) {
  const latestExecutionByTask = Object.create(null);

  historyRows.forEach(row => {
    const taskId = String(row[3]);
    const date = new Date(row[1]);

    if (
      !latestExecutionByTask[taskId] ||
      date > latestExecutionByTask[taskId]
    ) {
      latestExecutionByTask[taskId] = date;
    }
  });

  return latestExecutionByTask;
}

function homeGetToday(
  programmingRows,
  tasksById,
  latestExecutionByTask,
  pointsConfig,
  today
) {
  const todayTasks = [];

  programmingRows.forEach(row => {
    const taskId = row[0];
    const type = row[1];
    const interval = Number(row[2]);
    const weekDays = row[3];
    const monthDay = Number(row[4]);
    const startDate = row[5] ? homeParseDate(row[5]) : null;
    const active = row[6];

    if (!active) return;

    const scheduledDate = homeGetLatestDueDate({
      type,
      interval,
      weekDays,
      monthDay,
      startDate,
      today
    });

    if (!scheduledDate) return;

    const lastExecution = latestExecutionByTask[String(taskId)];
    const lastExecutionKey = lastExecution
      ? homeFormatDate(homeParseDate(lastExecution))
      : "";

    // Si se hizo desde la última fecha programada, ya no queda pendiente.
    if (
      lastExecutionKey &&
      lastExecutionKey >= homeFormatDate(scheduledDate)
    ) {
      return;
    }

    const task = tasksById[String(taskId)];
    const basePoints = task ? task.puntos : 0;
    const bonus =
      task && task.bonusEnabled
        ? homeGetBonus(lastExecution, pointsConfig, today)
        : 0;

    todayTasks.push({
      id: taskId,
      nombre: task ? task.nombre : taskId,
      categoriaId: task ? task.categoriaId : undefined,
      puntos: basePoints,
      bonusEnabled: task ? task.bonusEnabled : false,
      bonus,
      puntosTotales: basePoints + bonus
    });
  });

  return todayTasks;
}

function homeGetLatestDueDate({
  type,
  interval,
  weekDays,
  monthDay,
  startDate,
  today
}) {
  const todayDate = homeParseDate(today);
  const todayKey = homeFormatDate(todayDate);
  const todayDay = todayDate.getDay();

  switch (type) {
    case "DIARIA":
      // Las diarias solo quedan pendientes durante el día actual.
      return todayDate;

    case "SEMANAL": {
      if (!weekDays) return null;

      const days = weekDays
        .toString()
        .split(",")
        .map(value => Number(value.trim()))
        .filter(value =>
          Number.isInteger(value) &&
          value >= 0 &&
          value <= 6
        );

      if (!days.length) return null;

      const daysBack = Math.min(
        ...days.map(day => (todayDay - day + 7) % 7)
      );

      return homeAddDays(todayDate, -daysBack);
    }

    case "CADA_X_SEMANAS": {
      if (!startDate || interval <= 0) return null;

      const start = homeParseDate(startDate);
      const daysSinceStart = homeDaysBetween(start, todayDate);

      if (daysSinceStart < 0) return null;

      const periodDays = interval * 7;
      const periodIndex = Math.floor(daysSinceStart / periodDays);

      return homeAddDays(start, periodIndex * periodDays);
    }

    case "MENSUAL": {
      if (
        !Number.isInteger(monthDay) ||
        monthDay < 1 ||
        monthDay > 31
      ) {
        return null;
      }

      for (let monthsBack = 0; monthsBack < 24; monthsBack++) {
        const candidate = new Date(
          todayDate.getFullYear(),
          todayDate.getMonth() - monthsBack,
          1
        );

        const daysInMonth = new Date(
          candidate.getFullYear(),
          candidate.getMonth() + 1,
          0
        ).getDate();

        if (monthDay > daysInMonth) continue;

        const dueDate = new Date(
          candidate.getFullYear(),
          candidate.getMonth(),
          monthDay
        );

        if (homeFormatDate(dueDate) <= todayKey) {
          return dueDate;
        }
      }

      return null;
    }

    default:
      return null;
  }
}

function homeParseDate(value) {
  if (value instanceof Date) {
    return new Date(
      value.getFullYear(),
      value.getMonth(),
      value.getDate()
    );
  }

  const text = String(value);
  const match = text.match(/^(\d{4})-(\d{2})-(\d{2})/);

  if (match) {
    return new Date(
      Number(match[1]),
      Number(match[2]) - 1,
      Number(match[3])
    );
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return new Date(
    parsed.getFullYear(),
    parsed.getMonth(),
    parsed.getDate()
  );
}

function homeAddDays(date, amount) {
  const result = homeParseDate(date);
  result.setDate(result.getDate() + amount);
  return result;
}

function homeDaysBetween(start, end) {
  const startDate = homeParseDate(start);
  const endDate = homeParseDate(end);

  return Math.round(
    (
      Date.UTC(
        endDate.getFullYear(),
        endDate.getMonth(),
        endDate.getDate()
      ) -
      Date.UTC(
        startDate.getFullYear(),
        startDate.getMonth(),
        startDate.getDate()
      )
    ) / (24 * 60 * 60 * 1000)
  );
}

function homeGetBonus(lastExecution, pointsConfig, today) {
  if (!lastExecution) return 0;

  const bonusDays = Math.max(1, Number(pointsConfig.bonusDays) || 7);
  const bonusPoints = Number(pointsConfig.bonusPoints) || 0;
  const maxBonus = Number(pointsConfig.maxBonus) || 0;

  const diffDays = Math.floor(
    (today - lastExecution) / (1000 * 60 * 60 * 24)
  );

  if (diffDays <= 0) return 0;

  return Math.min(
    Math.floor(diffDays / bonusDays) * bonusPoints,
    maxBonus
  );
}

function homeGetWeeklyScore(historyRows, today) {
  const earned = {
    Elena: 0,
    "Tomás": 0
  };

  const weekStart = homeGetWeekStart(today);
  const nextWeekStart = new Date(weekStart);
  nextWeekStart.setDate(nextWeekStart.getDate() + 7);

  const pointsBeforeThisWeek = {
    Elena: 0,
    "Tomás": 0
  };

  historyRows.forEach(row => {
    const date = new Date(row[1]);
    const user = row[2];
    const points = Number(row[7]) || 0;

    if (earned[user] === undefined) return;

    if (date >= weekStart && date < nextWeekStart) {
      earned[user] += points;
    } else if (date < weekStart) {
      pointsBeforeThisWeek[user] += points;
    }
  });

  const previousDifference =
    pointsBeforeThisWeek.Elena - pointsBeforeThisWeek["Tomás"];

  const carryover = {
    Elena: Math.max(0, previousDifference),
    "Tomás": Math.max(0, -previousDifference)
  };

  return {
    score: {
      Elena: carryover.Elena + earned.Elena,
      "Tomás": carryover["Tomás"] + earned["Tomás"]
    },
    details: {
      carryover,
      earned,
      weekStart: homeFormatDate(weekStart),
      weekEnd: homeFormatDate(
        new Date(
          weekStart.getFullYear(),
          weekStart.getMonth(),
          weekStart.getDate() + 6
        )
      )
    }
  };
}

function homeGetWeekStart(date) {
  const start = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );

  const daysSinceMonday = (start.getDay() + 6) % 7;
  start.setDate(start.getDate() - daysSinceMonday);

  return start;
}

function homeFormatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function homeGetRecentRecord(historyRows, today) {
  const threeMonthsAgo = new Date(today);
  threeMonthsAgo.setMonth(today.getMonth() - 3);

  const weekly = Object.create(null);

  historyRows.forEach(row => {
    const date = new Date(row[1]);
    if (date < threeMonthsAgo) return;

    const user = row[2];
    const points = Number(row[7]) || 0;
    const key = homeGetWeekKey(date) + "-" + user;

    if (!weekly[key]) {
      weekly[key] = { user, points: 0 };
    }

    weekly[key].points += points;
  });

  let record = null;

  Object.keys(weekly).forEach(key => {
    const current = weekly[key];

    if (!record || current.points > record.points) {
      record = current;
    }
  });

  return record;
}

function homeGetRecentTasks(historyRows, tasksById) {
  return historyRows
    .slice()
    .reverse()
    .slice(0, 5)
    .map(row => {
      const task = tasksById[String(row[3])];

      return {
        id: row[0],
        tareaId: row[3],
        nombre: task ? task.nombre : row[3],
        categoriaId: task ? task.categoriaId : undefined,
        usuario: row[2],
        fecha: row[1],
        puntos: Number(row[7]) || 0
      };
    });
}

function homeGetWeeklyWinners(historyRows) {
  const weekly = Object.create(null);
  const wins = {
    Elena: 0,
    "Tomás": 0
  };

  historyRows.forEach(row => {
    const week = homeGetWeekKey(new Date(row[1]));

    if (!weekly[week]) {
      weekly[week] = {
        Elena: 0,
        "Tomás": 0
      };
    }

    const user = row[2];

    if (weekly[week][user] !== undefined) {
      weekly[week][user] += Number(row[7]) || 0;
    }
  });

  Object.keys(weekly).forEach(week => {
    if (weekly[week].Elena > weekly[week]["Tomás"]) {
      wins.Elena++;
    }

    if (weekly[week]["Tomás"] > weekly[week].Elena) {
      wins["Tomás"]++;
    }
  });

  return wins;
}

function homeGetTopTasks(historyRows, tasksById) {
  const usage = Object.create(null);

  historyRows.forEach(row => {
    const taskId = String(row[3]);
    usage[taskId] = (usage[taskId] || 0) + 1;
  });

  return Object.keys(usage)
    .map(id => ({
      nombre: tasksById[id] ? tasksById[id].nombre : id,
      count: usage[id]
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

function homeGetTopTasksByUser(historyRows, tasksById) {
  const usageByUser = {
    Elena: Object.create(null),
    "Tomás": Object.create(null)
  };

  historyRows.forEach(row => {
    const user = row[2];
    const taskId = String(row[3]);

    if (!usageByUser[user] || !taskId || taskId === "undefined") {
      return;
    }

    usageByUser[user][taskId] =
      (usageByUser[user][taskId] || 0) + 1;
  });

  const result = {};

  Object.keys(usageByUser).forEach(user => {
    result[user] = Object.entries(usageByUser[user])
      .map(([id, count]) => ({
        nombre: tasksById[id] ? tasksById[id].nombre : id,
        count
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  });

  return result;
}

function homeGetWeeklyHistory(historyRows) {
  const weekly = Object.create(null);

  historyRows.forEach(row => {
    const week = homeGetWeekKey(new Date(row[1]));

    if (!weekly[week]) {
      weekly[week] = {
        Elena: 0,
        "Tomás": 0
      };
    }

    const user = row[2];

    if (weekly[week][user] !== undefined) {
      weekly[week][user] += Number(row[7]) || 0;
    }
  });

  return Object.keys(weekly)
    .map(week => {
      let winner = null;

      if (weekly[week].Elena > weekly[week]["Tomás"]) {
        winner = "Elena";
      }

      if (weekly[week]["Tomás"] > weekly[week].Elena) {
        winner = "Tomás";
      }

      return { week, winner };
    })
    .slice(-6);
}

function homeGetWeekKey(date) {
  return homeFormatDate(homeGetWeekStart(date));
}