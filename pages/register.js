import { renderNavbar } from "../components/navbar.js";
import { registerTask, getRegisterScreen } from "../js/api.js";
import { APP } from "../js/config.js";
import { showToast } from "../components/toast.js";
import { loadHome } from "./home.js";

/* ICONOS POR CATEGORÍA (ID) */
const CATEGORY_ICONS = {
    1: "restaurant",
    2: "weekend",
    3: "bed",
    4: "bathtub",
    5: "local_laundry_service",
    6: "cleaning_services",
    7: "shopping_cart",
    8: "pets"
};

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

/* ===========================
   EVENTS
=========================== */

function initEvents() {

    document
        .getElementById("searchTask")
        .addEventListener("input", search);

    document
        .getElementById("taskContainer")
        .addEventListener("click", handleTaskClick);

}

/* ===========================
   SEARCH
=========================== */

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
                    task.nombre.toLowerCase().includes(text)
                )
            }))
            .filter(category => category.tareas.length)

    });

}

/* ===========================
   RENDER
=========================== */

function renderScreen(data) {

    document.getElementById("taskContainer").innerHTML =
        data.categories.map(renderCategory).join("");

}

function renderCategory(category) {

    const icon = CATEGORY_ICONS[category.id] || "category";

    return `
        <section class="card">

            <h3 class="category-title">

                <span class="material-symbols-rounded category-icon">
                    ${icon}
                </span>

                ${category.nombre}

            </h3>

            <div class="card-content">
                ${category.tareas.map(renderTask).join("")}
            </div>

        </section>
    `;
}

function renderTask(task) {

    return `
        <div class="task-item" data-id="${task.id}">

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

/* ===========================
   ACTIONS + ANIMACIÓN
=========================== */

function handleTaskClick(e) {

    const item = e.target.closest(".task-item");
    if (!item) return;

    const id = item.dataset.id;

    /* 🔥 ANIMACIÓN */

    item.style.transition = "all .25s ease";
    item.style.transform = "scale(0.96)";
    item.style.opacity = "0.6";

    setTimeout(() => {
        item.style.transform = "scale(1.05)";
        item.style.opacity = "0";
    }, 120);

    showToast("Tarea registrada");

    /* 🔥 BACKEND SIN BLOQUEAR */
    registerTask(id, APP.currentUser)
        .catch(err => {
            console.error(err);
            showToast("Error al guardar");
        });

    /* 🔥 VOLVER A HOME CON TRANSICIÓN */
    setTimeout(() => {
        loadHome();
    }, 300);
}