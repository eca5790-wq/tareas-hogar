import { renderNavbar } from "../components/navbar.js";
import { registerTask, getRegisterScreen } from "../js/api.js";
import { APP } from "../js/config.js";

let screenData = {};

export async function loadRegister() {

    screenData = await getRegisterScreen(APP.currentUser);

    document.getElementById("header").innerHTML = `
        <h2>Registrar</h2>
    `;

    document.getElementById("content").innerHTML = `

        <div class="search-box">

            <span class="material-symbols-rounded">
                search
            </span>

            <input
                id="searchTask"
                class="search-input"
                type="text"
                placeholder="Buscar una tarea..."
            >

        </div>

        <div id="taskContainer"></div>

    `;

    renderScreen(screenData);

    renderNavbar("register");

    initEvents();

}

function initEvents() {

    document
        .getElementById("searchTask")
        .addEventListener("input", search);

}

function search(e) {

    const text = e.target.value
        .trim()
        .toLowerCase();

    if (text === "") {

        renderScreen(screenData);

        return;

    }

    const filtered = {

        ...screenData,

        categories: screenData.categories
            .map(category => ({

                ...category,

                tareas: category.tareas.filter(task =>
                    task.nombre
                        .toLowerCase()
                        .includes(text)
                )

            }))
            .filter(category => category.tareas.length)

    };

    renderScreen(filtered);

}

function renderScreen(data) {

    document.getElementById("taskContainer").innerHTML =

        data.categories.map(category => `

            <section class="card">

                <h3>${category.nombre}</h3>

                <div class="card-content">

                    ${category.tareas.map(task => `

                        <div
                            class="task-item"
                            data-id="${task.id}"
                        >

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

            </section>

        `).join("");

    document.querySelectorAll(".task-item")
        .forEach(item => {

            item.addEventListener("click", async () => {

                await registerTask(
                    item.dataset.id,
                    APP.currentUser
                );

                showToast("Tarea registrada");

            });

        });

}

function showToast(message) {

    const toast = document.createElement("div");

    toast.className = "toast";

    toast.textContent = message;

    document.body.appendChild(toast);

    setTimeout(() => {

        toast.remove();

    }, 1500);

}