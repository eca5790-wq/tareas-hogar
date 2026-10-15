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
    ${topTasksByPerson()}
  `;

  renderNavbar("stats");
}

function weeklyWinners() {
  const wins = stats.stats?.weeklyWinners;
  if (!wins) return "";

  const elena = Number(wins.Elena) || 0;
  const tomas = Number(wins["Tomás"]) || 0;
  const maxWins = Math.max(elena, tomas, 1);

  return `
    <section class="home-section">
      <div class="section-title">Semanas ganadas</div>

      <div
        class="stats-wins-card"
        style="background:#fff;padding:16px;border:1px solid var(--border);border-radius:14px;box-shadow:0 6px 16px rgba(0,0,0,.04)"
      >
        ${winnerBar("Elena", elena, maxWins, "elena")}
        ${winnerBar("Tomás", tomas, maxWins, "tomas")}
      </div>
    </section>
  `;
}

function winnerBar(name, count, max, person) {
  const width = count ? Math.max(4, Math.round((count / max) * 100)) : 0;

  return `
    <div class="stats-winner-row">
      <div
        class="stats-winner-label stats-winner-label--${person}"
        style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;color:var(--${person})"
      >
        <span>${name}</span>
        <strong>${count}</strong>
      </div>

      <div
        class="stats-winner-track"
        style="height:9px;background:#eef2f4;border-radius:999px;overflow:hidden;margin-bottom:14px"
      >
        <div
          class="stats-winner-fill stats-winner-fill--${person}"
          style="width:${width}%;height:100%;background:var(--${person});border-radius:999px;transition:width .4s ease"
          role="progressbar"
          aria-label="Semanas ganadas por ${name}"
          aria-valuemin="0"
          aria-valuemax="${max}"
          aria-valuenow="${count}"
        ></div>
      </div>
    </div>
  `;
}

function weeklyHistory() {
  const weeks = stats.stats?.weeklyHistory;
  if (!Array.isArray(weeks) || !weeks.length) return "";

  return `
    <section class="home-section">
      <div class="section-title">Últimas semanas</div>

      <div class="stats-list">
        ${weeks.map(week => `
          <div class="stats-row">
            <span>${escapeHTML(formatWeekRange(week.week))}</span>
            ${winnerBadge(week.winner)}
          </div>
        `).join("")}
      </div>
    </section>
  `;
}

function winnerBadge(winner) {
  if (!winner) {
    return `
      <span
        class="stats-winner-badge"
        style="font-size:12px;color:var(--text-secondary)"
      >Empate</span>
    `;
  }

  const person = winner === "Elena" ? "elena" : "tomas";

  return `
    <span
      class="stats-winner-badge"
      style="font-size:12px;font-weight:600;color:var(--${person})"
    >${escapeHTML(winner)}</span>
  `;
}

function formatWeekRange(value) {
  const match = String(value || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (!match) {
    const legacy = String(value || "").match(/^(\d{4})-W(\d{1,2})$/i);
    return legacy
      ? `Sem. ${Number(legacy[2])} · ${legacy[1]}`
      : String(value || "");
  }

  const start = new Date(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3]),
    12
  );

  const end = new Date(start);
  end.setDate(end.getDate() + 6);

  const months = [
    "ene", "feb", "mar", "abr", "may", "jun",
    "jul", "ago", "sep", "oct", "nov", "dic"
  ];

  if (start.getFullYear() !== end.getFullYear()) {
    return `${start.getDate()} ${months[start.getMonth()]} ${start.getFullYear()}–${end.getDate()} ${months[end.getMonth()]} ${end.getFullYear()}`;
  }

  if (start.getMonth() !== end.getMonth()) {
    return `${start.getDate()} ${months[start.getMonth()]}–${end.getDate()} ${months[end.getMonth()]}`;
  }

  return `${start.getDate()}–${end.getDate()} ${months[end.getMonth()]}`;
}

function topTasks() {
  const tasks = stats.stats?.topTasks;
  if (!Array.isArray(tasks) || !tasks.length) return "";

  return `
    <section class="home-section">
      <div class="section-title">Tareas más realizadas · entre los dos</div>

      <div class="stats-list">
        ${tasks.map(task => `
          <div class="stats-row">
            <span>${escapeHTML(task.nombre)}</span>
            <strong>${Number(task.count) || 0}</strong>
          </div>
        `).join("")}
      </div>
    </section>
  `;
}

function topTasksByPerson() {
  const byPerson = stats.stats?.topTasksByUser;
  if (!byPerson) return "";

  return `
    <section class="home-section">
      <div class="section-title">Lo que más hace cada uno</div>

      <div
        class="stats-person-grid"
        style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,260px),1fr));gap:12px"
      >
        ${personTasks("Elena", byPerson.Elena, "elena")}
        ${personTasks("Tomás", byPerson["Tomás"], "tomas")}
      </div>
    </section>
  `;
}

function personTasks(name, tasks, person) {
  const safeTasks = Array.isArray(tasks) ? tasks : [];

  return `
    <div
      class="stats-person-card stats-person-card--${person}"
      style="background:#fff;padding:16px;border:1px solid var(--border);border-top:3px solid var(--${person});border-radius:14px;box-shadow:0 6px 16px rgba(0,0,0,.04)"
    >
      <h3 style="margin:0 0 8px;color:var(--${person});font-size:15px">
        ${name}
      </h3>

      ${
        safeTasks.length
          ? `<div class="stats-list">
              ${safeTasks.map(task => `
                <div class="stats-row">
                  <span>${escapeHTML(task.nombre)}</span>
                  <strong>${Number(task.count) || 0}</strong>
                </div>
              `).join("")}
            </div>`
          : `<p style="color:var(--text-secondary);font-size:13px">
              Aún no hay tareas registradas.
            </p>`
      }
    </div>
  `;
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