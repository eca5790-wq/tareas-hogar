import { renderNavbar } from "../components/navbar.js";
import { card } from "../components/card.js";
import { taskItem } from "../components/taskItem.js";
import { APP } from "../js/config.js";
import { registerTask } from "../js/api.js";

export function loadRegister() {

    document.getElementById("header").innerHTML = `
        <h2>Registrar</h2>
    `;

    document.getElementById("content").innerHTML =

        card(
            "⭐ Más habituales",
            `
                ${taskItem("Sacar basura", 10)}
                ${taskItem("Fregar", 15)}
                ${taskItem("Tender ropa", 12)}
            `
        )

        +

        card(
            "📅 Hoy",
            `
                ${taskItem("Limpiar cocina", 20)}
                ${taskItem("Hacer la compra", 30)}
            `
        );

    renderNavbar("register");

    initRegisterEvents();

}

function initRegisterEvents(){

    document.querySelectorAll(".task-item").forEach(item => {

        item.addEventListener("click", () => {

            const name = item.querySelector(".task-name").innerText;

            registerTask(name, APP.currentUser);

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