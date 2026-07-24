import { renderNavbar } from "../components/navbar.js";
import { registerTask, getRegisterScreen } from "../js/api.js";
import { APP } from "../js/config.js";
import { showToast } from "../components/toast.js";

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

    document
        .getElementById("taskContainer")
        .addEventListener("click", handleTaskClick);

}

function search(e) {

    const text = e.target.value
        .trim()
        .toLowerCase();

    if (!text) {

        renderScreen(screenData);

        return;

    }

    renderScreen({

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

    });

}

function renderScreen(data) {

    document.getElementById("taskContainer").innerHTML =

        data.categories.map(renderCategory).join("");

}

function renderCategory(category) {

    return `

        <section class="card">

            <h3>${category.nombre}</h3>

            <div class="card-content">

                ${category.tareas.map(renderTask).join("")}

            </div>

        </section>

    `;

}

function renderTask(task) {

    return `

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

    `;

}

async function handleTaskClick(e) {

    const item = e.target.closest(".task-item");

    if (!item) return;

    try {

        await registerTask(

            item.dataset.id,

            APP.currentUser

        );

        item.classList.add("completed");

        showToast("Tarea registrada");

    } catch (error) {

        console.error(error);

        showToast("No se ha podido registrar la tarea.");

    }

}