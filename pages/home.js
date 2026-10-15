import { APP } from "../js/config.js";
import { getHomeData, registerTask, deleteHistory } from "../js/api.js";
import { renderNavbar } from "../components/navbar.js";
import { showToast } from "../components/toast.js";
import { openConfirmDialog } from "../components/dialog.js";

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

const HOME_CACHE_PREFIX = "tareas-hogar-home-v1:";
const HOME_CACHE_MAX_AGE = 24 * 60 * 60 * 1000;

let home = createEmptyHome();
let homeLoadRequest = 0;

function createEmptyHome() {
  return {
    today: [],
    week: { Elena: 0, "Tomás": 0 },
    weekDetails: {
      carryover: { Elena: 0, "Tomás": 0 },
      earned: { Elena: 0, "Tomás": 0 },
      weekStart: "",
      weekEnd: ""
    },
    record: null,
    recent: [],
    stats: {
      weeklyWinners: { Elena: 0, "Tomás": 0 },
      topTasks: [],
      weeklyHistory: []
    }
  };
}

function normalizeHomeData(data) {
  const empty = createEmptyHome();

  if (!data || typeof data !== "object" || data.success === false) {
    throw new Error(data?.error || "Respuesta de Inicio no válida");
  }

  return {
    today: Array.isArray(data.today) ? data.today : empty.today,
    week: {
      Elena: Number(data.week?.Elena) || 0,
      "Tomás": Number(data.week?.["Tomás"]) || 0
    },
    weekDetails: {
      carryover: {
        Elena: Number(data.weekDetails?.carryover?.Elena) || 0,
        "Tomás": Number(data.weekDetails?.carryover?.["Tomás"]) || 0
      },
      earned: {
        Elena: Number(data.weekDetails?.earned?.Elena) || 0,
        "Tomás": Number(data.weekDetails?.earned?.["Tomás"]) || 0
      },
      weekStart: data.weekDetails?.weekStart || "",
      weekEnd: data.weekDetails?.weekEnd || ""
    },
    record: data.record || null,
    recent: Array.isArray(data.recent) ? data.recent : empty.recent,
    stats: {
      weeklyWinners: data.stats?.weeklyWinners || empty.stats.weeklyWinners,
      topTasks: Array.isArray(data.stats?.topTasks)
        ? data.stats.topTasks
        : empty.stats.topTasks,
      weeklyHistory: Array.isArray(data.stats?.weeklyHistory)
        ? data.stats.weeklyHistory
        : empty.stats.weeklyHistory
    }
  };
}

function homeCacheKey(user) {
  return HOME_CACHE_PREFIX + encodeURIComponent(user);
}

function readHomeCache(user) {
  try {
    const saved = localStorage.getItem(homeCacheKey(user));
    if (!saved) return null;

    const entry = JSON.parse(saved);

    if (
      !entry ||
      Date.now() - entry.savedAt > HOME_CACHE_MAX_AGE
    ) {
      localStorage.removeItem(homeCacheKey(user));
      return null;
    }

    return normalizeHomeData(entry.data);
  } catch (error) {
    console.warn("No se pudo leer la caché de Inicio:", error);
    return null;
  }
}

function saveHomeCache(user, data) {
  try {
    localStorage.setItem(
      homeCacheKey(user),
      JSON.stringify({
        savedAt: Date.now(),
        data
      })
    );
  } catch (error) {
    console.warn("No se pudo guardar la caché de Inicio:", error);
  }
}

export async function loadHome() {
  const user = APP.currentUser;
  const requestId = ++homeLoadRequest;
  const cachedHome = readHomeCache(user);

  if (cachedHome) {
    home = cachedHome;
    render();
    initEvents();
  }

  try {
    const freshData = await getHomeData(user);

    if (requestId !== homeLoadRequest || user !== APP.currentUser) {
      return;
    }

    const freshHome = normalizeHomeData(freshData);
    const dataChanged =
      !cachedHome || JSON.stringify(home) !== JSON.stringify(freshHome);

    home = freshHome;
    saveHomeCache(user, home);

    // Evita reiniciar la animación de las barras si los datos no han cambiado.
    if (dataChanged) {
      render();
      initEvents();
    }
  } catch (error) {
    console.error("No se pudo cargar Inicio:", error);

    if (requestId !== homeLoadRequest || user !== APP.currentUser) {
      return;
    }

    if (!cachedHome) {
      home = createEmptyHome();
      render();
      initEvents();
      showToast("No se pudo cargar Inicio");
    }
  }
}

