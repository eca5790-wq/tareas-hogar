function getCachedHistory() {
  const cache = CacheService.getScriptCache();
  const cached = cache.get("history");

  if (cached) {
    return JSON.parse(cached);
  }

  const sheet = getSheet().getSheetByName("Histórico");
  const lastRow = sheet.getLastRow();

  if (lastRow <= 1) {
    return [];
  }

  const values = sheet.getRange(2, 1, lastRow - 1, 8).getValues();

  try {
    const serialized = JSON.stringify(values);
    // CacheService admite hasta 100 KB por elemento.
    if (serialized.length <= 90000) {
      cache.put("history", serialized, 60);
    }
  } catch (error) {
    // El histórico se devuelve aunque no pueda guardarse en caché.
  }

  return values;
}

/* Uso por tarea */

function getCategoryUsage() {
  const values = getCachedHistory();
  const usage = {};

  values.forEach(row => {
    const taskId = row[3];
    if (!taskId) return;

    usage[taskId] = (usage[taskId] || 0) + 1;
  });

  return usage;
}

