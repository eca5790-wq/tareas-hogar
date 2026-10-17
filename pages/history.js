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
 * Devuelve una página del histórico, de más reciente a más antigua.
 * offset y limit permiten cargar más registros sin enviar toda la hoja.
 */
function getHistoryPage(offset, limit) {
  const safeOffset = Math.max(0, Number(offset) || 0);
  const safeLimit = Math.min(50, Math.max(1, Number(limit) || 20));
  const historyRows = getHistoryRows()
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

function getTaskHistory(taskId) {
  return getHistoryRows()
    .filter(row => String(row[3]) === String(taskId));
}

function getLastTaskExecution(taskId) {
  const history = getTaskHistory(taskId);

  if (history.length === 0) {
    return null;
  }

  return history.reduce((latest, current) => {
    if (!latest) return current;

    return new Date(current[1]) > new Date(latest[1])
      ? current
      : latest;
  }, null);
}

function getTaskExecutions(taskId) {
  return getTaskHistory(taskId).length;
}

// Stats.js usa getWeeklyHistory() para otro cálculo.
function getHistoryLastSevenDays() {
  const today = new Date();

  return getHistoryRows().filter(row => {
    const date = new Date(row[1]);
    const diffDays = Math.floor(
      (today - date) / (1000 * 60 * 60 * 24)
    );

    return diffDays <= 7;
  });
}

function getHistoryByUser(user) {
  return getHistoryRows()
    .filter(row => row[2] === user);
}

function getHistoryByCategory(categoryId) {
  return getHistoryRows()
    .filter(row => String(row[4]) === String(categoryId));
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
