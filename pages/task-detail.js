import { renderNavbar } from "../components/navbar.js";
import { loadTasks } from "./tasks.js";
import { loadCategorySelector } from "./category-selector.js";

import {
    setCurrentTask,
    getCurrentTask,
    updateCurrentTask
} from "../js/editor.js";

import {
    getCategories,
    updateTask,
    createTask
} from "../js/api.js";

import { openDialog } from "../components/dialog.js";
import { showToast } from "../components/toast.js";

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
            activa: true

        });

    }

    render();

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
                        showToast("Editor de programación pendiente.");
                        break;

                }

            };

        });

    document
        .getElementById("saveTask")
        .addEventListener("click", save);

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

        showToast("No se han podido guardar los cambios.");

    }

}