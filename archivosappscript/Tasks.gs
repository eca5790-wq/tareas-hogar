function getTasks() {
  const values = getTasksTable();
  const categoriesMap = getCategoriesMap();
  const usage = getCategoryUsage();
  const latestExecutionByTask = homeBuildLatestExecutionByTask(
    getCachedHistory().filter(row => row[3])
  );

  return values
    .slice(1)
    .filter(row => row[0] !== "" && row[0] !== null)
    .map(row => {
      const lastExecution = latestExecutionByTask[String(row[0])];

      return {
        id: row[0],
        nombre: row[1],
        categoriaId: Number(row[2]),
        categoria: categoriesMap[Number(row[2])] || "General",
        puntos: Number(row[3]) || 0,
        activa: row[4],
        uso: usage[row[0]] || 0,
        bonusEnabled: isTaskBonusEnabled(row[8]),
        ultimaRealizacion: lastExecution ? homeFormatDate(lastExecution) : null
      };
    });
}

function getTasksMap() {
  const map = {};

  getTasksTable()
    .slice(1)
    .forEach(row => {
      if (row[0] !== "" && row[0] !== null) {
        map[String(row[0])] = row[1];
      }
    });

  return map;
}

function ensureTaskBonusColumn(sheet) {
  const header = String(sheet.getRange(1, 9).getValue() || "").trim();

  if (!header) {
    sheet.getRange(1, 9).setValue("bonus_activo");
  } else if (header !== "bonus_activo") {
    throw new Error(
      'La columna I de "Tareas" ya tiene otro encabezado. No se ha modificado.'
    );
  }
}

function createTask(data) {
  const sheet = getSheet().getSheetByName("Tareas");
  ensureTaskBonusColumn(sheet);

  const lastRow = sheet.getLastRow();
  const ids = lastRow > 1
    ? sheet.getRange(2, 1, lastRow - 1, 1).getValues()
    : [];

  let maxId = 0;

  ids.forEach(row => {
    maxId = Math.max(maxId, Number(row[0]) || 0);
  });

  const id = maxId + 1;

  sheet.appendRow([
    id,
    data.nombre,
    Number(data.categoriaId),
    Number(data.puntos),
    true,
    "",
    "",
    "",
    String(data.bonusEnabled) === "true"
  ]);

  invalidateTableCache("Tareas");

  return { success: true, id };
}

function updateTask(data) {
  const sheet = getSheet().getSheetByName("Tareas");
  ensureTaskBonusColumn(sheet);

  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) {
    return { success: false, error: "Task not found" };
  }

  const ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();

  for (let i = 0; i < ids.length; i++) {
    if (String(ids[i][0]) !== String(data.id)) continue;

    const rowNumber = i + 2;

    sheet.getRange(rowNumber, 2, 1, 3).setValues([[
      data.nombre,
      Number(data.categoriaId),
      Number(data.puntos)
    ]]);

    // Si la petición no trae el campo, conserva el valor actual.
    if (data.bonusEnabled !== undefined) {
      sheet.getRange(rowNumber, 9).setValue(
        String(data.bonusEnabled) === "true"
      );
    }

    invalidateTableCache("Tareas");
    return { success: true };
  }

  return { success: false, error: "Task not found" };
}

function registerTask(data) {
  const row = getTasksTable()
    .slice(1)
    .find(row => String(row[0]) === String(data.taskId));

  if (!row) {
    return { success: false, error: "Task not found" };
  }

  const taskDate = registerValidateDate(data.date);
  if (!taskDate) {
    return {
      success: false,
      error: "La fecha debe ser un día de esta semana, entre el lunes y hoy."
    };
  }

  const points = calculateFinalPoints(data.taskId);

  const historyId = saveHistory({
    fecha: taskDate,
    usuarioId: data.user,
    tareaId: row[0],
    categoriaId: row[2],
    puntosBase: points.basePoints,
    bonus: points.bonus,
    puntosFinales: points.finalPoints,
    comentario: "",
    origen: "app"
  });

  return {
    success: true,
    taskId: row[0],
    historyId,
    points: points.finalPoints,
    bonus: points.bonus
  };
}

