import { getHistoryPage } from "../js/api.js";
import { navigate } from "../js/router.js";
import { renderNavbar } from "../components/navbar.js";

const PAGE_SIZE = 20;

let historyItems = [];
let nextOffset = 0;
let hasMore = true;
let loading = false;
let errorMessage = "";
let requestId = 0;

export async function loadHistory() {
  requestId++;
  historyItems = [];
  nextOffset = 0;
  hasMore = true;
  loading = true;
  errorMessage = "";
  render();
  await fetchNextPage(requestId);
}

async function fetchNextPage(activeRequestId = requestId) {
  if (loading && nextOffset > 0) return;

  const requestedOffset = nextOffset;
  loading = true;
  errorMessage = "";
  render();

  try {
    const result = await getHistoryPage(requestedOffset, PAGE_SIZE);
    if (activeRequestId !== requestId) return;
    if (!result || !Array.isArray(result.items)) {
      throw new Error(result?.error || "Respuesta del historial no válida");
    }

    historyItems = historyItems.concat(result.items);
    nextOffset = Number(result.nextOffset) || requestedOffset + result.items.length;
    hasMore = Boolean(result.hasMore);
  } catch (error) {
    console.error("No se pudo cargar el historial:", error);
    errorMessage = "No se pudo cargar el historial. Comprueba la conexión y vuelve a intentarlo.";
  } finally {
    if (activeRequestId === requestId) {
      loading = false;
      render();
    }
  }
}

function render() {
  document.getElementById("header").innerHTML = `
    <div class="history-header">
      <button class="history-back" id="historyBackButton" type="button" aria-label="Volver a Inicio">
        <span class="material-symbols-rounded" aria-hidden="true">arrow_back</span>
      </button>
      <div>
        <h2>Historial</h2>
        <p>Tareas registradas, de más recientes a más antiguas</p>
      </div>
    </div>
  `;

  document.getElementById("content").innerHTML = `
    <section class="home-section history-section">
      ${historyItems.length
        ? `<div class="history-list">${historyItems.map(historyItem).join("")}</div>`
        : loading
          ? `<p class="history-message">Cargando historial…</p>`
          : errorMessage
            ? `<p class="history-message">${escapeHTML(errorMessage)}</p>`
            : `<p class="history-message">Todavía no hay tareas registradas.</p>`
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
        ? `<button class="history-more" id="historyMoreButton" type="button" ${loading ? "disabled" : ""}>${loading ? "Cargando…" : "Cargar 20 más"}</button>`
        : ""
      }
      ${!hasMore && historyItems.length
        ? `<p class="history-end">Has llegado al principio del historial.</p>`
        : ""
      }
    </section>
  `;

  renderNavbar("home");
  document.getElementById("historyBackButton")?.addEventListener("click", () => navigate("home"));
  document.getElementById("historyMoreButton")?.addEventListener("click", () => fetchNextPage());
  document.getElementById("historyRetryButton")?.addEventListener("click", () => fetchNextPage());
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
      <div class="history-item-icon material-symbols-rounded" aria-hidden="true">${icon}</div>
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