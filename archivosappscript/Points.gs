function getTaskById(taskId) {
  const row = getTasksTable()
    .slice(1)
    .find(row => String(row[0]) === String(taskId));

  if (!row) return null;

  const categoryId = Number(row[2]);
  const categoriesMap = getCategoriesMap();
  const usage = getCategoryUsage();

  return {
    id: row[0],
    nombre: row[1],
    categoriaId,
    categoria: categoriesMap[categoryId] || "General",
    puntos: Number(row[3]) || 0,
    activa: row[4],
    uso: usage[row[0]] || 0,
    bonusEnabled: isTaskBonusEnabled(row[8])
  };
}

function getBasePoints(taskId) {
  const row = getTasksTable()
    .slice(1)
    .find(row => String(row[0]) === String(taskId));

  return row ? Number(row[3]) || 0 : 0;
}

function getPointsConfiguration() {
  const values = {};

  getConfigurationTable()
    .slice(1)
    .forEach(row => {
      if (row[0] !== "" && row[0] !== null) {
        values[String(row[0]).trim()] = row[1];
      }
    });

  return {
    bonusDays: Number(readConfigValue(
      values, ["dias_incremento", "bonus_days"], 7
    )),
    bonusPoints: Number(readConfigValue(
      values, ["incremento_puntos", "bonus_points"], 5
    )),
    maxBonus: Number(readConfigValue(
      values, ["puntos_maximos_extra", "bonus_maximo", "max_bonus"], 20
    ))
  };
}

function readConfigValue(values, keys, fallback) {
  for (let i = 0; i < keys.length; i++) {
    if (values[keys[i]] !== undefined && values[keys[i]] !== "") {
      return values[keys[i]];
    }
  }

  return fallback;
}

function isTaskBonusEnabled(value) {
  // Las tareas anteriores, sin valor en la columna I, mantienen el bonus.
  if (value === undefined || value === null || value === "") return true;
  if (value === true || value === 1) return true;

  return ["TRUE", "1", "SI", "SÍ", "ACTIVO"].includes(
    String(value).trim().toUpperCase()
  );
}

function getTaskBonusEnabled(taskId) {
  const row = getTasksTable()
    .slice(1)
    .find(task => String(task[0]) === String(taskId));

  return row ? isTaskBonusEnabled(row[8]) : false;
}

function updatePointsConfiguration(data) {
  const config = {
    bonusDays: Number(data.bonusDays),
    bonusPoints: Number(data.bonusPoints),
    maxBonus: Number(data.maxBonus)
  };

  if (
    !Number.isInteger(config.bonusDays) || config.bonusDays < 1 ||
    !Number.isFinite(config.bonusPoints) || config.bonusPoints < 0 ||
    !Number.isFinite(config.maxBonus) || config.maxBonus < 0
  ) {
    return { success: false, error: "Invalid points configuration" };
  }

  const sheet = getSheet().getSheetByName("Configuración");
  const values = sheet.getDataRange().getValues();
  const settings = [
    {
      keys: ["dias_incremento", "bonus_days"],
      key: "dias_incremento",
      value: config.bonusDays
    },
    {
      keys: ["incremento_puntos", "bonus_points"],
      key: "incremento_puntos",
      value: config.bonusPoints
    },
    {
      keys: ["puntos_maximos_extra", "bonus_maximo", "max_bonus"],
      key: "puntos_maximos_extra",
      value: config.maxBonus
    }
  ];

  settings.forEach(setting => {
    const index = values.findIndex((row, i) =>
      i > 0 && setting.keys.includes(String(row[0]).trim())
    );

    if (index >= 0) {
      sheet.getRange(index + 1, 2).setValue(setting.value);
    } else {
      sheet.appendRow([setting.key, setting.value]);
    }
  });

  invalidateTableCache("Configuración");

  return { success: true, ...config };
}

function calculateBonus(taskId) {
  if (!getTaskBonusEnabled(taskId)) return 0;

  const history = getCachedHistory();
  let lastExecution = null;

  history.forEach(row => {
    if (String(row[3]) !== String(taskId)) return;

    if (!lastExecution || new Date(row[1]) > new Date(lastExecution[1])) {
      lastExecution = row;
    }
  });

  if (!lastExecution) return 0;

  const config = getPointsConfiguration();
  const bonusDays = Math.max(1, config.bonusDays);
  const diffDays = Math.floor(
    (new Date() - new Date(lastExecution[1])) / (1000 * 60 * 60 * 24)
  );

  if (diffDays <= 0) return 0;

  return Math.min(
    Math.floor(diffDays / bonusDays) * config.bonusPoints,
    config.maxBonus
  );
}

function calculateFinalPoints(taskId) {
  const basePoints = getBasePoints(taskId);
  const bonus = calculateBonus(taskId);

  return {
    basePoints,
    bonus,
    finalPoints: basePoints + bonus
  };
}