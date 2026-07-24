import { loadHome } from "../pages/home.js";

async function start() {

    try {

        await loadHome();

    } catch (error) {

        console.error(error);

        document.body.innerHTML = `

            <div style="padding:24px">

                <h2>Error al iniciar la aplicación</h2>

                <p>Consulta la consola del navegador para más información.</p>

            </div>

        `;

    }

}

document.addEventListener("DOMContentLoaded", start);