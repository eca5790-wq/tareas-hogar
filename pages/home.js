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
            taskItem(task.nombre)
          ).join("")
        : "<p>No hay tareas programadas.</p>"
)

        +

        card(
            "🕒 Últimas tareas",
            data.recent.length
                ? data.recent.map(task =>
                    taskItem(
                        task.nombre,
                        null,
                        `${task.usuario} - ${formatDate(task.fecha)}`
                    )
                  ).join("")
                : "<p>No hay registros.</p>"
        );

    initProfile();

    renderNavbar("home");

}

function formatDate(date){

    const d = new Date(date);

    const dias = [
        "domingo","lunes","martes","miércoles","jueves","viernes","sábado"
    ];

    return `${dias[d.getDay()]} ${d.getDate()}`;
}