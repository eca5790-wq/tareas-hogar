import { renderNavbar } from "../components/navbar.js";
import { loadTasks } from "./tasks.js";
import { loadCategorySelector } from "./category-selector.js";
import { loadScheduleEditor } from "./schedule-editor.js";

import {
    setCurrentTask,
    getCurrentTask,
    updateCurrentTask
} from "../js/editor.js";

import {
    getCategories,
    updateTask,
    createTask,
    getTaskSchedule,
    deleteTask
} from "../js/api.js";

import { openDialog, openConfirmDialog } from "../components/dialog.js";
import { showToast } from "../components/toast.js";

const WEEKDAY_LABELS = [
    "domingo", "lunes", "martes", "miércoles",
    "jueves", "viernes", "sábado"
];

export async function loadTaskDetail(task = null) {

    if (task) {

        setCurrentTask(task);

    } else {

        setCurrentTask({

            id: null,
            nombre: "",
            categoriaId: null,
            categoria: "",
            programacion: "",
            puntos: 10,
            activa: true,
            uso: 0,
            ultimaRealizacion: null

        });

    }

    render();

    if (getCurrentTask().id) {

        await loadScheduleSummary(getCurrentTask().id);

    }

}

async function loadScheduleSummary(taskId) {

    try {

        const schedule = await getTaskSchedule(taskId);

        // Evita pisar la pantalla si mientras tanto se abrió otra tarea.
        if (getCurrentTask().id !== taskId) return;

        updateCurrentTask("programacion", formatScheduleSummary(schedule));

        render();

    } catch (error) {

        console.error("No se pudo cargar la programación:", error);

    }

}

function formatScheduleSummary(schedule) {

    if (!schedule || !schedule.tipo) return "Sin programación";

    let base;

    switch (schedule.tipo) {

        case "DIARIA":
            base = "Cada día";
            break;

        case "SEMANAL": {

            const days = String(schedule.diasSemana || "")
                .split(",")
                .map(value => Number(value.trim()))
                .filter(value => Number.isInteger(value) && value >= 0 && value <= 6)
                .sort((a, b) => a - b)
                .map(value => WEEKDAY_LABELS[value]);

            base = days.length
                ? `Cada semana (${days.join(", ")})`
                : "Cada semana";

            break;

        }

        case "CADA_X_DIAS":
            base = `Cada ${schedule.intervalo || "?"} días`;
            break;

        case "CADA_X_SEMANAS":
            base = `Cada ${schedule.intervalo || "?"} semanas`;
            break;

        case "MENSUAL":
            base = `Mensual (día ${schedule.diaMes || "?"})`;
            break;

        default:
            return "Sin programación";

    }

    return schedule.activa === false ? `${base} · pausada` : base;

}

function render() {

    const task = getCurrentTask();

    document.getElementById("header").innerHTML = `

        <button id="backButton" class="icon-button">

            <span class="material-symbols-rounded">
                arrow_back
            </span>

        </button>

        <h2>${task.id ? task.nombre : "Nueva tarea"}</h2>

        <div style="width:40px"></div>

    `;

    document.getElementById("content").innerHTML = `

        ${task.id ? taskStats(task) : ""}

        <section class="settings-group">

            ${row(
                "Nombre",
                task.nombre || "Sin nombre",
                "name"
            )}

            ${row(
                "Categoría",
                task.categoria || "Seleccionar",
                "category"
            )}

            ${row(
                "Programación",
                task.programacion || "Sin programación",
                "schedule"
            )}

            ${row(
                "Puntos",
                task.puntos + " pts",
                "points"
            )}

        </section>

        <button id="saveTask" class="primary-button">
            Guardar cambios
        </button>

        <button id="cancelTask" class="secondary-button">
            Cancelar
        </button>

        ${task.id ? `
            <button id="deleteTask" class="secondary-button danger-button">
                Eliminar tarea
            </button>
        ` : ""}

    `;

    renderNavbar("tasks");

    initEvents();

}

function row(title, value, action) {

    return `

        <div class="setting-row selectable" data-action="${action}">

            <div>

                <div class="setting-title">
                    ${title}
                </div>

                <div class="setting-value">
                    ${value}
                </div>

            </div>

            <span class="material-symbols-rounded">
                chevron_right
            </span>

        </div>

    `;

}

