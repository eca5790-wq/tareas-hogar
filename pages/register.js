import { renderNavbar } from "../components/navbar.js";
import { APP } from "../js/config.js";
import { registerTask, getTasks } from "../js/api.js";

export async function loadRegister() {

    const tasks = await getTasks();

    const grouped = groupByCategory(tasks);

    document.getElementById("header").innerHTML = `
        <h2>Registrar</h2>
    `;

    document.getElementById("content").innerHTML =
        Object.keys(grouped).map(cat => `
            <section class="card">

                <h3>${cat}</h3>

                ${grouped[cat].map(t => `
                    <div class="task-item" data-id="${t.id}">
                        <div class="task-name">${t.nombre}</div>
                        <div class="task-points">${t.puntos}</div>
                    </div>
                `).join("")}

            </section>
        `).join("");

    renderNavbar("register");

    initRegisterEvents();

}

function groupByCategory(tasks){

    const grouped = {};

    tasks.forEach(task => {

        if(!grouped[task.categoria]){
            grouped[task.categoria] = [];
        }

        grouped[task.categoria].push(task);

    });

    // 🔥 ordenar tareas dentro de categoría
    Object.keys(grouped).forEach(cat => {
        grouped[cat].sort((a, b) => b.uso - a.uso);
    });

    // 🔥 ordenar categorías por uso total
    const sorted = Object.entries(grouped)
        .sort((a, b) => {

            const totalA = a[1].reduce((sum, t) => sum + t.uso, 0);
            const totalB = b[1].reduce((sum, t) => sum + t.uso, 0);

            return totalB - totalA;

        });

    return Object.fromEntries(sorted);

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