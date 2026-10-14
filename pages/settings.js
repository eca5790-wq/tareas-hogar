import { renderNavbar } from "../components/navbar.js";
import { showToast } from "../components/toast.js";
import {
    getCategories,
    getHistoryExport,
    getPointsConfiguration,
    createCategory,
    updateCategory,
    updatePointsConfiguration
} from "../js/api.js";

export async function loadSettings() {
    document.getElementById("header").innerHTML = `<h2>Ajustes</h2>`;
    document.getElementById("content").innerHTML =
        `<p class="settings-loading">Cargando ajustes…</p>`;

    renderNavbar("settings");

    try {
        const [categories, points] = await Promise.all([
            getCategories(),
            getPointsConfiguration()
        ]);

        renderSettings(categories, points);
    } catch (error) {
        console.error("No se pudieron cargar los ajustes:", error);

        document.getElementById("content").innerHTML = `
            <section class="card">
                <p>No se pudieron cargar los ajustes. Comprueba que has actualizado y publicado el Apps Script.</p>
            </section>
        `;
    }
}

function renderSettings(categories, points) {
    document.getElementById("content").innerHTML = `
        <h3 class="settings-heading">Categorías</h3>

        <section class="settings-group">
            ${categories.map(category => `
                <form class="category-form" data-id="${escapeHtml(category.id)}">
                    <label class="settings-field">
                        <span>Nombre</span>
                        <input
                            name="nombre"
                            maxlength="40"
                            required
                            value="${escapeHtml(category.nombre)}"
                        >
                    </label>

                    <button class="secondary-button" type="submit">
                        Guardar categoría
                    </button>
                </form>
            `).join("")}

            <form id="newCategoryForm" class="category-form">
                <label class="settings-field">
                    <span>Nueva categoría</span>
                    <input
                        name="nombre"
                        maxlength="40"
                        required
                        placeholder="Ej. Jardín"
                    >
                </label>

                <button class="primary-button" type="submit">
                    Añadir categoría
                </button>
            </form>
        </section>

        <h3 class="settings-heading">Reglas globales de puntos</h3>

        <section class="settings-group">
            <form id="pointsForm" class="category-form">
                <label class="settings-field">
                    <span>Días para generar bonus</span>
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
                    <span>Puntos de bonus por periodo</span>
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
                    <span>Bonus máximo por tarea</span>
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
                    El bonus se calcula según los días desde la última vez que se hizo cada tarea.
                </p>

                <button class="primary-button" type="submit">
                    Guardar reglas
                </button>
            </form>
        </section>

        <h3 class="settings-heading">Exportar datos</h3>

        <section class="settings-group settings-export">
            <p>
                Descarga el histórico de tareas en formato CSV para abrirlo en Excel o Google Sheets.
            </p>

            <button
                id="exportHistoryButton"
                class="secondary-button"
                type="button"
            >
                Descargar histórico CSV
            </button>
        </section>
    `;

    document.querySelectorAll(".category-form[data-id]").forEach(form => {
        form.addEventListener("submit", event => saveCategory(event, form));
    });

    document
        .getElementById("newCategoryForm")
        .addEventListener("submit", createNewCategory);

    document
        .getElementById("pointsForm")
        .addEventListener("submit", savePoints);

    document
        .getElementById("exportHistoryButton")
        .addEventListener("click", exportHistory);
}

async function saveCategory(event, form) {
    event.preventDefault();

    const result = await runRequest(() => updateCategory({
        id: form.dataset.id,
        nombre: new FormData(form).get("nombre").trim()
    }));

    if (result) {
        showToast("Categoría guardada");
    }
}

async function createNewCategory(event) {
    event.preventDefault();

    const form = event.currentTarget;
    const result = await runRequest(() => createCategory({
        nombre: new FormData(form).get("nombre").trim()
    }));

    if (result) {
        showToast("Categoría añadida");
        await loadSettings();
    }
}

async function savePoints(event) {
    event.preventDefault();

    const values = new FormData(event.currentTarget);
    const result = await runRequest(() => updatePointsConfiguration({
        bonusDays: values.get("bonusDays"),
        bonusPoints: values.get("bonusPoints"),
        maxBonus: values.get("maxBonus")
    }));

    if (result) {
        showToast("Reglas de puntos guardadas");
    }
}

async function exportHistory() {
    const result = await runRequest(getHistoryExport);
    if (!result) return;

    const headers = result.headers || [];
    const rows = result.rows || [];

    const csv = [headers, ...rows]
        .map(row => row.map(value => csvCell(value)).join(","))
        .join("\r\n");

    const blob = new Blob(
        ["\uFEFF", csv],
        { type: "text/csv;charset=utf-8" }
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download =
        `historico-tareas-${new Date().toISOString().slice(0, 10)}.csv`;

    link.click();
    URL.revokeObjectURL(url);

    showToast(`${rows.length} registros exportados`);
}

function csvCell(value) {
    const text = value instanceof Date
        ? value.toISOString()
        : String(value ?? "");

    return `"${text.replace(/"/g, '""')}"`;
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