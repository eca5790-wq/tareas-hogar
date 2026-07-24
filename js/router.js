import { loadHome } from "../pages/home.js";
import { loadRegister } from "../pages/register.js";
import { loadTasks } from "../pages/tasks.js";
import { loadStats } from "../pages/stats.js";
import { loadSettings } from "../pages/settings.js";

const routes = {

    home: loadHome,

    register: loadRegister,

    tasks: loadTasks,

    stats: loadStats,

    settings: loadSettings

};

let currentPage = "home";

export function navigate(page){

    currentPage = page;

    routes[page]();

}

export function getCurrentPage(){

    return currentPage;

}

export function registerRoute(name,handler){

    routes[name] = handler;

}