const API_URL =
  "https://script.google.com/macros/s/AKfycbwlc0_mddzrLtEwm_KqA30SJhkBE15_Evdbshgs3_QtQeCO_-Y-kgBrtp0Rq8P8DjhU/exec";

const API_CACHE_PREFIX = "tareas-hogar-api-v1:";
const API_CACHE_TTL_MS = 15 * 1000;

const memoryCache = new Map();
let jsonpRequestId = 0;

const CACHEABLE_ACTIONS = new Set([
  "home",
  "registerScreen",
  "tasks",
  "categories"
]);

function makeCacheKey(action, params) {
  return `${API_CACHE_PREFIX}${action}:${JSON.stringify(params)}`;
}

function readCache(key) {
  const memoryValue = memoryCache.get(key);

  if (memoryValue && Date.now() - memoryValue.savedAt < API_CACHE_TTL_MS) {
    return memoryValue.data;
  }

  try {
    const saved = localStorage.getItem(key);
    if (!saved) return null;

    const entry = JSON.parse(saved);

    if (!entry || Date.now() - entry.savedAt >= API_CACHE_TTL_MS) {
      localStorage.removeItem(key);
      return null;
    }

    memoryCache.set(key, entry);
    return entry.data;
  } catch (error) {
    console.warn("No se pudo leer la caché de la API:", error);
    return null;
  }
}

function writeCache(key, data) {
  const entry = {
    savedAt: Date.now(),
    data
  };

  memoryCache.set(key, entry);

  try {
    localStorage.setItem(key, JSON.stringify(entry));
  } catch (error) {
    console.warn("No se pudo guardar la caché de la API:", error);
  }
}

export function clearCache() {
  memoryCache.clear();

  try {
    const keysToRemove = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);

      if (key && key.startsWith(API_CACHE_PREFIX)) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach(key => localStorage.removeItem(key));
  } catch (error) {
    console.warn("No se pudo vaciar la caché de la API:", error);
  }
}

async function request(action, params = {}) {
  const canCache = CACHEABLE_ACTIONS.has(action);
  const cacheKey = canCache ? makeCacheKey(action, params) : null;

  if (canCache) {
    const cachedData = readCache(cacheKey);
    if (cachedData !== null) return cachedData;
  }

  const query = new URLSearchParams({
    action,
    ...params,
    t: Date.now()
  });

  const response = await fetch(`${API_URL}?${query}`, {
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const data = await response.json();

  if (canCache) {
    writeCache(cacheKey, data);
  }

  return data;
}

/* Consultas */

export function getHomeData(user) {
  return request("home", { user });
}

export function getRegisterScreen(user) {
  return request("registerScreen", { user });
}

export function getTasks() {
  return request("tasks");
}

export function getCategories() {
  return request("categories");
}

export function getPointsConfiguration() {
  return request("pointsConfiguration");
}

export function getHistoryExport() {
  return request("exportHistory");
}

export function getHistoryPage(offset = 0, limit = 20) {
  return requestJSONP("historyPage", { offset, limit });
}

// Apps Script ContentService no entrega cabeceras CORS para fetch desde GitHub Pages.
// Para esta consulta de solo lectura usamos JSONP mediante una etiqueta <script>.
function requestJSONP(action, params = {}) {
  return new Promise((resolve, reject) => {
    const callbackName = `__tareasHogarJsonp_${Date.now()}_${++jsonpRequestId}`;
    const script = document.createElement("script");
    let settled = false;

    const cleanup = () => {
      window.clearTimeout(timeoutId);
      delete window[callbackName];
      script.remove();
    };

    const finish = (handler, value) => {
      if (settled) return;
      settled = true;
      cleanup();
      handler(value);
    };

    const timeoutId = window.setTimeout(() => {
      finish(
        reject,
        new Error("Tiempo de espera agotado. Comprueba el despliegue de Apps Script.")
      );
    }, 15000);

    window[callbackName] = data => finish(resolve, data);
    script.onerror = () => finish(reject, new Error("No se pudo cargar la respuesta de Apps Script."));

    const query = new URLSearchParams({
      action,
      ...params,
      callback: callbackName,
      t: Date.now()
    });

    script.async = true;
    script.src = `${API_URL}?${query}`;
    document.head.appendChild(script);
  });
}

/* Cambios */

export async function registerTask(taskId, user, date) {
  const result = await request("registerTask", {
    taskId,
    user,
    date
  });

  clearCache();
  return result;
}

export async function deleteHistory(id) {
  const result = await request("deleteHistory", { id });

  clearCache();
  return result;
}

export async function createTask(task) {
  const result = await request("createTask", {
    nombre: task.nombre,
    categoriaId: task.categoriaId,
    puntos: task.puntos
  });

  clearCache();
  return result;
}

export async function updateTask(task) {
  const result = await request("updateTask", {
    id: task.id,
    nombre: task.nombre,
    categoriaId: task.categoriaId,
    puntos: task.puntos
  });

  clearCache();
  return result;
}

export async function createCategory(category) {
  const result = await request("createCategory", {
    nombre: category.nombre,
    icono: category.icono || "",
    color: category.color || ""
  });

  clearCache();
  return result;
}

export async function updateCategory(category) {
  const result = await request("updateCategory", {
    id: category.id,
    nombre: category.nombre,
    icono: category.icono || "",
    color: category.color || ""
  });

  clearCache();
  return result;
}

export async function updatePointsConfiguration(config) {
  const result = await request("updatePointsConfiguration", {
    bonusDays: config.bonusDays,
    bonusPoints: config.bonusPoints,
    maxBonus: config.maxBonus
  });

  clearCache();
  return result;
}