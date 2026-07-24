import { APP } from "../js/config.js";
import { profileButton, initProfile } from "../components/profile.js";
import { getHomeData } from "../js/api.js";

export async function loadHome() {

    const data = await getHomeData(APP.currentUser);

    document.getElementById("header").innerHTML = `
        <h2>Tareas Hogar</h2>
        ${profileButton()}
    `;

    document.getElementById("content").innerHTML = `

        <section class="card">
            <h3>📅 Hoy</h3>
            <p>${data.today.length ? data.today.join("<br>") : "No hay tareas programadas."}</p>
        </section>

        <section class="card">
            <h3>🏆 Esta semana</h3>

            <p><strong>Elena</strong>: ${data.week.Elena} puntos</p>

            <p><strong>Tomás</strong>: ${data.week["Tomás"]} puntos</p>
        </section>

        <section class="card">
            <h3>🕒 Últimas tareas</h3>
            <p>${data.recent.length ? data.recent.join("<br>") : "No hay registros."}</p>
        </section>

        <section class="card">
            <h3>🔥 Tareas olvidadas</h3>
            <p>${data.forgotten.length ? data.forgotten.join("<br>") : "No hay tareas pendientes."}</p>
        </section>

    `;

    initProfile();

}