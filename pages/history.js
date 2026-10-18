import { getHistoryPage } from "../js/api.js";
import { navigate } from "../js/router.js";
import { renderNavbar } from "../components/navbar.js";

const PAGE_SIZE = 20;
const HISTORY_CACHE_KEY = "tareas-hogar-history:two-weeks:v2";
const HISTORY_CACHE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

let historyItems = [];
let nextOffset = 0;
let hasMore = true;
let loading = false;
let refreshingFirstPage = false;
let errorMessage = "";
let requestId = 0;
let failedOffset = 0;

export async function loadHistory() {
  const activeRequestId = ++requestId;
  const cachedPage = readCachedFirstPage();

  historyItems = cachedPage ? cachedPage.items : [];
  nextOffset = cachedPage ? cachedPage.nextOffset : 0;
  hasMore = cachedPage ? cachedPage.hasMore : true;
  loading = true;
  refreshingFirstPage = Boolean(cachedPage);
  errorMessage = "";
  failedOffset = 0;

  renderShell();
  renderContent();

  await fetchPage(0, {
    activeRequestId,
    replace: true,
    renderAtStart: false
  });
}

async function fetchPage(
  offset,
  { activeRequestId = requestId, replace = false, renderAtStart = true } = {}
) {
  if (loading && !replace) return;

  loading = true;
  refreshingFirstPage = replace && historyItems.length > 0;
  errorMessage = "";

  if (renderAtStart) renderContent();

  try {
    const result = await getHistoryPage(offset, PAGE_SIZE);

    if (activeRequestId !== requestId) return;
    if (!result || !Array.isArray(result.items)) {
      throw new Error(result?.error || "Respuesta del historial no válida");
    }

    if (replace) {
      historyItems = result.items;
      writeCachedFirstPage(result);
    } else {
      historyItems = historyItems.concat(result.items);
    }

    const returnedOffset = Number(result.nextOffset);
    nextOffset = Number.isFinite(returnedOffset)
      ? returnedOffset
      : offset + result.items.length;
    hasMore = Boolean(result.hasMore);
    failedOffset = nextOffset;
  } catch (error) {
    if (activeRequestId !== requestId) return;

    console.error("No se pudo cargar el historial:", error);
    failedOffset = offset;
    errorMessage = "No se pudo cargar el historial. Comprueba la conexión y vuelve a intentarlo.";
  } finally {
    if (activeRequestId === requestId) {
      loading = false;
      refreshingFirstPage = false;
      renderContent();
    }
  }
}

function readCachedFirstPage() {
  try {
    const saved = localStorage.getItem(HISTORY_CACHE_KEY);
    if (!saved) return null;

    const entry = JSON.parse(saved);
    const age = Date.now() - Number(entry?.savedAt);

    if (
      !entry ||
      !Array.isArray(entry.items) ||
      !Number.isFinite(age) ||
      age < 0 ||
      age > HISTORY_CACHE_MAX_AGE_MS
    ) {
      localStorage.removeItem(HISTORY_CACHE_KEY);
      return null;
    }

    return {
      items: entry.items.filter(item => isWithinCurrentAndPreviousWeek(item.fecha)),
      nextOffset: Number(entry.nextOffset) || entry.items.length,
      hasMore: Boolean(entry.hasMore)
    };
  } catch (error) {
    console.warn("No se pudo leer la caché del historial:", error);
    return null;
  }
}


function isWithinCurrentAndPreviousWeek(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;

  const today = new Date();
  const currentWeekStart = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );
  const daysSinceMonday = (currentWeekStart.getDay() + 6) % 7;
  currentWeekStart.setDate(currentWeekStart.getDate() - daysSinceMonday);

  const windowStart = new Date(currentWeekStart);
  windowStart.setDate(windowStart.getDate() - 7);
  const windowEnd = new Date(currentWeekStart);
  windowEnd.setDate(windowEnd.getDate() + 7);

  return date >= windowStart && date < windowEnd;
}

function writeCachedFirstPage(result) {
  const returnedOffset = Number(result.nextOffset);
  const entry = {
    savedAt: Date.now(),
    items: result.items,
    nextOffset: Number.isFinite(returnedOffset)
      ? returnedOffset
      : result.items.length,
    hasMore: Boolean(result.hasMore)
  };

  try {
    localStorage.setItem(HISTORY_CACHE_KEY, JSON.stringify(entry));
  } catch (error) {
    console.warn("No se pudo guardar la caché del historial:", error);
  }
}

function retryLoading() {
  fetchPage(failedOffset, {
    activeRequestId: requestId,
    replace: failedOffset === 0,
    renderAtStart: true
  });
}

function renderShell() {
  document.getElementById("header").innerHTML = `
    <div class="history-header">
      <button class="history-back" id="historyBackButton" type="button" aria-label="Volver a Inicio">
        <span class="material-symbols-rounded" aria-hidden="true">arrow_back</span>
      </button>
      <div>
        <h2>Historial</h2>
        <p>Tareas de esta semana y la anterior</p>
      </div>
    </div>
  `;

  renderNavbar("home");
  document.getElementById("historyBackButton")?.addEventListener("click", () => navigate("home"));
}

function renderContent() {
  document.getElementById("content").innerHTML = `
    <section class="home-section history-section">
      ${historyItems.length
        ? `<div class="history-list">${historyItems.map(historyItem).join("")}</div>`
        : loading
          ? `<p class="history-message">Cargando historial…</p>`
          : errorMessage
            ? `<p class="history-message">${escapeHTML(errorMessage)}</p>`
            : `<p class="history-message">No hay tareas registradas esta semana ni la anterior.</p>`
      }
      ${errorMessage && historyItems.length
        ? `<p class="history-message history-error">${escapeHTML(errorMessage)}</p>`
        : ""
      }
      ${errorMessage
        ? `<button class="history-more" id="historyRetryButton" type="button">Reintentar</button>`
        : ""
      }
      ${historyItems.length > 0 && hasMore && !errorMessage
        ? `<button class="history-more" id="historyMoreButton" type="button" ${loading ? "disabled" : ""}>${loading && !refreshingFirstPage ? "Cargando…" : "Cargar 20 más"}</button>`
        : ""
      }
      ${!hasMore && historyItems.length
        ? `<p class="history-end">Has llegado al final de estas dos semanas.</p>`
        : ""
      }
    </section>
  `;

  document.getElementById("historyMoreButton")?.addEventListener("click", () => {
    fetchPage(nextOffset, {
      activeRequestId: requestId,
      renderAtStart: true
    });
  });
  document.getElementById("historyRetryButton")?.addEventListener("click", retryLoading);
}

function historyItem(item) {
  const icon = {
    1: "restaurant",
    2: "weekend",
    3: "bed",
    4: "bathtub",
    5: "local_laundry_service",
    6: "cleaning_services",
    7: "shopping_cart",
    8: "pets"
  }[String(item.categoriaId)] || "category";
  const personClass = item.usuario === "Elena" ? "elena" : "tomas";

  return `
    <article class="history-item history-item--${personClass}">
      <div class="history-item-icon history-item-icon--${personClass} material-symbols-rounded" aria-hidden="true">${icon}</div>
      <div class="history-item-info">
        <div class="history-item-name">${escapeHTML(item.nombre || "Tarea")}</div>
        <div class="history-item-meta">
          <span class="history-person history-person--${personClass}">${escapeHTML(item.usuario || "")}</span>
          <span>${escapeHTML(formatDate(item.fecha))}</span>
        </div>
      </div>
      <strong class="history-item-points">${Number(item.puntos) || 0} pts</strong>
    </article>
  `;
}

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(date);
}

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
}