let timer = null;

export function showToast(message, duration = 2500) {

    let toast = document.getElementById("toast");

    if (!toast) {

        toast = document.createElement("div");

        toast.id = "toast";

        toast.className = "toast";

        document.body.appendChild(toast);

    }

    toast.textContent = message;

    toast.classList.add("show");

    clearTimeout(timer);

    timer = setTimeout(() => {

        toast.classList.remove("show");

    }, duration);

}