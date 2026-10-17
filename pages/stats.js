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

      <div class="stats-wins-card">
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
      <div class="stats-winner-label stats-winner-label--${person}">
        <span>${name}</span>
        <strong>${count}</strong>
      </div>

      <div class="stats-winner-track">
        <div
          class="stats-winner-fill stats-winner-fill--${person}"
          style="width:${width}%"
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
    return `<span class="stats-winner-badge stats-winner-badge--tie">Empate</span>`;
  }

  const person = winner === "Elena" ? "elena" : "tomas";

  return `<span class="stats-winner-badge stats-winner-badge--${person}">${escapeHTML(winner)}</span>`;
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

      <div class="stats-person-grid">
        ${personTasks("Elena", byPerson.Elena, "elena")}
        ${personTasks("Tomás", byPerson["Tomás"], "tomas")}
      </div>
    </section>
  `;
}

function personTasks(name, tasks, person) {
  const safeTasks = Array.isArray(tasks) ? tasks : [];

  return `
    <div class="stats-person-card stats-person-card--${person}">
      <h3>
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
          : `<p class="stats-empty">
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