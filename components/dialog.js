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
        <style>
            .confirm-dialog-overlay {
                position: fixed;
                inset: 0;
                z-index: 3000;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
                background: rgba(17, 24, 39, .38);
                animation: confirmFadeIn .16s ease-out;
            }

            .confirm-dialog {
                width: min(100%, 360px);
                padding: 24px;
                background: #fff;
                border: 1px solid #e5e7eb;
                border-radius: 22px;
                box-shadow: 0 22px 60px rgba(17, 24, 39, .2);
                animation: confirmRise .2s ease-out;
            }

            .confirm-dialog-icon {
                width: 44px;
                height: 44px;
                display: grid;
                place-items: center;
                margin-bottom: 16px;
                border-radius: 14px;
                background: #fef2f2;
                color: #dc2626;
            }

            .confirm-dialog-icon .material-symbols-rounded {
                font-size: 23px;
            }

            .confirm-dialog h3 {
                margin: 0 0 8px;
                color: #1f2937;
                font-size: 18px;
                font-weight: 600;
            }

            .confirm-dialog p {
                margin: 0;
                color: #6b7280;
                font-size: 14px;
                line-height: 1.5;
            }

            .confirm-dialog-actions {
                display: flex;
                gap: 10px;
                margin-top: 24px;
            }

            .confirm-dialog-actions button {
                flex: 1;
                min-height: 46px;
                padding: 0 14px;
                border-radius: 13px;
                font: 600 14px Inter, sans-serif;
                cursor: pointer;
            }

            .confirm-dialog-cancel {
                border: 1px solid #e5e7eb;
                background: #fff;
                color: #4b5563;
            }

            .confirm-dialog-delete {
                border: 0;
                background: #dc2626;
                color: #fff;
            }

            .confirm-dialog-cancel:hover {
                background: #f9fafb;
            }

            .confirm-dialog-delete:hover {
                background: #b91c1c;
            }

            @keyframes confirmFadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }

            @keyframes confirmRise {
                from {
                    opacity: 0;
                    transform: translateY(8px) scale(.98);
                }
                to {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                }
            }

            @media (prefers-reduced-motion: reduce) {
                .confirm-dialog-overlay,
                .confirm-dialog {
                    animation: none;
                }
            }
        </style>

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