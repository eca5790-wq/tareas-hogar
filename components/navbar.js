import { navigate } from "../js/router.js";

export function loadNavbar(){

    document.getElementById("navbar").innerHTML=`

        <div class="nav-item" data-page="home">🏠</div>
        <div class="nav-item" data-page="tasks">📋</div>
        <div class="nav-item" data-page="register">➕</div>
        <div class="nav-item" data-page="stats">📊</div>
        <div class="nav-item" data-page="settings">⚙️</div>

    `;

    document.querySelectorAll(".nav-item").forEach(item=>{

        item.addEventListener("click",()=>{

            navigate(item.dataset.page);

        });

    });

}