import { renderNavbar } from "../components/navbar.js";

export function loadTasks() {

    document.getElementById("header").innerHTML = `
        <h2>Tareas</h2>
    `;

    document.getElementById("content").innerHTML = `

        <section class="card">

            <h3>Administración de tareas</h3>

            <p>Aquí podrás crear, editar y desactivar tareas.</p>

        </section>

    `;

    renderNavbar("tasks");

}