function taskStats(task) {

    const count = Number(task.uso) || 0;
    const countText = count === 1 ? "Hecha 1 vez" : `Hecha ${count} veces`;
    const lastText = task.ultimaRealizacion
        ? ` · última vez ${formatRelativeDate(task.ultimaRealizacion)}`
        : "";

    return `<p class="settings-help">${countText}${lastText}</p>`;

}

function formatRelativeDate(value) {

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";

    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const diffDays = Math.round((startOfToday - startOfDate) / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) return "hoy";
    if (diffDays === 1) return "ayer";
    return `hace ${diffDays} días`;

}

function initEvents() {

    document
        .getElementById("backButton")
        .addEventListener("click", loadTasks);

    document
        .getElementById("cancelTask")
        .addEventListener("click", loadTasks);

    document
        .querySelectorAll(".setting-row")
        .forEach(item => {

            item.onclick = () => {

                switch (item.dataset.action) {

                    case "name":
                        editName();
                        break;

                    case "category":
                        openCategorySelector();
                        break;

                    case "points":
                        editPoints();
                        break;

                    case "schedule":
                        openScheduleEditor();
                        break;

                }

            };

        });

    document
        .getElementById("saveTask")
        .addEventListener("click", save);

    document
        .getElementById("deleteTask")
        ?.addEventListener("click", confirmDeleteTask);

}

/* ===========================
   EDIT NAME
=========================== */

function editName() {

    openDialog({

        title: "Nombre",

        value: getCurrentTask().nombre,

        placeholder: "Nombre de la tarea",

        onAccept: value => {

            value = value.trim();

            if (!value) {

                showToast("Introduce un nombre.");

                return;

            }

            updateCurrentTask("nombre", value);

            render();

        }

    });

}

/* ===========================
   EDIT POINTS (CLAVE)
=========================== */

function editPoints() {

    const OPTIONS = [5, 10, 15, 20, 25, 30];

    openDialog({

        title: "Puntos",

        type: "select", // 👈 asumimos que tu dialog soporta select

        options: OPTIONS,

        value: getCurrentTask().puntos,

        onAccept: value => {

            const points = Number(value);

            if (!OPTIONS.includes(points)) {

                showToast("Selecciona un valor válido.");

                return;

            }

            updateCurrentTask("puntos", points);

            render();

        }

    });

}

/* ===========================
   CATEGORY
=========================== */

async function openCategorySelector() {

    const categories = await getCategories();

    loadCategorySelector(categories);

}

/* ===========================
   SCHEDULE
=========================== */

function openScheduleEditor() {

    const task = getCurrentTask();

    if (!task.id) {

        showToast("Guarda la tarea antes de configurar su programación.");

        return;

    }

    loadScheduleEditor(task);

}

/* ===========================
   SAVE
=========================== */

async function save() {

    const task = getCurrentTask();

    if (!task.nombre.trim()) {

        showToast("La tarea debe tener un nombre.");

        return;

    }

    if (!task.categoriaId) {

        showToast("Selecciona una categoría.");

        return;

    }

    try {

        if (task.id) {

            await updateTask(task);

        } else {

            await createTask(task);

        }

        showToast("Tarea guardada.");

        await loadTasks();

    } catch (error) {

        console.error(error);

        showToast(error?.message || "No se han podido guardar los cambios.");

    }

}

/* ===========================
   DELETE
=========================== */

function confirmDeleteTask() {

    const task = getCurrentTask();

    openConfirmDialog({

        title: "¿Eliminar esta tarea?",
        message: "Dejará de aparecer en Registrar, Hoy y la lista de tareas. Su histórico no se borra.",
        confirmText: "Eliminar tarea",

        onConfirm: () => removeTask(task.id)

    });

}

async function removeTask(taskId) {

    try {

        await deleteTask(taskId);

        showToast("Tarea eliminada.");

        await loadTasks();

    } catch (error) {

        console.error(error);

        showToast(error?.message || "No se ha podido eliminar la tarea.");

    }

}