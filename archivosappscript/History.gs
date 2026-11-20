function getHistory() {
  return getHistoryTable();
}

function getHistoryExport() {
  const values = getHistoryTable();

  return {
    success: true,
    headers: values.length ? values[0] : [],
    rows: values.slice(1).filter(row => row[3])
  };
}

/**
 * Devuelve únicamente el historial de la semana actual y la anterior,
 * de más reciente a más antiguo. Las semanas van de lunes a domingo.
 */
function getHistoryPage(offset, limit) {
  const safeOffset = Math.max(0, Number(offset) || 0);
  const safeLimit = Math.min(50, Math.max(1, Number(limit) || 20));
  const window = historyGetTwoWeekWindow(new Date());

  const historyRows = getHistoryRows()
    .filter(row => {
      const dateKey = historyGetDateKey(row[1], window.timeZone);
      return dateKey && dateKey >= window.startKey && dateKey < window.endKey;
    })
    .slice()
    .reverse();

  const pageRows = historyRows.slice(safeOffset, safeOffset + safeLimit);
  const taskRows = getTasksTable().slice(1);
  const categoryRows = getCategoriesTable().slice(1);
  const tasksById = Object.create(null);
  const categoriesById = Object.create(null);

  taskRows.forEach(row => {
    tasksById[String(row[0])] = {
      nombre: row[1],
      categoriaId: row[2]
    };
  });

  categoryRows.forEach(row => {
    categoriesById[String(row[0])] = row[1];
  });

  return {
    items: pageRows.map(row => {
      const task = tasksById[String(row[3])];
      const categoryId = task ? task.categoriaId : row[4];

      return {
        id: row[0],
        fecha: row[1],
        usuario: row[2],
        tareaId: row[3],
        nombre: task ? task.nombre : String(row[3]),
        categoriaId: categoryId,
        categoria: categoriesById[String(categoryId)] || "General",
        puntos: Number(row[7]) || 0
      };
    }),
    offset: safeOffset,
    limit: safeLimit,
    nextOffset: safeOffset + pageRows.length,
    hasMore: safeOffset + pageRows.length < historyRows.length
  };
}

/**
 * Calcula el intervalo [lunes de la semana pasada, lunes de la semana próxima)
 * usando la zona horaria configurada en el proyecto de Apps Script.
 */
function historyGetTwoWeekWindow(now) {
  const timeZone = Session.getScriptTimeZone() || "Europe/Madrid";
  const todayKey = Utilities.formatDate(now, timeZone, "yyyy-MM-dd");
  const parts = todayKey.split("-").map(Number);
  const todayUtc = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
  const daysSinceMonday = (todayUtc.getUTCDay() + 6) % 7;

  const currentMonday = new Date(todayUtc);
  currentMonday.setUTCDate(currentMonday.getUTCDate() - daysSinceMonday);

  const previousMonday = new Date(currentMonday);
  previousMonday.setUTCDate(previousMonday.getUTCDate() - 7);

  const nextMonday = new Date(currentMonday);
  nextMonday.setUTCDate(nextMonday.getUTCDate() + 7);

  return {
    startKey: Utilities.formatDate(previousMonday, "UTC", "yyyy-MM-dd"),
    endKey: Utilities.formatDate(nextMonday, "UTC", "yyyy-MM-dd"),
    timeZone
  };
}

function historyGetDateKey(value, timeZone) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return Utilities.formatDate(date, timeZone, "yyyy-MM-dd");
}

function deleteHistory(data) {
  const sheet = getSheet().getSheetByName("Histórico");
  const lastRow = sheet.getLastRow();

  if (lastRow <= 1) {
    return { success: false };
  }

  const ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();

  for (let i = 0; i < ids.length; i++) {
    if (String(ids[i][0]) === String(data.id)) {
      sheet.deleteRow(i + 2);
      CacheService.getScriptCache().remove("history");

      return { success: true };
    }
  }

  return { success: false };
}

function getHistoryRows() {
  return getHistory()
    .slice(1)
    .filter(row => row[3]);
}

function saveHistory(record) {
  const sheet = getSheet().getSheetByName("Histórico");
  const lastRow = sheet.getLastRow();

  const ids = lastRow > 1
    ? sheet.getRange(2, 1, lastRow - 1, 1).getValues()
    : [];

  let maxId = 0;

  for (let i = 0; i < ids.length; i++) {
    maxId = Math.max(maxId, Number(ids[i][0]) || 0);
  }

  const id = maxId + 1;

  sheet.appendRow([
    id,
    record.fecha,
    record.usuarioId,
    record.tareaId,
    record.categoriaId,
    record.puntosBase,
    record.bonus,
    record.puntosFinales,
    record.comentario || "",
    record.origen || "manual"
  ]);

  CacheService.getScriptCache().remove("history");
}