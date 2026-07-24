import { renderNavbar } from "../components/navbar.js";

export function loadRegister() {

    document.getElementById("header").innerHTML = `
        <h2>Registrar</h2>
    `;

    document.getElementById("content").innerHTML = `

        <section class="card">

            <h3>Registrar tarea</h3>

            <p>Próximamente aparecerán aquí el buscador, las tareas habituales y las tareas de hoy.</p>

        </section>

    `;

    renderNavbar("register");

}