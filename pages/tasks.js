import { renderNavbar } from "../components/navbar.js";
import { renderTaskItem } from "../components/taskItem.js";
import { getTasks } from "../js/api.js";
import { loadTaskDetail } from "./task-detail.js";

export async function loadTasks() {

    const tasks = await getTasks();

    document.getElementById("header").innerHTML = `

        <h2>Tareas</h2>

        <button id="newTaskButton" class="icon-button">

            <span class="material-symbols-rounded">

                add

            </span>

        </button>

    `;

    document.getElementById("content").innerHTML = `

        <div id="tasksList"></div>

    `;

    const list = document.getElementById("tasksList");

    tasks.forEach(task => {

        list.innerHTML += renderTaskItem(task);

    });

    renderNavbar("tasks");

    initEvents(tasks);

}

function initEvents(tasks) {

    document
        .getElementById("newTaskButton")
        .addEventListener("click", () => {

            loadTaskDetail();

        });

    document
        .querySelectorAll(".task-item")
        .forEach((item, index) => {

            item.addEventListener("click", () => {

                loadTaskDetail(tasks[index]);

            });

        });

}