import { APP } from "../js/config.js";
import { getHomeData } from "../js/api.js";
import { renderNavbar } from "../components/navbar.js";

let stats = {};

export async function loadStats() {

    stats = await getHomeData(APP.currentUser);

    render();
}

function render() {

    document.getElementById("content").innerHTML = `
    ${weeklyWinners()}
    ${weeklyHistory()}
    ${topTasks()}
`;

    document.getElementById("content").innerHTML = `
      
        ${weeklyWinners()}
        ${topTasks()}
    `;

    renderNavbar("stats");
}

/* ===========================
   RESUMEN SEMANAL
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
function weekSummary() {

    return `
        <section class="home-section">

            <div class="section-title">
                Esta semana
            </div>

            <div class="stats-summary">

                <div>
                    Elena<br>
                    <strong>${stats.week.Elena} pts</strong>
                </div>

                <div>
                    Tomás<br>
                    <strong>${stats.week["Tomás"]} pts</strong>
                </div>

            </div>

        </section>
    `;
}

/* ===========================
   COMPARATIVA
=========================== */

function weekComparison() {

    const e = stats.week.Elena;
    const t = stats.week["Tomás"];
    const max = Math.max(e, t, 1);

    const eWidth = Math.round((e / max) * 100);
    const tWidth = Math.round((t / max) * 100);

    return `
        <section class="home-section">

            <div class="section-title">
                Comparativa
            </div>

            <div class="stats-bars">

                <div class="bar-row">
                    <span>Elena</span>
                    <div class="bar">
                        <div style="width:${eWidth}%"></div>
                    </div>
                </div>

                <div class="bar-row">
                    <span>Tomás</span>
                    <div class="bar">
                        <div style="width:${tWidth}%"></div>
                    </div>
                </div>

            </div>

        </section>
    `;
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