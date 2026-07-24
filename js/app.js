import { loadHome } from "../pages/home.js";

document.addEventListener("DOMContentLoaded", () => {

    try {
        loadHome();
    } catch (error) {
        console.error(error);

        document.body.innerHTML = `
            <div style="padding:20px">
                <h2>Error en la app</h2>
                <pre>${error}</pre>
            </div>
        `;
    }

});