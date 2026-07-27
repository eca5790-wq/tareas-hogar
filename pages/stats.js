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
        ${weekSummary()}
        ${weekComparison()}
    `;

    renderNavbar("stats");
}

/* ===========================
   RESUMEN SEMANAL
=========================== */

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