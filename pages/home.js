import { APP } from "../js/config.js";
import { profileButton, initProfile } from "../components/profile.js";
import { renderNavbar } from "../components/navbar.js";
import { card } from "../components/card.js";
import { taskItem } from "../components/taskItem.js";
import { getHomeData } from "../js/api.js";

export async function loadHome() {

    const data = await getHomeData(APP.currentUser);

    document.getElementById("header").innerHTML = `
        <h2>Tareas Hogar</h2>
        ${profileButton()}
    `;

    document.getElementById("content").innerHTML =

        card(
            "📅 Hoy",
            data.today.length
                ? data.today.map(task =>
                    taskItem(task.nombre, task.puntos)
                  ).join("")
                : "<p>No hay tareas programadas.</p>"
        )

        +

        card(
            "🏆 Esta semana",
            `
                <p><strong>Elena</strong>: ${data.week.Elena} puntos</p>
                <p><strong>Tomás</strong>: ${data.week["Tomás"]} puntos</p>
            `
        )

        +

        card(
            "🕒 Últimas tareas",
            data.recent.length
                ? data.recent.map(task =>
                    taskItem(task.nombre, null, task.usuario)
                  ).join("")
                : "<p>No hay registros.</p>"
        )

        +

        card(
            "🔥 Tareas olvidadas",
            data.forgotten.length
                ? data.forgotten.map(task =>
                    taskItem(task.nombre, task.puntos, task.dias + " días")
                  ).join("")
                : "<p>No hay tareas pendientes.</p>"
        );

    initProfile();

    renderNavbar("home");

}