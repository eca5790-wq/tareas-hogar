import { APP } from "../js/config.js";
import { profileButton, initProfile } from "../components/profile.js";
import { renderNavbar } from "../components/navbar.js";
import { card } from "../components/card.js";
import { getHomeData, registerTask } from "../js/api.js";

export async function loadHome() {

    const data = await getHomeData(APP.currentUser);

    document.getElementById("header").innerHTML = `
        <h2>Hoy</h2>
        ${profileButton()}
    `;

    document.getElementById("content").innerHTML = `

        ${todaySection(data.today)}

        ${weekSection(data.week)}

        ${recentSection(data.recent)}

        ${forgottenSection(data.forgotten)}

    `;

    initProfile();

    renderNavbar("home");

    initTodayEvents();

}

function todaySection(tasks){

    return card(

        "Hoy",

        tasks.length

            ?

            `<div class="card-content">

                ${tasks.map(task=>`

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

            </div>`

            :

            `<p>No hay tareas para hoy.</p>`

    );

}

function weekSection(score){

    return card(

        "Esta semana",

        `

        <div class="card-content">

            <div class="task-item">

                <div class="task-name">Elena</div>

                <div class="task-points">${score.Elena}</div>

            </div>

            <div class="task-item">

                <div class="task-name">Tomás</div>

                <div class="task-points">${score["Tomás"]}</div>

            </div>

        </div>

        `

    );

}

function recentSection(tasks){

    return card(

        "Últimas tareas",

        tasks.length

            ?

            `<div class="card-content">

                ${tasks.map(task=>`

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

            </div>`

            :

            "<p>No hay registros.</p>"

    );

}

function forgottenSection(tasks){

    return card(

        "Tareas olvidadas",

        tasks.length

            ?

            `<div class="card-content">

                ${tasks.map(task=>`

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

            </div>`

            :

            "<p>No hay tareas olvidadas.</p>"

    );

}

function initTodayEvents(){

    document.querySelectorAll(".today-task").forEach(item=>{

        item.addEventListener("click",async()=>{

            await registerTask(

                item.dataset.id,

                APP.currentUser

            );

item.querySelector(".material-symbols-rounded").textContent = "check_circle";

item.classList.add("completed");

showToast("Tarea registrada");

setTimeout(() => {

    item.remove();

}, 350);

        });

    });

}

function showToast(message){

    const toast=document.createElement("div");

    toast.className="toast";

    toast.textContent=message;

    document.body.appendChild(toast);

    setTimeout(()=>toast.remove(),1500);

}