import { APP } from "../js/config.js";
import { getHomeData, registerTask, deleteHistory } from "../js/api.js";
import { renderNavbar } from "../components/navbar.js";
import { showToast } from "../components/toast.js";

/* ICONOS POR CATEGORÍA */
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

let home = {};

export async function loadHome() {
    home = await getHomeData(APP.currentUser);
    render();
    initEvents();
}

/* ===========================
   RENDER
=========================== */

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

/* ===========================
   COMPETITION
=========================== */

function competitionSection() {

    const e = home.week.Elena;
    const t = home.week["Tomás"];
    const max = Math.max(e, t, 1);

    return `
        <section class="home-section competition">

            <div class="competition-box">

                <div class="competition-header">
                    Esta semana
                </div>

                ${competitionRow("Elena", e, t, max)}
                ${competitionRow("Tomás", t, e, max)}

                ${recordMini()}

            </div>

        </section>
    `;
}

function competitionRow(name, points, otherPoints, max) {

    const width = Math.max(8, Math.round((points / max) * 100));
    const winner = points > otherPoints;

    return `
        <div class="competition-row">

            <div class="competition-name">

                ${winner ? `
                    <div class="winner-badge">
                        <span class="material-symbols-rounded">
                            emoji_events
                        </span>
                    </div>
                ` : ""}

                ${name}

            </div>

            <div class="competition-bar">
                <div style="width:${width}%"></div>
            </div>

            <div class="competition-points">
                ${points}
            </div>

        </div>
    `;
}

function recordMini() {

    if (!home.record) return "";

    return `
        <div class="competition-record">

            <span>
                Récord semanal (3 meses) · ${home.record.points} pts · ${home.record.user}
            </span>

            <span class="material-symbols-rounded record-icon-right">
                military_tech
            </span>

        </div>
    `;
}

/* ===========================
   EVENTS
=========================== */

function initEvents() {

    document
        .querySelector(".today-list")
        ?.addEventListener("click", handleTodayClick);

    document
        .querySelector(".recent-list")
        ?.addEventListener("click", handleRecentClick);

    document
        .getElementById("profileButton")
        .onclick = () => {

            APP.currentUser =
                APP.currentUser === "Tomás" ? "Elena" : "Tomás";

            loadHome();
        };
}

/* ===========================
   TODAY
=========================== */

function handleTodayClick(e) {

    const card = e.target.closest(".today-task");
    if (!card) return;

    const id = card.dataset.id;

    // obtener datos desde estado (no DOM)
    const taskData = home.today.find(t => String(t.id) === id);

    // animación
    card.style.transition = "all .3s ease";
    card.style.transform = "scale(0.96)";
    card.style.opacity = "0.6";

    setTimeout(() => {
        card.style.transform = "translateX(20px)";
        card.style.opacity = "0";
    }, 120);

    setTimeout(() => card.remove(), 300);

    showToast("Tarea registrada");

    // insertar inmediatamente en recent
    const newItem = {
        id: "tmp-" + Date.now(),
        nombre: taskData?.nombre || "",
        usuario: APP.currentUser,
        fecha: new Date().toISOString(),
        puntos: taskData?.puntos || 0,
        categoriaId: taskData?.categoriaId
    };

    home.recent.unshift(newItem);
    home.recent = home.recent.slice(0, 5);

    // backend + sync parcial
    registerTask(id, APP.currentUser)
        .then(async () => {

            const fresh = await getHomeData(APP.currentUser);

            home.week = fresh.week;
            home.recent = fresh.recent;

            render();
            initEvents();

        })
        .catch(err => {
            console.error(err);
            showToast("Error al guardar");
        });

    home.today = home.today.filter(t => String(t.id) !== id);
}

/* ===========================
   TODAY UI
=========================== */

function todaySection() {

    return `
        <section class="home-section">

            <div class="section-title">
                Hoy
            </div>

            <div class="today-list">

                ${home.today.length
                    ? home.today.map(task => {

                        const icon = CATEGORY_ICONS[task.categoriaId] || "category";

                        return `
                            <article class="today-task" data-id="${task.id}">

                                <div class="task-name">
                                    <span class="material-symbols-rounded task-icon">
                                        ${icon}
                                    </span>
                                    ${task.nombre}
                                </div>

                                <div class="today-points">
                                    ${task.puntos} pts
                                </div>

                            </article>
                        `;
                    }).join("")
                    : `<p>No hay tareas para hoy.</p>`
                }

            </div>

        </section>
    `;
}

/* ===========================
   RECENT
=========================== */

function handleRecentClick(e) {

    const btn = e.target.closest(".delete-btn");
    if (!btn) return;

    const item = e.target.closest(".recent-item");
    if (!item) return;

    const id = item.dataset.id;

    if (!confirm("¿Eliminar este registro?")) return;

    item.style.transition = "all .25s ease";
    item.style.transform = "translateX(20px)";
    item.style.opacity = "0";

    setTimeout(() => item.remove(), 250);

    showToast("Registro eliminado");

    deleteHistory(id)
        .then(async () => {

            const fresh = await getHomeData(APP.currentUser);

            home.week = fresh.week;
            home.recent = fresh.recent;

            render();
            initEvents();

        })
        .catch(err => {
            console.error(err);
            showToast("Error al eliminar");
        });

    home.recent = home.recent.filter(r => String(r.id) !== id);
}

/* ===========================
   RECENT UI
=========================== */

function recentSection() {

    return `
        <section class="home-section">

            <div class="section-title">
                Última actividad
            </div>

            <div class="recent-list">

                ${home.recent.length
                    ? home.recent.map(item => {

                        const icon = CATEGORY_ICONS[item.categoriaId] || "category";

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

                                    <div class="task-subtitle">
                                        ${item.puntos} pts
                                    </div>

                                </div>

                                <div class="recent-actions">
                                    <button class="delete-btn">✕</button>
                                </div>

                            </div>
                        `;
                    }).join("")
                    : `<p>No hay actividad reciente.</p>`
                }

            </div>

        </section>
    `;
}

/* ===========================
   UTILS
=========================== */

function relativeDate(value) {

    const date = new Date(value);
    const today = new Date();

    const diff = Math.floor((today - date) / 86400000);

    if (diff === 0) return "Hoy";
    if (diff === 1) return "Ayer";

    if (diff < 7) {
        return ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"][date.getDay()];
    }

    return date.toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short"
    });
}