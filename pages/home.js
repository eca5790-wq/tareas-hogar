import { APP } from "../js/config.js";
import { profileButton, initProfile } from "../components/profile.js";

export function loadHome() {

    document.getElementById("header").innerHTML = `
        <h2>Tareas Hogar</h2>
        ${profileButton()}
    `;

    document.getElementById("content").innerHTML = `

        <section class="card">

            <h3>📅 Hoy</h3>

            <p>No hay tareas programadas.</p>

        </section>

        <section class="card">

            <h3>🏆 Esta semana</h3>

            <p><strong>${APP.currentUser}</strong>: 0 puntos</p>

            <p><strong>${APP.currentUser === "Elena" ? "Tomás" : "Elena"}</strong>: 0 puntos</p>

        </section>

        <section class="card">

            <h3>🕒 Últimas tareas</h3>

            <p>No hay registros.</p>

        </section>

        <section class="card">

            <h3>🔥 Tareas olvidadas</h3>

            <p>No hay tareas pendientes.</p>

        </section>

    `;

    initProfile();

}