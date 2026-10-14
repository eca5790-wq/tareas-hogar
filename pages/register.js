import { renderNavbar } from "../components/navbar.js";
import { registerTask, getRegisterScreen } from "../js/api.js";
import { APP } from "../js/config.js";
import { showToast } from "../components/toast.js";
import { loadHome } from "./home.js";

const CATEGORY_ICONS = {
  1: "restaurant",
  2: "weekend",
  3: "bed",
  4: "bathtub",
  5: "local_laundry_service",
  6: "cleaning_services",
  7: "shopping_cart",
  8: "pets"
};

const REGISTER_CACHE_PREFIX = "tareas-hogar-api-v1:registerScreen:";
const REGISTER_CACHE_MAX_AGE = 24 * 60 * 60 * 1000;

let screenData = createEmptyScreenData();
let registerLoadRequest = 0;
let isLoading = false;

function createEmptyScreenData() {
  return {
    frequent: [],
    today: [],
    categories: []
  };
}

function normalizeScreenData(data) {
  if (!data || typeof data !== "object" || data.success === false) {
    throw new Error(data?.error || "Respuesta de Registro no válida");
  }

  return {
    frequent: Array.isArray(data.frequent) ? data.frequent : [],
    today: Array.isArray(data.today) ? data.today : [],
    categories: Array.isArray(data.categories) ? data.categories : []
  };
}

function readRegisterCache(user) {
  const key =
    REGISTER_CACHE_PREFIX + JSON.stringify({ user });

  try {
    const saved = localStorage.getItem(key);
    if (!saved) return null;

    const entry = JSON.parse(saved);

    if (
      !entry ||
      !entry.savedAt ||
      Date.now() - entry.savedAt > REGISTER_CACHE_MAX_AGE
    ) {
      return null;
    }

    return normalizeScreenData(entry.data);
  } catch (error) {
    console.warn("No se pudo leer la caché de Registro:", error);
    return null;
  }
}

export async function loadRegister() {
  const user = APP.currentUser;
  const requestId = ++registerLoadRequest;
  const cachedData = readRegisterCache(user);

  screenData = cachedData || createEmptyScreenData();
  isLoading = !cachedData;

  renderPage();
  renderScreen(getFilteredData());
  renderNavbar("register");
  initEvents();

  try {
    const response = await getRegisterScreen(user);

    if (requestId !== registerLoadRequest || user !== APP.currentUser) {
      return;
    }

    screenData = normalizeScreenData(response);
    isLoading = false;

    renderScreen(getFilteredData());
  } catch (error) {
    console.error("No se pudo cargar Registro:", error);

    if (requestId !== registerLoadRequest || user !== APP.currentUser) {
      return;
    }

    isLoading = false;
    renderScreen(getFilteredData());

    showToast(
      cachedData
        ? "No se pudieron actualizar las tareas"
        : "No se pudieron cargar las tareas"
    );
  }
}

function renderPage() {
  document.getElementById("header").innerHTML = `
    <h2>Registrar</h2>
  `;

  document.getElementById("content").innerHTML = `
    <div class="search-box">
      <span class="material-symbols-rounded">search</span>

      <input
        id="searchTask"
        class="search-input"
        type="text"
        placeholder="Buscar una tarea..."
      >
    </div>

    <div id="taskContainer"></div>
  `;
}

function initEvents() {
  document
    .getElementById("searchTask")
    ?.addEventListener("input", search);

  document
    .getElementById("taskContainer")
    ?.addEventListener("click", handleTaskClick);
}

function search(event) {
  const text = event.target.value.trim().toLowerCase();
  renderScreen(getFilteredData(text));
}

function getFilteredData(searchText = "") {
  if (!searchText) return screenData;

  return {
    ...screenData,
    categories: screenData.categories
      .map(category => ({
        ...category,
        tareas: (category.tareas || []).filter(task =>
          String(task.nombre || "").toLowerCase().includes(searchText)
        )
      }))
      .filter(category => category.tareas.length)
  };
}

function renderScreen(data) {
  const container = document.getElementById("taskContainer");
  if (!container) return;

  if (!data.categories.length) {
    container.innerHTML = isLoading
      ? `<p>Cargando tareas...</p>`
      : `<p>No hay tareas disponibles.</p>`;
    return;
  }

  container.innerHTML = data.categories.map(renderCategory).join("");
}

function renderCategory(category) {
  const icon = CATEGORY_ICONS[category.id] || "category";

  return `
    <section class="card">
      <h3 class="category-title">
        <span class="material-symbols-rounded category-icon">
          ${icon}
        </span>
        ${category.nombre}
      </h3>

      <div class="card-content">
        ${(category.tareas || []).map(renderTask).join("")}
      </div>
    </section>
  `;
}

function renderTask(task) {
  return `
    <div class="task-item" data-id="${task.id}">
      <div>
        <div class="task-name">${task.nombre}</div>
      </div>

      <div class="task-points">+${task.puntos}</div>
    </div>
  `;
}

function handleTaskClick(event) {
  const item = event.target.closest(".task-item");
  if (!item || item.dataset.pending === "true") return;

  const id = item.dataset.id;
  item.dataset.pending = "true";
  item.style.pointerEvents = "none";
  item.style.transition = "all .25s ease";
  item.style.transform = "scale(0.96)";
  item.style.opacity = "0.6";

  setTimeout(() => {
    item.style.transform = "scale(1.05)";
    item.style.opacity = "0";
  }, 120);

  showToast("Tarea registrada");

  registerTask(id, APP.currentUser)
    .then(result => {
      if (result?.success === false) {
        throw new Error(result.error || "No se pudo registrar la tarea");
      }
    })
    .catch(error => {
      console.error(error);
      showToast("Error al guardar");
    });

  setTimeout(() => {
    loadHome();
  }, 300);
}