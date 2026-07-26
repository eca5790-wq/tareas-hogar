import UI from "../js/ui.js";

import { renderNavbar } from "../components/navbar.js";
import { taskItem } from "../components/taskItem.js";

import { getTasks } from "../js/api.js";

import { loadTaskDetail } from "./task-detail.js";

/* ICONOS POR CATEGORÍA (ID) */
const CATEGORY_ICONS = {
    1: "restaurant",              // Cocina
    2: "weekend",                 // Salón
    3: "bed",                     // Dormitorio
    4: "bathtub",                 // Baño
    5: "local_laundry_service",   // Ropa
    6: "cleaning_services",       // Limpieza
    7: "shopping_cart",           // Compra
    8: "pets"                     // Mascotas
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

        <button id="newTaskButton" class="icon-button">

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

/* ===========================
   GROUPED TASKS
=========================== */

function renderGroupedTasks() {

    const grouped = {};

    tasks.forEach(task => {

        const category = task.categoria || "Sin categoría";
        const categoryId = task.categoriaId || 0;

        if (!grouped[category]) {
            grouped[category] = {
                id: categoryId,
                items: []
            };
        }

        grouped[category].items.push(task);

    });

    return Object.entries(grouped)
        .map(([category, data]) => {

            const icon = CATEGORY_ICONS[data.id] || "category";
            const items = data.items;

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

/* ===========================
   EVENTS
=========================== */

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