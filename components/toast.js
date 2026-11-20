let timer = null;

export function showToast(message, options = {}) {

    const config = typeof options === "number"
        ? { duration: options }
        : options;

    const {
        duration = 2500,
        actionLabel = "",
        onAction = null
    } = config;

    let toast = document.getElementById("toast");

    if (!toast) {

        toast = document.createElement("div");

        toast.id = "toast";

        toast.className = "toast";

        document.body.appendChild(toast);

    }

    toast.innerHTML = `<span class="toast-message"></span>`;

    toast.querySelector(".toast-message").textContent = message;

    if (actionLabel && onAction) {

        const action = document.createElement("button");

        action.type = "button";
        action.className = "toast-action";
        action.textContent = actionLabel;

        action.onclick = () => {

            clearTimeout(timer);

            toast.classList.remove("show");

            onAction();

        };

        toast.appendChild(action);

    }

    toast.classList.add("show");

    clearTimeout(timer);

    timer = setTimeout(() => {

        toast.classList.remove("show");

    }, duration);

}