import { renderNavbar } from "../components/navbar.js";
import { loadTaskDetail } from "./task-detail.js";

export function loadScheduleEditor(task){

    document.getElementById("header").innerHTML = `

        <button id="backButton" class="icon-button">

            <span class="material-symbols-rounded">

                arrow_back

            </span>

        </button>

        <h2>Programación</h2>

        <div style="width:40px"></div>

    `;

    document.getElementById("content").innerHTML = `

        <section class="settings-group">

            ${option("DIARIA","Cada día")}

            ${option("SEMANAL","Cada semana")}

            ${option("CADA_X_DIAS","Cada X días")}

            ${option("CADA_X_SEMANAS","Cada X semanas")}

            ${option("MENSUAL","Mensual")}

        </section>

        <div id="scheduleOptions"></div>

    `;

    renderNavbar("tasks");

    document
        .getElementById("backButton")
        .addEventListener("click",()=>{

            loadTaskDetail(task);

        });

}

function option(value,label){

    return `

        <div
            class="setting-row selectable schedule-type"
            data-type="${value}"
        >

            <span>

                ${label}

            </span>

            <span class="material-symbols-rounded">

                radio_button_unchecked

            </span>

        </div>

    `;

}