export function openDialog({

    title,
    value = "",
    type = "text",
    placeholder = "",
    onAccept

}) {

    const old = document.getElementById("dialogOverlay");

    if (old) old.remove();

    const overlay = document.createElement("div");

    overlay.id = "dialogOverlay";

    overlay.className = "dialog-overlay";

    overlay.innerHTML = `

        <div class="dialog">

            <h3>${title}</h3>

            <input
                id="dialogInput"
                type="${type}"
                value="${value}"
                placeholder="${placeholder}"
            >

            <div class="dialog-buttons">

                <button
                    id="dialogCancel"
                    class="secondary-button"
                >

                    Cancelar

                </button>

                <button
                    id="dialogOk"
                    class="primary-button"
                >

                    Aceptar

                </button>

            </div>

        </div>

    `;

    document.body.appendChild(overlay);

    const input = document.getElementById("dialogInput");

    input.focus();

    input.select();

    document
        .getElementById("dialogCancel")
        .onclick = () => overlay.remove();

    document
        .getElementById("dialogOk")
        .onclick = () => {

            onAccept(input.value);

            overlay.remove();

        };

    input.addEventListener("keydown", e => {

        if (e.key === "Enter") {

            onAccept(input.value);

            overlay.remove();

        }

    });

}