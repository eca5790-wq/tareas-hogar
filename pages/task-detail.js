import { renderNavbar } from "../components/navbar.js";

export function loadTaskDetail(task){

    document.getElementById("header").innerHTML = `
        <h2>${task.nombre}</h2>
    `;

    document.getElementById("content").innerHTML = `

        <section class="card">

            <h3>Nombre</h3>

            <div class="card-content">

                <div class="task-item">

                    <div class="task-name">

                        ${task.nombre}

                    </div>

                </div>

            </div>

        </section>

        <section class="card">

            <h3>Categoría</h3>

            <div class="card-content">

                <div class="task-item">

                    <div class="task-name">

                        ${task.categoria}

                    </div>

                </div>

            </div>

        </section>

        <section class="card">

            <h3>Puntos</h3>

            <div class="card-content">

                <div class="task-item">

                    <div class="task-name">

                        ${task.puntos}

                    </div>

                </div>

            </div>

        </section>

        <section class="card">

            <h3>Programación</h3>

            <div class="card-content">

                <div class="task-item">

                    <div class="task-name">

                        ${task.programacion || "Sin programación"}

                    </div>

                </div>

            </div>

        </section>

    `;

    renderNavbar("tasks");

}