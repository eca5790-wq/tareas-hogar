import { APP } from "../js/config.js";
import { profileButton, initProfile } from "../components/profile.js";
import { renderNavbar } from "../components/navbar.js";
import { card } from "../components/card.js";
import { taskItem } from "../components/taskItem.js";

export function loadHome() {

    const history = APP.history.slice(-5).reverse();

    document.getElementById("header").innerHTML = `
        <h2>Tareas Hogar</h2>
        ${profileButton()}
    `;

    document.getElementById("content").innerHTML =

        card(
            "📅 Hoy",
            `<p>No hay tareas programadas.</p>`
        )

        +

        card(
            "🕒 Últimas tareas",
            history.length
                ? history.map(task =>
                    taskItem(task.nombre, null, task.usuario + " - " + new Date().toLocaleTimeString())
                  ).join("")
                : "<p>No hay registros.</p>"
        );

    initProfile();

    renderNavbar("home");

}