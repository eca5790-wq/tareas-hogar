const API_URL = "https://script.google.com/macros/s/AKfycbwlc0_mddzrLtEwm_KqA30SJhkBE15_Evdbshgs3_QtQeCO_-Y-kgBrtp0Rq8P8DjhU/exec";

const cache = {
    categories: null
};

async function request(action, params = {}) {

    const query = new URLSearchParams({
        action,
        ...params,
        t: Date.now()
    });

    const response = await fetch(`${API_URL}?${query}`, {
        cache: "no-store"
    });

    if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();

}

export function clearCache() {

    cache.categories = null;

}

export function getHomeData(user) {

    return request("home", { user });

}

export function getRegisterScreen(user) {

    return request("registerScreen", { user });

}

export function registerTask(taskId, user) {

    return request("registerTask", {
        taskId,
        user
    });

}
export function deleteHistory(id) {

    return request("deleteHistory", { id });

}

export function getTasks() {

    return request("tasks");

}

export async function getCategories() {

    if (cache.categories) {

        return cache.categories;

    }

    cache.categories = await request("categories");

    return cache.categories;

}

export async function createTask(task) {

    const result = await request("createTask", {

        nombre: task.nombre,

        categoriaId: task.categoriaId,

        puntos: task.puntos

    });

    clearCache();

    return result;

}

export async function updateTask(task) {

    const result = await request("updateTask", {

        id: task.id,

        nombre: task.nombre,

        categoriaId: task.categoriaId,

        puntos: task.puntos

    });

    clearCache();

    return result;

}