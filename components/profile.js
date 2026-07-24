import { APP } from "../js/config.js";
import { navigate } from "../js/router.js";

export function profileButton() {

    return `
        <button id="profileButton" class="profile-button">
            ${APP.currentUser === "Elena" ? "👩" : "👨"}
        </button>
    `;

}

export function initProfile() {

    document
        .getElementById("profileButton")
        .addEventListener("click", () => {

            const newUser =
                APP.currentUser === "Elena"
                    ? "Tomás"
                    : "Elena";

            APP.setCurrentUser(newUser);

            navigate("home");

        });

}