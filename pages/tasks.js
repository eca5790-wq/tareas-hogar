import UI from "../js/ui.js";

import { renderNavbar } from "../components/navbar.js";
import { taskItem } from "../components/taskItem.js";

import { getTasks } from "../js/api.js";

import { loadTaskDetail } from "./task-detail.js";


// 🔥 MAPA DE ICONOS (AQUÍ VA)
const CATEGORY_ICONS = {
    "Limpieza": "cleaning_services",
    "Cocina": "restaurant",
    "Baño": "bathtub",
    "Lavadora": "local_laundry_service",
    "Jardín": "grass",
    "Reparaciones": "build"
};

let tasks = [];

export async function loadTasks() {

    tasks = await getTasks();

    render();

    initEvents();

}

function render() {

    UI.header.innerHTML = `

        <h2>Tareas</h2>

        <button
            id="newTaskButton"
            class="icon-button"
        >

            <span class="material-symbols-rounded">
                add
            </span>

        </button>

    `;

    UI.content.innerHTML = `

        <div id="tasksList">

            ${renderGroupedTasks()}

        </div>

    `;

    renderNavbar("tasks");

}

function renderGroupedTasks() {

    const grouped = {};

    // Agrupar por categoría
    tasks.forEach(task => {

        const category = task.categoria || "Sin categoría";

        if (!grouped[category]) {
            grouped[category] = [];
        }

        grouped[category].push(task);

    });

    // Render con iconos 👇
    return Object.entries(grouped)
        .map(([category, items]) => {

            const icon = CATEGORY_ICONS[category] || "category";

            return `

                <section class="card">

                    <h3 class="category-title">

                        <span class="material-symbols-rounded category-icon">
                            ${icon}
                        </span>

                        ${category}

                    </h3>

                    <div class="card-content">

                        ${items.map(task =>

                            taskItem({

                                id: task.id,
                                title: task.nombre,
                                points: task.puntos

                            })

                        ).join("")}

                    </div>

                </section>

            `;

        }).join("");

}

function initEvents() {

    document
        .getElementById("newTaskButton")
        .onclick = () => {

            loadTaskDetail();

        };

    document
        .getElementById("tasksList")
        .onclick = handleTaskClick;

}

function handleTaskClick(e) {

    const item = e.target.closest(".task-item");

    if (!item) return;

    const task = tasks.find(t =>
        String(t.id) === item.dataset.id
    );

    if (!task) return;

    loadTaskDetail(task);

}