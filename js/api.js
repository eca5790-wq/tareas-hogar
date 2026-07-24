const API_URL = "https://script.google.com/macros/s/AKfycbwlc0_mddzrLtEwm_KqA30SJhkBE15_Evdbshgs3_QtQeCO_-Y-kgBrtp0Rq8P8DjhU/exec";

async function request(action, data = {}) {

    const response = await fetch(API_URL, {
        method: "POST",
        mode: "no-cors", // 🔥 CLAVE
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            action,
            ...data
        })
    });

    // ⚠️ no-cors no permite leer respuesta
    return {};

}

export function getHomeData(user) {
    return {};
}

export function registerTask(taskId, user) {
    return request("registerTask", { taskId, user });
}