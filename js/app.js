import { loadNavbar } from "../components/navbar.js";
import { navigate } from "./router.js";

document.addEventListener("DOMContentLoaded", () => {
    loadNavbar();
    navigate("home");
});