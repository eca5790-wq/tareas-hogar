import { APP } from "../js/config.js";
import { getHomeData, registerTask } from "../js/api.js";
import { renderNavbar } from "../components/navbar.js";
import { showToast } from "../components/toast.js";

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
        ${recentSection()}
    `;

    renderNavbar("home");
}

function initEvents() {

    document
        .querySelector(".today-list")
        ?.addEventListener("click", handleTodayClick);

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

async function handleTodayClick(e) {

    const card = e.target.closest(".today-task");

    if (!card) return;

    try {

        await registerTask(
            card.dataset.id,
            APP.currentUser
        );

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
                    ? home.today.map(task => `

                        <article
                            class="today-task"
                            data-id="${task.id}"
                        >

                            <div class="task-name">
                                ${task.nombre}
                            </div>

                            <div class="today-points">
                                ${task.puntos} pts
                            </div>

                        </article>

                    `).join("")
                    : `
                        <p>No hay tareas para hoy.</p>
                    `
                }

            </div>

        </section>
    `;
}

function weekSection() {

    const score = home.week;

    const max = Math.max(
        score.Elena,
        score["Tomás"],
        1
    );

    return `
        <section class="home-section">

            <div class="section-title">
                Esta semana
            </div>

            ${weekRow("Elena", score.Elena, max)}
            ${weekRow("Tomás", score["Tomás"], max)}

        </section>
    `;
}

function weekRow(name, points, max) {

    const width = Math.max(8, Math.round((points / max) * 100));

    return `
        <div class="week-row">

            <div class="week-name">
                ${name}
            </div>

            <div class="week-progress">
                <div
                    class="week-bar"
                    style="width:${width}%"
                ></div>
            </div>

            <div class="week-points">
                ${points}
            </div>

        </div>
    `;
}

function recentSection() {

    return `
        <section class="home-section">

            <div class="section-title">
                Última actividad
            </div>

            <div class="recent-list">

                ${home.recent.length
                    ? home.recent.map(item => `

                        <div class="recent-item">

                            <div>

                                <div class="task-name">
                                    ${item.nombre}
                                </div>

                                <div class="task-subtitle">
                                    ${item.usuario} · ${relativeDate(item.fecha)}
                                </div>

                            </div>

                            <div class="today-points">
                                ${item.puntos} pts
                            </div>

                        </div>

                    `).join("")
                    : `
                        <p>No hay actividad reciente.</p>
                    `
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
        return ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"][date.getDay()];
    }

    return date.toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short"
    });
}