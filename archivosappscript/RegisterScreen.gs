function getRegisterScreen(user) {
  const tasks = registerBuildTasks();

  return {
    frequent: registerGetFrequentTasks(tasks),
    today: registerGetPendingTodayTasks(),
    categories: registerGroupTasks(tasks)
  };
}

function registerGetPendingTodayTasks() {
  // Misma lógica que Inicio (homeGetToday), para que ambas pantallas coincidan.
  return getTodayPendingTasks();
}

function registerBuildTasks() {
  const taskRows = getTasksTable().slice(1);
  const categoriesMap = getCategoriesMap();
  const history = getCachedHistory();
  const usage = Object.create(null);
  const latestExecution = Object.create(null);
  const pointsConfig = getPointsConfiguration();
  const now = new Date();

  history.forEach(row => {
    const taskId = String(row[3]);
    if (!taskId || taskId === "undefined") return;

    usage[taskId] = (usage[taskId] || 0) + 1;

    const date = new Date(row[1]);
    if (
      !latestExecution[taskId] ||
      date > latestExecution[taskId]
    ) {
      latestExecution[taskId] = date;
    }
  });

  return taskRows
    .filter(row => row[0] !== "" && row[0] !== null)
    .map(row => {
      const taskId = String(row[0]);
      const categoryId = Number(row[2]);
      const count = usage[taskId] || 0;
      const puntos = Number(row[3]) || 0;
      const bonusEnabled = isTaskBonusEnabled(row[8]);
      const bonus = bonusEnabled
        ? registerCalculateBonus(
            latestExecution[taskId],
            pointsConfig,
            now
          )
        : 0;

      return {
        id: row[0],
        nombre: row[1],
        categoriaId: categoryId,
        categoria: categoriesMap[categoryId] || "General",
        puntos,
        bonusEnabled,
        bonus,
        puntosTotales: puntos + bonus,
        activa: row[4],
        uso: count,
        usos: count
      };
    });
}

function registerCalculateBonus(lastExecution, pointsConfig, now) {
  if (!lastExecution) return 0;

  const bonusDays = Math.max(1, Number(pointsConfig.bonusDays) || 7);
  const bonusPoints = Number(pointsConfig.bonusPoints) || 0;
  const maxBonus = Number(pointsConfig.maxBonus) || 0;
  const diffDays = Math.floor(
    (now - lastExecution) / (1000 * 60 * 60 * 24)
  );

  if (diffDays <= 0) return 0;

  return Math.min(
    Math.floor(diffDays / bonusDays) * bonusPoints,
    maxBonus
  );
}

function registerGetFrequentTasks(tasks) {
  return tasks
    .slice()
    .sort((a, b) => b.usos - a.usos)
    .slice(0, 5);
}

function registerGroupTasks(tasks) {
  const grouped = {};

  tasks.forEach(task => {
    const key = task.categoria;

    if (!grouped[key]) {
      grouped[key] = {
        id: task.categoriaId,
        nombre: task.categoria,
        tareas: []
      };
    }

    grouped[key].tareas.push(task);
  });

  return Object.values(grouped).map(category => ({
    ...category,
    tareas: category.tareas.sort((a, b) => b.uso - a.uso)
  }));
}

function getGroupedTasks() {
  return registerGroupTasks(registerBuildTasks());
}