function registerValidateDate(value) {
  const dateKey = String(value || "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) return null;

  const parts = dateKey.split("-").map(Number);
  const [year, month, day] = parts;
  const utcDate = new Date(Date.UTC(year, month - 1, day));
  if (
    utcDate.getUTCFullYear() !== year ||
    utcDate.getUTCMonth() !== month - 1 ||
    utcDate.getUTCDate() !== day
  ) return null;

  const timeZone = Session.getScriptTimeZone();
  const todayKey = Utilities.formatDate(new Date(), timeZone, "yyyy-MM-dd");
  if (dateKey > todayKey) return null;

  const todayParts = todayKey.split("-").map(Number);
  const todayUtc = new Date(Date.UTC(todayParts[0], todayParts[1] - 1, todayParts[2]));
  const mondayUtc = new Date(todayUtc);
  mondayUtc.setUTCDate(mondayUtc.getUTCDate() - ((mondayUtc.getUTCDay() + 6) % 7));
  const mondayKey = [
    mondayUtc.getUTCFullYear(),
    String(mondayUtc.getUTCMonth() + 1).padStart(2, "0"),
    String(mondayUtc.getUTCDate()).padStart(2, "0")
  ].join("-");
  if (dateKey < mondayKey) return null;

  // Mediodía evita que la fecha cambie al guardarse en la hoja por diferencias de zona horaria.
  return new Date(year, month - 1, day, 12, 0, 0);
}

const TASK_SCHEDULE_TYPES = [
  "DIARIA",
  "SEMANAL",
  "CADA_X_DIAS",
  "CADA_X_SEMANAS",
  "MENSUAL"
];

function getTaskSchedule(taskId) {
  const row = getProgrammingTable()
    .slice(1)
    .find(row => String(row[0]) === String(taskId));

  if (!row) {
    return {
      taskId: Number(taskId),
      tipo: "",
      intervalo: null,
      diasSemana: "",
      diaMes: null,
      fechaInicio: "",
      activa: true
    };
  }

  return {
    taskId: Number(taskId),
    tipo: row[1] || "",
    intervalo: row[2] !== "" && row[2] !== null ? Number(row[2]) : null,
    diasSemana: row[3] || "",
    diaMes: row[4] !== "" && row[4] !== null ? Number(row[4]) : null,
    fechaInicio: row[5] ? homeFormatDate(homeParseDate(row[5])) : "",
    activa: row[6] !== false
  };
}

function updateTaskSchedule(data) {
  const taskId = String(data.taskId || "");
  if (!taskId) {
    return { success: false, error: "Falta la tarea" };
  }

  const type = String(data.tipo || "");
  if (TASK_SCHEDULE_TYPES.indexOf(type) === -1) {
    return { success: false, error: "Tipo de programación no válido" };
  }

  const interval = Number(data.intervalo) || 0;
  if ((type === "CADA_X_DIAS" || type === "CADA_X_SEMANAS") && interval <= 0) {
    return {
      success: false,
      error: "Indica cada cuántos días/semanas se repite"
    };
  }

  const weekDays = String(data.diasSemana || "");
  if (type === "SEMANAL" && !weekDays) {
    return { success: false, error: "Selecciona al menos un día de la semana" };
  }

  const monthDay = Number(data.diaMes) || 0;
  if (type === "MENSUAL" && (monthDay < 1 || monthDay > 31)) {
    return { success: false, error: "Indica un día del mes válido (1-31)" };
  }

  const startDate = String(data.fechaInicio || "");
  if (
    (type === "CADA_X_DIAS" || type === "CADA_X_SEMANAS") &&
    !/^\d{4}-\d{2}-\d{2}$/.test(startDate)
  ) {
    return { success: false, error: "Indica una fecha de inicio válida" };
  }

  const active = String(data.activa) !== "false";

  const rowValues = [
    Number(taskId),
    type,
    (type === "CADA_X_DIAS" || type === "CADA_X_SEMANAS") ? interval : "",
    type === "SEMANAL" ? weekDays : "",
    type === "MENSUAL" ? monthDay : "",
    (type === "CADA_X_DIAS" || type === "CADA_X_SEMANAS") ? startDate : "",
    active
  ];

  const sheet = getSheet().getSheetByName("Programación");
  const lastRow = sheet.getLastRow();
  const ids = lastRow > 1
    ? sheet.getRange(2, 1, lastRow - 1, 1).getValues()
    : [];

  for (let i = 0; i < ids.length; i++) {
    if (String(ids[i][0]) !== taskId) continue;

    sheet.getRange(i + 2, 1, 1, rowValues.length).setValues([rowValues]);
    invalidateTableCache("Programación");
    return { success: true };
  }

  sheet.appendRow(rowValues);
  invalidateTableCache("Programación");
  return { success: true };
}

// No borra el histórico: RB-013 solo lo exige para tareas sin uso, pero aquí
// se permite siempre y se conserva el histórico (las tareas eliminadas se
// siguen mostrando con su nombre original gracias al registro guardado).
function deleteTask(data) {
  const taskId = String(data.id || "");
  if (!taskId) {
    return { success: false, error: "Falta la tarea" };
  }

  const sheet = getSheet().getSheetByName("Tareas");
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) {
    return { success: false, error: "Task not found" };
  }

  const ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();

  for (let i = 0; i < ids.length; i++) {
    if (String(ids[i][0]) !== taskId) continue;

    sheet.deleteRow(i + 2);
    invalidateTableCache("Tareas");
    removeTaskSchedule(taskId);
    return { success: true };
  }

  return { success: false, error: "Task not found" };
}

function removeTaskSchedule(taskId) {
  const sheet = getSheet().getSheetByName("Programación");
  if (!sheet) return;

  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return;

  const ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();

  for (let i = 0; i < ids.length; i++) {
    if (String(ids[i][0]) !== taskId) continue;

    sheet.deleteRow(i + 2);
    invalidateTableCache("Programación");
    return;
  }
}
