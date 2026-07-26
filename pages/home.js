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

function render() {

    document.getElementById("header").innerHTML = `
        <div class="home-header">

            <div class="home-title">
                Tareas del hogar
            </div>

            <button id="profileButton" class="profile-selector">
                ${APP.currentUser}
                <span class="material-symbols-rounded">
                    expand_more
                </span>
            </button>

        </div>
    `;

    document.getElementById("content").innerHTML = `
        ${todaySection()}
        ${weekSection()}
        ${recordSection()}
        ${recentSection()}
    `;

    renderNavbar("home");
}

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

            const next =
                APP.currentUser === "Tomás"
                    ? "Elena"
                    : "Tomás";

            APP.currentUser = next;

            loadHome();

        };
}

/* ===========================
   TODAY
=========================== */

async function handleTodayClick(e) {

    const card = e.target.closest(".today-task");
    if (!card) return;

    try {

        await registerTask(card.dataset.id, APP.currentUser);

        card.classList.add("completed");

        showToast("Tarea registrada");

        setTimeout(() => {

            card.remove();

            if (!document.querySelector(".today-task")) {

                document.querySelector(".today-list").innerHTML = `
                    <p>No hay tareas para hoy.</p>
                `;

            }

        }, 350);

    } catch (error) {

        console.error(error);
        showToast("No se ha podido registrar la tarea.");

    }
}

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
   WEEK
=========================== */

function weekSection() {

    const score = home.week;

    return `
        <section class="home-section">

            <div class="section-title">
                Esta semana
            </div>

            ${weekRow("Elena", score.Elena)}
            ${weekRow("Tomás", score["Tomás"])}

        </section>
    `;
}

function weekRow(name, points) {

    const MAX_POINTS = 100;

    const width = Math.max(
        8,
        Math.min(
            100,
            Math.round((points / MAX_POINTS) * 100)
        )
    );

    return `
        <div class="week-row">

            <div class="week-name">
                ${name}
            </div>

            <div class="week-progress">
                <div class="week-bar" style="width:${width}%"></div>
            </div>

            <div class="week-points">
                ${points}
            </div>

        </div>
    `;
}

/* ===========================
   RECORD
=========================== */

function recordSection() {

    if (!home.record) return "";

    return `
        <section class="home-section">

            <div class="section-title">
                Récord reciente
            </div>

            <div class="record-box">

                <div class="record-left">

                    <span class="material-symbols-rounded record-icon">
                        emoji_events
                    </span>

                    <span class="record-points">
                        ${home.record.points} pts
                    </span>

                </div>

                <div class="record-user">
                    ${home.record.user}
                </div>

            </div>

        </section>
    `;
}

/* ===========================
   RECENT
=========================== */

async function handleRecentClick(e) {

    const btn = e.target.closest(".delete-btn");
    if (!btn) return;

    const item = e.target.closest(".recent-item");
    if (!item) return;

    if (!confirm("¿Eliminar este registro?")) return;

    try {

        await deleteHistory(item.dataset.id);

        item.remove();

        showToast("Registro eliminado");

    } catch (e) {

        console.error(e);
        showToast("Error al eliminar");

    }
}

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

                                </div>

                                <div class="recent-actions">

                                    <span class="today-points">
                                        ${item.puntos} pts
                                    </span>

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