function render() {
  document.getElementById("header").innerHTML = `
    <div class="home-header">
      <div class="home-title">Tareas del hogar</div>

      <button id="profileButton" class="profile-selector">
        ${APP.currentUser}
        <span class="material-symbols-rounded">expand_more</span>
      </button>
    </div>
  `;

  document.getElementById("content").innerHTML = `
    ${competitionSection()}
    ${todaySection()}
    ${recentSection()}
  `;

  renderNavbar("home");
}

function competitionSection() {
  const elenaPoints = home.week.Elena;
  const tomasPoints = home.week["Tomás"];
  const details = home.weekDetails;

  return `
    <section class="home-section">
      <div class="section-title">Competición semanal · lunes a domingo</div>

      <div class="competition-box">
        ${competitionRow("Elena", elenaPoints, tomasPoints, details.carryover.Elena, details.earned.Elena)}
        ${competitionRow("Tomás", tomasPoints, elenaPoints, details.carryover["Tomás"], details.earned["Tomás"])}
        ${recordMini()}
      </div>
    </section>
  `;
}

function competitionRow(name, points, otherPoints, carryover = 0, earned = 0) {
  const MAX_POINTS = 100;
  const width = Math.max(
    8,
    Math.min(100, Math.round((points / MAX_POINTS) * 100))
  );
  const winner = points > otherPoints;

  const detailText = carryover > 0
    ? `${earned} ganados esta semana · +${carryover} de la semana pasada`
    : earned > 0
      ? "Puntos ganados esta semana"
      : "";

  return `
    <div class="competition-row">
      <div class="competition-top">
        <div class="competition-name">
          ${name}
          ${
            winner
              ? `<span class="material-symbols-rounded winner-icon">
                   workspace_premium
                 </span>`
              : ""
          }
        </div>

        <div>
          <div class="competition-score">${points} pts</div>
          ${
            detailText
              ? `<div class="task-points-sub">${detailText}</div>`
              : ""
          }
        </div>
      </div>

      <div class="competition-bar">
        <div class="competition-fill" data-width="${width}"></div>
      </div>
    </div>
  `;
}

function recordMini() {
  if (!home.record) return "";

  return `
    <div class="competition-record">
      <span>
        Récord semanal más reciente · ${home.record.points} pts ·
        ${home.record.user}
      </span>
    </div>
  `;
}

function initEvents() {
  document
    .querySelector(".today-list")
    ?.addEventListener("click", handleTodayClick);

  document
    .querySelector(".recent-list")
    ?.addEventListener("click", handleRecentClick);

  const profileButton = document.getElementById("profileButton");

  if (profileButton) {
    profileButton.onclick = () => {
      const newUser = APP.currentUser === "Tomás" ? "Elena" : "Tomás";
      APP.setCurrentUser(newUser);
      loadHome();
    };
  }

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.querySelectorAll(".competition-fill").forEach(element => {
        element.style.width = element.dataset.width + "%";
      });
    });
  });
}

