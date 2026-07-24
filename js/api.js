const API_URL = "https://script.google.com/macros/s/AKfycbwlc0_mddzrLtEwm_KqA30SJhkBE15_Evdbshgs3_QtQeCO_-Y-kgBrtp0Rq8P8DjhU/exec";

async function request(action, data = {}) {

    const params = new URLSearchParams({
        action,
        ...data,
        t: Date.now()
    });

    const response = await fetch(`${API_URL}?${params}`, {
        cache: "no-store"
    });

    return await response.json();

}

export function getHomeData(user) {
    return request("home", { user });
}

export function getRegisterScreen(user) {
    return request("registerScreen", { user });
}

export function registerTask(taskId, user) {
    return request("registerTask", { taskId, user });
}

export function getTasks() {
    return request("tasks");
}

export function getCategories() {
    return request("categories");
}

export function updateTask(task) {
    return request("updateTask", {
        id: task.id,
        nombre: task.nombre,
        categoriaId: task.categoriaId,
        puntos: task.puntos
    });
}

export function createTask(task) {
    return request("createTask", {
        nombre: task.nombre,
        categoriaId: task.categoriaId,
        puntos: task.puntos
    });
}