import { renderNavbar } from "../components/navbar.js";
import { card } from "../components/card.js";
import { taskItem } from "../components/taskItem.js";
import { APP } from "../js/config.js";
import { registerTask, getTasks } from "../js/api.js";

export async function loadRegister() {

    const tasks = await getTasks();

    document.getElementById("header").innerHTML = `
        <h2>Registrar</h2>
    `;

    document.getElementById("content").innerHTML =

        card(
            "📋 Todas las tareas",
            tasks.map(t =>
                `<div class="task-item" data-id="${t.id}">
                    <div class="task-name">${t.nombre}</div>
                    <div class="task-points">${t.puntos}</div>
                </div>`
            ).join("")
        );

    renderNavbar("register");

    initRegisterEvents();

}

function initRegisterEvents(){

    document.querySelectorAll(".task-item").forEach(item => {

        item.addEventListener("click", () => {

            const id = item.dataset.id;

            registerTask(id, APP.currentUser);

            showToast("Tarea registrada");

            setTimeout(() => {
                location.reload();
            }, 500);

        });

    });

}

function showToast(message){

    const toast = document.createElement("div");

    toast.className = "toast";
    toast.innerText = message;

    document.body.appendChild(toast);

    setTimeout(()=>{
        toast.remove();
    },1500);

}