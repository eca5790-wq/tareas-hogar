import { APP } from "../js/config.js";
import { getHomeData } from "../js/api.js";
import { renderNavbar } from "../components/navbar.js";

let stats = {};

export async function loadStats() {

    stats = await getHomeData(APP.currentUser);

    render();
}

function render() {

    document.getElementById("header").innerHTML = `
        <h2>Estadísticas</h2>
    `;

    document.getElementById("content").innerHTML = `
        ${weeklyWinners()}
        ${weeklyHistory()}
        ${topTasks()}
    `;

    renderNavbar("stats");
}

/* ===========================
   SEMANAS GANADAS
=========================== */

function weeklyWinners() {

    if (!stats.stats?.weeklyWinners) return "";

    const w = stats.stats.weeklyWinners;

    return `
        <section class="home-section">

            <div class="section-title">
                Semanas ganadas
            </div>

            <div class="stats-summary">

                <div>
                    Elena<br>
                    <strong>${w.Elena}</strong>
                </div>

                <div>
                    Tomás<br>
                    <strong>${w["Tomás"]}</strong>
                </div>

            </div>

        </section>
    `;
}

/* ===========================
   HISTÓRICO SEMANAL
=========================== */

function weeklyHistory() {

    if (!stats.stats?.weeklyHistory) return "";

    return `
        <section class="home-section">

            <div class="section-title">
                Últimas semanas
            </div>

            <div class="stats-list">

                ${stats.stats.weeklyHistory.map(w => `
                    <div class="stats-row">

                        <span>${w.week}</span>

                        <strong>
                            ${w.winner || "-"}
                        </strong>

                    </div>
                `).join("")}

            </div>

        </section>
    `;
}

/* ===========================
   TOP TAREAS
=========================== */

function topTasks() {

    if (!stats.stats?.topTasks) return "";

    return `
        <section class="home-section">

            <div class="section-title">
                Tareas más realizadas
            </div>

            <div class="stats-list">

                ${stats.stats.topTasks.map(t => `
                    <div class="stats-row">
                        ${t.nombre}
                        <span>${t.count}</span>
                    </div>
                `).join("")}

            </div>

        </section>
    `;
}