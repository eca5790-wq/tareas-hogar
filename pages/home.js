import { APP } from "../js/config.js";
import { getHomeData, registerTask } from "../js/api.js";

import { profileButton, initProfile } from "../components/profile.js";
import { renderNavbar } from "../components/navbar.js";
import { card } from "../components/card.js";
import { showToast } from "../components/toast.js";

let todayTasks = [];

export async function loadHome() {

    const data = await getHomeData(APP.currentUser);

    todayTasks = [...data.today];

    render(data);

    initEvents();

}

function render(data) {

    document.getElementById("header").innerHTML = `
        <h2>Hoy</h2>
        ${profileButton()}
    `;

    document.getElementById("content").innerHTML = `
        ${todaySection(todayTasks)}
        ${weekSection(data.week)}
        ${recentSection(data.recent)}
        ${forgottenSection(data.forgotten)}
    `;

    initProfile();

    renderNavbar("home");

}

function initEvents() {

    document
        .querySelectorAll(".today-task")
        .forEach(item => {

            item.onclick = () => completeTask(item);

        });

}

async function completeTask(item) {

    try {

        await registerTask(
            item.dataset.id,
            APP.currentUser
        );

        item
            .querySelector(".material-symbols-rounded")
            .textContent = "check_circle";

        item.classList.add("completed");

        showToast("Tarea registrada");

        setTimeout(() => {

            item.remove();

            if (!document.querySelector(".today-task")) {

                const container = document.querySelector(".today-list");

                if (container) {

                    container.innerHTML = `
                        <p>No hay tareas para hoy.</p>
                    `;

                }

            }

        }, 350);

    } catch (error) {

        console.error(error);

        showToast("No se ha podido registrar la tarea.");

    }

}

function todaySection(tasks) {

    return card(

        "Hoy",

        tasks.length

            ? `

                <div class="card-content today-list">

                    ${tasks.map(task => `

                        <div
                            class="task-item today-task"
                            data-id="${task.id}"
                        >

                            <div class="task-name">

                                ${task.nombre}

                            </div>

                            <span class="material-symbols-rounded">

                                circle

                            </span>

                        </div>

                    `).join("")}

                </div>

            `

            : "<p>No hay tareas para hoy.</p>"

    );

}

function weekSection(score) {

    return card(

        "Esta semana",

        `

        <div class="card-content">

            <div class="task-item">

                <div class="task-name">

                    Elena

                </div>

                <div class="task-points">

                    ${score.Elena}

                </div>

            </div>

            <div class="task-item">

                <div class="task-name">

                    Tomás

                </div>

                <div class="task-points">

                    ${score["Tomás"]}

                </div>

            </div>

        </div>

        `

    );

}

function recentSection(tasks) {

    return card(

        "Últimas tareas",

        tasks.length

            ? `

                <div class="card-content">

                    ${tasks.map(task => `

                        <div class="task-item">

                            <div>

                                <div class="task-name">

                                    ${task.nombre}

                                </div>

                                <div class="task-subtitle">

                                    ${task.usuario}

                                </div>

                            </div>

                        </div>

                    `).join("")}

                </div>

            `

            : "<p>No hay registros.</p>"

    );

}

function forgottenSection(tasks) {

    return card(

        "Tareas olvidadas",

        tasks.length

            ? `

                <div class="card-content">

                    ${tasks.map(task => `

                        <div class="task-item">

                            <div>

                                <div class="task-name">

                                    ${task.nombre}

                                </div>

                            </div>

                            <div class="task-points">

                                +${task.puntos}

                            </div>

                        </div>

                    `).join("")}

                </div>

            `

            : "<p>No hay tareas olvidadas.</p>"

    );

}