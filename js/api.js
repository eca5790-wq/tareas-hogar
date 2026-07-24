const API_URL = "";

async function request(action, data = {}) {

    if (!API_URL) {
        return mock(action);
    }

    const response = await fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            action,
            ...data
        })
    });

    return await response.json();

}

function mock(action) {

    switch (action) {

        case "home":

            return {

                today: [
                    // {
                    //     nombre: "Fregar",
                    //     puntos: 20
                    // }
                ],

                week: {
                    Elena: 0,
                    "Tomás": 0
                },

                recent: [
                    // {
                    //     nombre: "Tender ropa",
                    //     usuario: "Elena"
                    // }
                ],

                forgotten: [
                    // {
                    //     nombre: "Limpiar horno",
                    //     puntos: 45,
                    //     dias: 28
                    // }
                ]

            };

        default:

            return {};

    }

}

export function getHomeData(user) {

    return request("home", { user });

}

export function getTasks() {

    return request("tasks");

}

export function registerTask(taskId, user) {

    return request("registerTask", {
        taskId,
        user
    });

}

export function getStats() {

    return request("stats");

}

export function getSettings() {

    return request("settings");

}