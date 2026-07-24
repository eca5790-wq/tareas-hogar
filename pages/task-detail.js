import { renderNavbar } from "../components/navbar.js";
import { loadTasks } from "./tasks.js";

let currentTask = null;

export function loadTaskDetail(task) {

    currentTask = structuredClone(task);

    document.getElementById("header").innerHTML = `

        <button id="backButton" class="icon-button">

            <span class="material-symbols-rounded">
                arrow_back
            </span>

        </button>

        <h2>${task.nombre}</h2>

        <div style="width:40px"></div>

    `;

    render();

    renderNavbar("tasks");

    document
        .getElementById("backButton")
        .addEventListener("click", loadTasks);

}

function render(){

    document.getElementById("content").innerHTML = `

        <section class="settings-group">

            ${row("Nombre", currentTask.nombre, "name")}

            ${row("Categoría", currentTask.categoria, "category")}

            ${row("Programación", currentTask.programacion || "Sin programación", "schedule")}

            ${row("Puntos", currentTask.puntos, "points")}

        </section>

        <section class="settings-group">

            <div class="setting-row">

                <span>Activa</span>

                <label class="switch">

                    <input
                        id="activeSwitch"
                        type="checkbox"
                        ${currentTask.activa ? "checked" : ""}
                    >

                    <span class="slider"></span>

                </label>

            </div>

        </section>

        <button
            id="saveTask"
            class="primary-button"
        >

            Guardar cambios

        </button>

    `;

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
        .querySelectorAll(".selectable")
        .forEach(item=>{

            item.addEventListener("click",()=>{

                const action=item.dataset.action;

                switch(action){

                    case "name":

                        editName();

                        break;

                    case "points":

                        editPoints();

                        break;

                    case "category":

                        alert("Pendiente");

                        break;

                    case "schedule":

                        alert("Pendiente");

                        break;

                }

            });

        });

}

function editName(){

    const value=prompt(

        "Nombre de la tarea",

        currentTask.nombre

    );

    if(value){

        currentTask.nombre=value;

        render();

    }

}

function editPoints(){

    const value=prompt(

        "Puntos",

        currentTask.puntos

    );

    if(value!==null){

        currentTask.puntos=Number(value);

        render();

    }

}