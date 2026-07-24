import { renderNavbar } from "../components/navbar.js";
import { getTasks } from "../js/api.js";
import { loadTaskDetail } from "./task-detail.js";

let tasks = [];

export async function loadTasks() {

    tasks = await getTasks();

    document.getElementById("header").innerHTML = `
        <h2>Tareas</h2>
    `;

    document.getElementById("content").innerHTML = `

        <div class="search-box">

            <span class="material-symbols-rounded">
                search
            </span>

            <input
                id="searchTasks"
                class="search-input"
                type="text"
                placeholder="Buscar tarea..."
            >

        </div>

        <div id="tasksList"></div>

        <div class="new-task-row">

            <span class="material-symbols-rounded">

                add

            </span>

            Nueva tarea

        </div>

    `;

    renderTasks(tasks);

    renderNavbar("tasks");

    initEvents();

}

function initEvents(){

    document
        .getElementById("searchTasks")
        .addEventListener("input", search);

}

function search(e){

    const text = e.target.value
        .trim()
        .toLowerCase();

    const filtered = tasks.filter(task =>
        task.nombre
            .toLowerCase()
            .includes(text)
    );

    renderTasks(filtered);

}

function renderTasks(list){

    const grouped = {};

    list.forEach(task => {

        if(!grouped[task.categoria]){

            grouped[task.categoria] = [];

        }

        grouped[task.categoria].push(task);

    });

    document.getElementById("tasksList").innerHTML =

        Object.keys(grouped).map(category => `

            <section class="card">

                <h3>${category}</h3>

                <div class="card-content">

                    ${grouped[category].map(task => `

                        <div
                            class="task-item"
                            data-id="${task.id}"
                        >

                            <div>

                                <div class="task-name">

                                    ${task.nombre}

                                </div>

                                <div class="task-subtitle">

                                    ${task.programacion || "Sin programación"}

                                </div>

                            </div>

                            <div class="task-points">

                                ${task.puntos}

                            </div>

                        </div>

                    `).join("")}

                </div>

            </section>

        `).join("");

    document
        .querySelectorAll(".task-item")
        .forEach(item => {

            item.addEventListener("click", () => {

                const task = tasks.find(t => String(t.id) === item.dataset.id);

                loadTaskDetail(task);

            });

        });

}