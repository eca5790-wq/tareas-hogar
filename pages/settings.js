import { APP } from "../js/config.js";
import { navigate } from "../js/router.js";
import { renderNavbar } from "../components/navbar.js";

export function loadSettings() {
    document.getElementById("header").innerHTML = `
        <h2>Ajustes</h2>
    `;

    document.getElementById("content").innerHTML = `
        <section class="settings-group">
            <div class="setting-row">
                <div>
                    <div class="setting-title">Perfil activo</div>
                    <div class="setting-value">${escapeHtml(APP.currentUser)}</div>
                </div>
                <span class="material-symbols-rounded" aria-hidden="true">person</span>
            </div>

            <button class="setting-row selectable" id="selectElena" type="button" style="width:100%;background:white;border:0;border-bottom:1px solid var(--border);text-align:left;">
                <span class="setting-value">Elena</span>
                <span class="material-symbols-rounded" aria-hidden="true">${APP.currentUser === "Elena" ? "check_circle" : "radio_button_unchecked"}</span>
            </button>

            <button class="setting-row selectable" id="selectTomas" type="button" style="width:100%;background:white;border:0;text-align:left;">
                <span class="setting-value">Tomás</span>
                <span class="material-symbols-rounded" aria-hidden="true">${APP.currentUser === "Tomás" ? "check_circle" : "radio_button_unchecked"}</span>
            </button>
        </section>

        <section class="settings-group">
            <button class="setting-row selectable" id="manageTasks" type="button" style="width:100%;background:white;border:0;text-align:left;">
                <div>
                    <div class="setting-title">Tareas</div>
                    <div class="setting-value">Crear y editar tareas, categorías y puntos</div>
                </div>
                <span class="material-symbols-rounded" aria-hidden="true">chevron_right</span>
            </button>
        </section>

        <section class="settings-group">
            <div class="setting-row">
                <div>
                    <div class="setting-title">Sobre la aplicación</div>
                    <div class="setting-value">Tareas del hogar</div>
                </div>
                <span class="material-symbols-rounded" aria-hidden="true">home</span>
            </div>
            <div class="setting-row">
                <div>
                    <div class="setting-title">Guardado del perfil</div>
                    <div class="setting-value">Este dispositivo</div>
                </div>
                <span class="material-symbols-rounded" aria-hidden="true">devices</span>
            </div>
        </section>
    `;

    document.getElementById("selectElena").addEventListener("click", () => chooseProfile("Elena"));
    document.getElementById("selectTomas").addEventListener("click", () => chooseProfile("Tomás"));
    document.getElementById("manageTasks").addEventListener("click", () => navigate("tasks"));

    renderNavbar("settings");
}

function chooseProfile(user) {
    if (APP.currentUser === user) return;

    APP.setCurrentUser(user);
    navigate("home", true);
}

function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}
