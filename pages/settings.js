import { renderNavbar } from "../components/navbar.js";
import { showToast } from "../components/toast.js";
import { navigate } from "../js/router.js";
import {
    getPointsConfiguration,
    updatePointsConfiguration
} from "../js/api.js";

const SETTINGS_CACHE_KEY = "tareas-hogar-settings-points-v1";
let settingsLoadRequest = 0;

export async function loadSettings() {
    const requestId = ++settingsLoadRequest;
    const cachedPoints = readCachedPoints();

    document.getElementById("header").innerHTML = `<h2>Ajustes</h2>`;
    if (cachedPoints) {
        renderSettings(cachedPoints);
    } else {
        document.getElementById("content").innerHTML = `
            <p class="settings-loading">Cargando ajustes…</p>
        `;
    }
    renderNavbar("settings");

    try {
        const points = await getPointsConfiguration();
        if (
            requestId !== settingsLoadRequest ||
            document.querySelector("#header h2")?.textContent !== "Ajustes"
        ) return;

        writeCachedPoints(points);

        const form = document.getElementById("pointsForm");
        if (!form) {
            renderSettings(points);
        } else if (form.dataset.dirty !== "true") {
            updateSettingsFields(form, points);
        }
        document.querySelector(".settings-stale-note")?.remove();
    } catch (error) {
        console.error("No se pudieron cargar los ajustes:", error);
        if (
            requestId !== settingsLoadRequest ||
            document.querySelector("#header h2")?.textContent !== "Ajustes"
        ) return;

        if (document.getElementById("pointsForm")) {
            document.getElementById("content").insertAdjacentHTML(
                "afterbegin",
                `<p class="settings-help settings-stale-note">No se pudieron actualizar los ajustes. Se muestran los últimos valores cargados.</p>`
            );
        } else {
            document.getElementById("content").innerHTML = `
                <section class="card">
                    <p>No se pudieron cargar los ajustes. Comprueba la conexión y vuelve a intentarlo.</p>
                </section>
            `;
        }
    }
}

function readCachedPoints() {
    try {
        const saved = localStorage.getItem(SETTINGS_CACHE_KEY);
        if (!saved) return null;

        const points = JSON.parse(saved);
        if (
            !Number.isFinite(Number(points?.bonusDays)) ||
            !Number.isFinite(Number(points?.bonusPoints)) ||
            !Number.isFinite(Number(points?.maxBonus))
        ) return null;

        return points;
    } catch (error) {
        console.warn("No se pudo leer la caché de Ajustes:", error);
        return null;
    }
}

function writeCachedPoints(points) {
    if (
        !Number.isFinite(Number(points?.bonusDays)) ||
        !Number.isFinite(Number(points?.bonusPoints)) ||
        !Number.isFinite(Number(points?.maxBonus))
    ) return;

    try {
        localStorage.setItem(SETTINGS_CACHE_KEY, JSON.stringify({
            bonusDays: Number(points.bonusDays),
            bonusPoints: Number(points.bonusPoints),
            maxBonus: Number(points.maxBonus)
        }));
    } catch (error) {
        console.warn("No se pudo guardar la caché de Ajustes:", error);
    }
}

function updateSettingsFields(form, points) {
    form.elements.bonusDays.value = points.bonusDays;
    form.elements.bonusPoints.value = points.bonusPoints;
    form.elements.maxBonus.value = points.maxBonus;
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

    document
        .getElementById("pointsForm")
        .addEventListener("input", event => {
            event.currentTarget.dataset.dirty = "true";
        });
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
        const savedPoints = {
            bonusDays: values.get("bonusDays"),
            bonusPoints: values.get("bonusPoints"),
            maxBonus: values.get("maxBonus")
        };
        writeCachedPoints(savedPoints);
        event.currentTarget.dataset.dirty = "false";
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