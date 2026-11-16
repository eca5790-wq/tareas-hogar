import { loadHome } from "../pages/home.js";
import { loadRegister } from "../pages/register.js";
import { loadTasks } from "../pages/tasks.js";
import { loadStats } from "../pages/stats.js";
import { loadSettings } from "../pages/settings.js";
import { loadHistory } from "../pages/history.js";

const routes = {

    home: loadHome,

    register: loadRegister,

    tasks: loadTasks,

    stats: loadStats,

    settings: loadSettings,

    history: loadHistory

};

let currentPage = "home";

export async function navigate(page, force = false) {

    if (!force && page === currentPage) {

        return;

    }

    const handler = routes[page];

    if (!handler) {

        console.error(`Ruta no encontrada: ${page}`);

        return;

    }

    const previousPage = currentPage;

    // Solo confirmamos la navegación si el handler termina bien; si falla, se puede reintentar.
    try {

        await handler();

        currentPage = page;

    } catch (error) {

        currentPage = previousPage;

        throw error;

    }

}

export function getCurrentPage() {

    return currentPage;

}

export function registerRoute(name, handler) {

    routes[name] = handler;

}
