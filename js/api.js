const API_URL = "";

// Cambia esta URL cuando tengamos desplegado Apps Script.

async function request(action, data = {}) {

    if (!API_URL) {
        return mock(action, data);
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
                today: [],
                week: {
                    Elena: 0,
                    "Tomás": 0
                },
                recent: [],
                forgotten: []
            };

        default:
            return {};

    }

}

export function getHomeData(user) {

    return request("home", { user });

}