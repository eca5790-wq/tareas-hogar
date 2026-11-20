var TABLE_CACHE_PREFIX = "table:v1:";
var TABLE_CACHE_TTL_SECONDS = 300;
var CACHEABLE_TABLES = [
  "Tareas",
  "Categorías",
  "Programación",
  "Configuración"
];

function getTable(name) {
  var cacheable = CACHEABLE_TABLES.indexOf(name) !== -1;
  var cache = CacheService.getScriptCache();
  var cacheKey = TABLE_CACHE_PREFIX + name;

  if (cacheable) {
    var cached = cache.get(cacheKey);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (error) {
        cache.remove(cacheKey);
      }
    }
  }

  var sheet = getSheet().getSheetByName(name);
  if (!sheet) {
    throw new Error("No existe la hoja: " + name);
  }

  var values = sheet.getDataRange().getValues();

  // Apps Script limita cada elemento de caché a 100 KB.
  if (cacheable) {
    try {
      var serialized = JSON.stringify(values);
      if (serialized.length <= 90000) {
        cache.put(cacheKey, serialized, TABLE_CACHE_TTL_SECONDS);
      }
    } catch (error) {
      // Si la caché no está disponible o el contenido no cabe,
      // se devuelve igualmente el resultado leído de Sheets.
    }
  }

  return values;
}

function invalidateTableCache(name) {
  if (CACHEABLE_TABLES.indexOf(name) !== -1) {
    CacheService.getScriptCache().remove(TABLE_CACHE_PREFIX + name);
  }
}

function getTasksTable() {

  return getTable("Tareas");

}

function getHistoryTable() {

  return getTable("Histórico");

}

function getCategoriesTable() {

  return getTable("Categorías");

}

function getProgrammingTable() {

  return getTable("Programación");

}

function getConfigurationTable() {

  return getTable("Configuración");

}
