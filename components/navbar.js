import { navigate } from "../js/router.js";

export function renderNavbar(activePage) {

    document.getElementById("navbar").innerHTML = `

        ${item("home","home","Inicio",activePage)}

        ${item("tasks","checklist","Tareas",activePage)}

        ${item("register","add_circle","Registrar",activePage)}

        ${item("stats","bar_chart","Estadísticas",activePage)}

        ${item("settings","settings","Ajustes",activePage)}

    `;

    document.querySelectorAll(".nav-item")
        .forEach(item=>{

            item.addEventListener("click",()=>{

                navigate(item.dataset.page);

            });

        });

}

function item(page,icon,label,active){

    return `

        <button
            class="nav-item ${page===active?"active":""}"
            data-page="${page}"
        >

            <span class="material-symbols-rounded">

                ${icon}

            </span>

            <small>${label}</small>

        </button>

    `;

}