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
    updateTask
} from "../js/api.js";

export async function loadTaskDetail(task){

    setCurrentTask(task);

    render();

}

function render(){

    const task = getCurrentTask();

    document.getElementById("header").innerHTML = `

        <button id="backButton" class="icon-button">

            <span class="material-symbols-rounded">
                arrow_back
            </span>

        </button>

        <h2>${task.nombre}</h2>

        <div style="width:40px"></div>

    `;

    document.getElementById("content").innerHTML = `

        <section class="settings-group">

            ${row("Nombre",task.nombre,"name")}

            ${row("Categoría",task.categoria,"category")}

            ${row("Programación",task.programacion || "Sin programación","schedule")}

            ${row("Puntos",task.puntos,"points")}

        </section>

        <button
            id="saveTask"
            class="primary-button"
        >

            Guardar cambios

        </button>

    `;

    renderNavbar("tasks");

    initEvents();

}

function row(title,value,action){

    return `

        <div
            class="setting-row selectable"
            data-action="${action}"
        >

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

function initEvents(){

    document
        .getElementById("backButton")
        .addEventListener("click",loadTasks);

    document
        .querySelectorAll(".setting-row.selectable")
        .forEach(item=>{

            item.addEventListener("click",()=>{

                switch(item.dataset.action){

                    case "name":

                        editName();

                        break;

                    case "points":

                        editPoints();

                        break;

                    case "category":

                        openCategorySelector();

                        break;

                    case "schedule":

                        alert("Pendiente");

                        break;

                }

            });

        });

    document
        .getElementById("saveTask")
        .addEventListener("click",save);

}

function editName(){

    const value = prompt(
        "Nombre",
        getCurrentTask().nombre
    );

    if(!value) return;

    updateCurrentTask("nombre",value);

    render();

}

function editPoints(){

    const value = prompt(
        "Puntos",
        getCurrentTask().puntos
    );

    if(value===null) return;

    updateCurrentTask(
        "puntos",
        Number(value)
    );

    render();

}

async function openCategorySelector(){

    const categories = await getCategories();

    loadCategorySelector(categories);

}

async function save(){

    await updateTask(getCurrentTask());

    loadTasks();

}