const API_URL = "https://script.google.com/macros/s/AKfycbwlc0_mddzrLtEwm_KqA30SJhkBE15_Evdbshgs3_QtQeCO_-Y-kgBrtp0Rq8P8DjhU/exec";

async function request(action, data = {}) {

    const params = new URLSearchParams({
        action,
        ...data
    });

    const response = await fetch(`${API_URL}?${params}`);

    return await response.json();

}

export function getHomeData(user) {
    return request("home", { user });
}

export function registerTask(taskId, user) {
    return request("registerTask", { taskId, user });
}