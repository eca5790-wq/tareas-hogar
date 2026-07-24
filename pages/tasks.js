import UI from "../js/ui.js";

import { renderNavbar } from "../components/navbar.js";
import { taskItem } from "../components/taskItem.js";

import { getTasks } from "../js/api.js";

import { loadTaskDetail } from "./task-detail.js";

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

            ${tasks.map(task =>

                taskItem({

                    id: task.id,

                    title: task.nombre,

                    subtitle: task.categoria,

                    points: task.puntos

                })

            ).join("")}

        </div>

    `;

    renderNavbar("tasks");

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