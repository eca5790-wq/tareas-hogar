import { navigate } from "../js/router.js";

export function renderNavbar(activePage) {

    document.getElementById("navbar").innerHTML = `

        <div class="nav-item ${activePage === "home" ? "active" : ""}" data-page="home">
            🏠
        </div>

        <div class="nav-item ${activePage === "tasks" ? "active" : ""}" data-page="tasks">
            📋
        </div>

        <div class="nav-item ${activePage === "register" ? "active" : ""}" data-page="register">
            ➕
        </div>

        <div class="nav-item ${activePage === "stats" ? "active" : ""}" data-page="stats">
            📊
        </div>

        <div class="nav-item ${activePage === "settings" ? "active" : ""}" data-page="settings">
            ⚙️
        </div>

    `;

    document.querySelectorAll(".nav-item").forEach(item => {

        item.addEventListener("click", () => {

            navigate(item.dataset.page);

        });

    });

}