import { renderNavbar } from "../components/navbar.js";
import { showToast } from "../components/toast.js";
import { navigate } from "../js/router.js";
import {
    getPointsConfiguration,
    updatePointsConfiguration
} from "../js/api.js";

export async function loadSettings() {
    document.getElementById("header").innerHTML = `<h2>Ajustes</h2>`;
    document.getElementById("content").innerHTML = `
        <p class="settings-loading">Cargando ajustes…</p>
    `;
    renderNavbar("settings");

    try {
        const points = await getPointsConfiguration();
        renderSettings(points);
    } catch (error) {
        console.error("No se pudieron cargar los ajustes:", error);
        document.getElementById("content").innerHTML = `
            <section class="card">
                <p>No se pudieron cargar los ajustes. Comprueba que has actualizado y publicado el Apps Script.</p>
            </section>
        `;
    }
}

function renderSettings(points) {
    document.getElementById("content").innerHTML = `
        <h3 class="settings-heading">Gestión</h3>
        <section class="settings-group settings-export">
            <p>Administra las tareas disponibles, sus puntos y el bonus de cada una.</p>
            <button
                id="manageTasksButton"
                class="secondary-button"
                type="button"
            >
                Gestionar tareas
            </button>
        </section>

        <h3 class="settings-heading">Bonus por repetición</h3>
        <section class="settings-group">
            <form id="pointsForm" class="category-form">
                <p class="settings-help">
                    Estas reglas se aplican solo a las tareas con el bonus activado en su ficha.
                </p>

                <label class="settings-field">
                    <span>Días desde la última vez que se hizo la tarea</span>
                    <input
                        name="bonusDays"
                        type="number"
                        min="1"
                        step="1"
                        required
                        value="${escapeHtml(points.bonusDays)}"
                    >
                </label>

                <label class="settings-field">
                    <span>Puntos extra por cada periodo</span>
                    <input
                        name="bonusPoints"
                        type="number"
                        min="0"
                        step="1"
                        required
                        value="${escapeHtml(points.bonusPoints)}"
                    >
                </label>

                <label class="settings-field">
                    <span>Máximo de puntos extra por tarea</span>
                    <input
                        name="maxBonus"
                        type="number"
                        min="0"
                        step="1"
                        required
                        value="${escapeHtml(points.maxBonus)}"
                    >
                </label>

                <p class="settings-help">
                    Ejemplo: con 7 días y 5 puntos, al hacer una tarea que lleva 7 días
                    sin registrarse suma 5 puntos extra. Cada periodo añade otros 5,
                    hasta el máximo indicado.
                </p>

                <button class="primary-button" type="submit">
                    Guardar reglas
                </button>
            </form>
        </section>
    `;

    document
        .getElementById("manageTasksButton")
        .addEventListener("click", () => navigate("tasks"));

    document
        .getElementById("pointsForm")
        .addEventListener("submit", savePoints);
}

async function savePoints(event) {
    event.preventDefault();

    const values = new FormData(event.currentTarget);
    const result = await runRequest(() =>
        updatePointsConfiguration({
            bonusDays: values.get("bonusDays"),
            bonusPoints: values.get("bonusPoints"),
            maxBonus: values.get("maxBonus")
        })
    );

    if (result) {
        showToast("Reglas de puntos guardadas");
    }
}

async function runRequest(action) {
    try {
        const result = await action();

        if (result?.success === false) {
            showToast(result.error || "No se pudo guardar");
            return null;
        }

        return result;
    } catch (error) {
        console.error("Error al guardar ajustes:", error);
        showToast("Error al guardar. Comprueba la conexión.");
        return null;
    }
}

function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}