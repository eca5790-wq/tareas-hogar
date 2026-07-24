import { loadHome } from "../pages/home.js";
import { loadRegister } from "../pages/register.js";
import { loadTasks } from "../pages/tasks.js";
import { loadStats } from "../pages/stats.js";
import { loadSettings } from "../pages/settings.js";

export function navigate(page) {

    switch(page){

        case "home":
            loadHome();
            break;

        case "register":
            loadRegister();
            break;

        case "tasks":
            loadTasks();
            break;

        case "stats":
            loadStats();
            break;

        case "settings":
            loadSettings();
            break;

        default:
            loadHome();

    }

}