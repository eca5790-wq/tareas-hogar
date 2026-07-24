import { APP } from "../js/config.js";

export function profileButton(){

    return `

        <button id="profileButton">

            ${APP.currentUser==="Elena" ? "👩" : "👨"}

        </button>

    `;

}

export function initProfile(){

    document
        .getElementById("profileButton")
        .addEventListener("click",()=>{

            const user=

                APP.currentUser==="Elena"

                ? "Tomás"

                : "Elena";

            APP.setUser(user);

            location.reload();

        });

}