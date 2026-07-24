import { renderNavbar } from "../components/navbar.js";

export function loadStats() {

    document.getElementById("header").innerHTML = `
        <h2>Estadísticas</h2>
    `;

    document.getElementById("content").innerHTML = `

        <section class="card">

            <h3>Estadísticas</h3>

            <p>Las estadísticas estarán disponibles cuando exista histórico de tareas.</p>

        </section>

    `;

    renderNavbar("stats");

}