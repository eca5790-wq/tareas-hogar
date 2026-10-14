import { renderNavbar } from "../components/navbar.js";

export function loadSettings() {

    document.getElementById("header").innerHTML = `
        <h2>Ajustes</h2>
    `;

    document.getElementById("content").innerHTML = `

        <section class="card">

            <h3>Ajustes</h3>

            <p>Aquí podrás gestionar categorías, puntos y configuración general.</p>

        </section>

    `;

    renderNavbar("settings");

}