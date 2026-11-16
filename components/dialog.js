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
            <h3>${escapeHTML(title)}</h3>

            <input
                id="dialogInput"
                type="${escapeHTML(type)}"
                value="${escapeHTML(value)}"
                placeholder="${escapeHTML(placeholder)}"
            >

            <div class="dialog-buttons">
                <button id="dialogCancel" class="secondary-button">
                    Cancelar
                </button>

                <button id="dialogOk" class="primary-button">
                    Aceptar
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    const input = document.getElementById("dialogInput");
    input.focus();
    input.select();

    document.getElementById("dialogCancel").onclick = () => {
        overlay.remove();
    };

    document.getElementById("dialogOk").onclick = () => {
        onAccept(input.value);
        overlay.remove();
    };

    input.addEventListener("keydown", event => {
        if (event.key === "Enter") {
            onAccept(input.value);
            overlay.remove();
        }
    });
}

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}


export function openConfirmDialog({
    title = "¿Eliminar registro?",
    message = "Esta acción no se puede deshacer.",
    confirmText = "Eliminar",
    cancelText = "Cancelar",
    onConfirm
}) {
    const previous = document.getElementById("confirmDialogOverlay");
    if (previous) previous.remove();

    const overlay = document.createElement("div");
    overlay.id = "confirmDialogOverlay";
    overlay.className = "confirm-dialog-overlay";
    overlay.setAttribute("role", "presentation");

    overlay.innerHTML = `
        <section
            class="confirm-dialog"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirmDialogTitle"
            aria-describedby="confirmDialogMessage"
        >
            <div class="confirm-dialog-icon">
                <span class="material-symbols-rounded" aria-hidden="true">
                    delete
                </span>
            </div>

            <h3 id="confirmDialogTitle"></h3>
            <p id="confirmDialogMessage"></p>

            <div class="confirm-dialog-actions">
                <button class="confirm-dialog-cancel" type="button"></button>
                <button class="confirm-dialog-delete" type="button"></button>
            </div>
        </section>
    `;

    document.body.appendChild(overlay);

    overlay.querySelector("#confirmDialogTitle").textContent = title;
    overlay.querySelector("#confirmDialogMessage").textContent = message;

    const cancelButton = overlay.querySelector(".confirm-dialog-cancel");
    const confirmButton = overlay.querySelector(".confirm-dialog-delete");

    cancelButton.textContent = cancelText;
    confirmButton.textContent = confirmText;

    const close = () => {
        document.removeEventListener("keydown", handleKeydown);
        overlay.remove();
    };

    const handleKeydown = event => {
        if (event.key === "Escape") close();
    };

    cancelButton.addEventListener("click", close);

    confirmButton.addEventListener("click", () => {
        close();
        onConfirm?.();
    });

    overlay.addEventListener("click", event => {
        if (event.target === overlay) close();
    });

    document.addEventListener("keydown", handleKeydown);
    cancelButton.focus();
}