function handleTodayClick(event) {
  const card = event.target.closest(".today-task");
  if (!card) return;

  const id = card.dataset.id;
  const taskData = home.today.find(task => String(task.id) === id);

  if (!taskData) return;

  card.style.transition = "all .3s ease";
  card.style.transform = "scale(0.96)";
  card.style.opacity = "0.6";

  setTimeout(() => {
    card.style.transform = "translateX(20px)";
    card.style.opacity = "0";
  }, 120);

  showToast("Tarea registrada");

  setTimeout(() => {
    home.today = home.today.filter(task => String(task.id) !== id);

    const newItem = {
      id: "tmp-" + Date.now(),
      nombre: taskData.nombre || "",
      usuario: APP.currentUser,
      fecha: new Date().toISOString(),
      puntos: taskData.puntos || 0,
      categoriaId: taskData.categoriaId
    };

    home.recent.unshift(newItem);
    home.recent = home.recent.slice(0, 5);

    if (APP.currentUser === "Elena") {
      home.week.Elena += taskData.puntos || 0;
      home.weekDetails.earned.Elena += taskData.puntos || 0;
    } else {
      home.week["Tomás"] += taskData.puntos || 0;
      home.weekDetails.earned["Tomás"] += taskData.puntos || 0;
    }

    render();
    initEvents();
  }, 300);

  registerTask(id, APP.currentUser).catch(error => {
    console.error(error);
    showToast("Error al guardar");
  });
}

function todaySection() {
  return `
    <section class="home-section">
      <div class="section-title">Te toca hoy</div>

      <div class="today-list">
        ${
          home.today.length
            ? home.today
                .map(task => {
                  const icon =
                    CATEGORY_ICONS[task.categoriaId] || "category";

                  return `
                    <article class="today-task" data-id="${task.id}">
                      <div class="task-name">
                        <span class="material-symbols-rounded task-icon">
                          ${icon}
                        </span>
                        ${task.nombre}
                      </div>

                      <div class="today-points">${task.puntos} pts</div>
                    </article>
                  `;
                })
                .join("")
            : `<p>No hay tareas para hoy.</p>`
        }
      </div>
    </section>
  `;
}

function handleRecentClick(event) {
  const button = event.target.closest(".delete-btn");
  if (!button) return;

  const item = event.target.closest(".recent-item");
  if (!item) return;

  const id = item.dataset.id;

  openConfirmDialog({
    title: "¿Eliminar este registro?",
    message: "Se quitará del histórico y se actualizarán los puntos de la semana.",
    confirmText: "Eliminar registro",
    onConfirm: () => deleteRecentRecord(id, item)
  });
}

function deleteRecentRecord(id, item) {
  item.style.transition = "all .25s ease";
  item.style.transform = "translateX(20px)";
  item.style.opacity = "0";

  showToast("Registro eliminado");

  setTimeout(() => {
    home.recent = home.recent.filter(record => String(record.id) !== id);

    render();
    initEvents();
  }, 250);

  deleteHistory(id)
    .then(result => {
      if (!result || result.success === false) {
        throw new Error(result?.error || "No se pudo eliminar el registro");
      }
      loadHome();
    })
    .catch(error => {
      console.error(error);
      showToast("Error al eliminar");
      loadHome();
    });
}

function recentSection() {
  return `
    <section class="home-section">
      <div class="section-title">Últimas tareas añadidas</div>

      <div class="recent-list">
        ${
          home.recent.length
            ? home.recent
                .map(item => {
                  const icon =
                    CATEGORY_ICONS[item.categoriaId] || "category";

                  return `
                    <div class="recent-item" data-id="${item.id}">
                      <div class="recent-info">
                        <div class="task-name">
                          <span class="material-symbols-rounded task-icon">
                            ${icon}
                          </span>
                          ${item.nombre}
                        </div>

                        <div class="task-subtitle">
                          ${item.usuario} · ${relativeDate(item.fecha)}
                        </div>

                        <div class="task-subtitle">${item.puntos} pts</div>
                      </div>

                      <div class="recent-actions">
                        <button class="delete-btn">✕</button>
                      </div>
                    </div>
                  `;
                })
                .join("")
            : `<p>No hay actividad reciente.</p>`
        }
      </div>
    </section>
  `;
}

function relativeDate(value) {
  const date = new Date(value);
  const today = new Date();
  const diff = Math.floor((today - date) / 86400000);

  if (diff === 0) return "Hoy";
  if (diff === 1) return "Ayer";

  if (diff < 7) {
    return ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"][
      date.getDay()
    ];
  }

  return date.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short"
  });
}
