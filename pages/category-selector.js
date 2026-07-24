import { renderNavbar } from "../components/navbar.js";
import { loadTaskDetail } from "./task-detail.js";

import {
    getCurrentTask,
    updateCurrentTask
} from "../js/editor.js";

let categories = [];

export function loadCategorySelector(list){

    categories = list;

    document.getElementById("header").innerHTML = `

        <button id="backButton" class="icon-button">

            <span class="material-symbols-rounded">

                arrow_back

            </span>

        </button>

        <h2>Categoría</h2>

        <div style="width:40px"></div>

    `;

    document.getElementById("content").innerHTML = `

        <section class="settings-group">

            ${categories.map(category=>`

                <div
                    class="setting-row selectable category-row"
                    data-id="${category.id}"
                    data-name="${category.nombre}"
                >

                    <span>

                        ${category.nombre}

                    </span>

                    <span class="material-symbols-rounded">

                        ${
                            category.nombre===getCurrentTask().categoria
                            ? "check"
                            : ""
                        }

                    </span>

                </div>

            `).join("")}

        </section>

    `;

    renderNavbar("tasks");

    initEvents();

}

function initEvents(){

    document
        .getElementById("backButton")
        .addEventListener("click",()=>{

            loadTaskDetail(getCurrentTask());

        });

    document
        .querySelectorAll(".category-row")
        .forEach(row=>{

            row.addEventListener("click",()=>{

                updateCurrentTask(
                    "categoria",
                    row.dataset.name
                );

                updateCurrentTask(
                    "categoriaId",
                    Number(row.dataset.id)
                );

                loadTaskDetail(getCurrentTask());

            });

        });

}