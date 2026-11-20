import { renderNavbar } from "../components/navbar.js";
import { showToast } from "../components/toast.js";
import { loadTaskDetail } from "./task-detail.js";

import {
    getTaskSchedule,
    updateTaskSchedule
} from "../js/api.js";

const TYPES = [
    { value: "DIARIA", label: "Cada día" },
    { value: "SEMANAL", label: "Cada semana" },
    { value: "CADA_X_DIAS", label: "Cada X días" },
    { value: "CADA_X_SEMANAS", label: "Cada X semanas" },
    { value: "MENSUAL", label: "Mensual" }
];

// Valores alineados con Date#getDay() (0 = domingo ... 6 = sábado).
const WEEKDAYS = [
    { value: 1, label: "L" },
    { value: 2, label: "M" },
    { value: 3, label: "X" },
    { value: 4, label: "J" },
    { value: 5, label: "V" },
    { value: 6, label: "S" },
    { value: 0, label: "D" }
];

let currentTask = null;
let schedule = null;

export async function loadScheduleEditor(task) {

    currentTask = task;

    document.getElementById("header").innerHTML = `

        <button id="backButton" class="icon-button">

            <span class="material-symbols-rounded">
                arrow_back
            </span>

        </button>

        <h2>Programación</h2>

        <div style="width:40px"></div>

    `;

    document.getElementById("content").innerHTML = `
        <p class="settings-loading">Cargando programación…</p>
    `;

    renderNavbar("tasks");

    document
        .getElementById("backButton")
        .addEventListener("click", () => {

            loadTaskDetail(currentTask);

        });

    try {

        schedule = await getTaskSchedule(currentTask.id);

    } catch (error) {

        console.error("No se pudo cargar la programación:", error);

        showToast("No se pudo cargar la programación.");

        schedule = {
            taskId: currentTask.id,
            tipo: "",
            intervalo: null,
            diasSemana: "",
            diaMes: null,
            fechaInicio: "",
            activa: true
        };

    }

    render();

}

function render() {

    document.getElementById("content").innerHTML = `

        <section class="settings-group">

            ${TYPES.map(type => typeOption(type.value, type.label)).join("")}

        </section>

        <div id="scheduleOptions">

            ${renderTypeFields()}

        </div>

        <section class="settings-group">

            <div class="setting-row">

                <div>

                    <div class="setting-title">Activa</div>

                    <div class="setting-value">Aparece en "Hoy" cuando toca</div>

                </div>

                <label class="switch">

                    <input
                        type="checkbox"
                        id="scheduleActive"
                        ${schedule.activa ? "checked" : ""}
                    >

                    <span class="slider"></span>

                </label>

            </div>

        </section>

        <button id="saveSchedule" class="primary-button">
            Guardar programación
        </button>

        <button id="cancelSchedule" class="secondary-button">
            Cancelar
        </button>

    `;

    initEvents();

}

function typeOption(value, label) {

    return `

        <div
            class="setting-row selectable schedule-type"
            data-type="${value}"
        >

            <span>

                ${label}

            </span>

            <span class="material-symbols-rounded">

                ${schedule.tipo === value ? "check" : "radio_button_unchecked"}

            </span>

        </div>

    `;

}

function renderTypeFields() {

    switch (schedule.tipo) {

        case "SEMANAL":
            return weekdaysField();

        case "CADA_X_DIAS":
            return intervalAndStartDateFields("días");

        case "CADA_X_SEMANAS":
            return intervalAndStartDateFields("semanas");

        case "MENSUAL":
            return monthDayField();

        default:
            return "";

    }

}

function weekdaysField() {

    const selected = String(schedule.diasSemana || "")
        .split(",")
        .map(value => value.trim())
        .filter(Boolean);

    return `

        <section class="settings-group">

            <div class="category-form">

                <p class="settings-help">
                    Elige los días en los que se repite.
                </p>

                <div class="weekday-selector">

                    ${WEEKDAYS.map(day => `

                        <button
                            type="button"
                            class="weekday-chip${selected.includes(String(day.value)) ? " active" : ""}"
                            data-day="${day.value}"
                        >${day.label}</button>

                    `).join("")}

                </div>

            </div>

        </section>

    `;

}

function intervalAndStartDateFields(unitPlural) {

    return `

        <section class="settings-group">

            <div class="category-form">

                <label class="settings-field">

                    <span>Cada cuántos ${unitPlural} se repite</span>

                    <input
                        id="scheduleInterval"
                        type="number"
                        min="1"
                        step="1"
                        value="${schedule.intervalo || 2}"
                    >

                </label>

            </div>

            <div class="category-form">

                <label class="settings-field">

                    <span>Fecha de inicio</span>

                    <input
                        id="scheduleStartDate"
                        type="date"
                        value="${schedule.fechaInicio || ""}"
                    >

                </label>

            </div>

        </section>

    `;

}

function monthDayField() {

    return `

        <section class="settings-group">

            <div class="category-form">

                <label class="settings-field">

                    <span>Día del mes (1-31)</span>

                    <input
                        id="scheduleMonthDay"
                        type="number"
                        min="1"
                        max="31"
                        step="1"
                        value="${schedule.diaMes || 1}"
                    >

                </label>

            </div>

        </section>

    `;

}

function initEvents() {

    document
        .querySelectorAll(".schedule-type")
        .forEach(row => {

            row.onclick = () => {

                schedule.tipo = row.dataset.type;

                render();

            };

        });

    document
        .querySelectorAll(".weekday-chip")
        .forEach(chip => {

            chip.onclick = () => {

                chip.classList.toggle("active");

            };

        });

    document
        .getElementById("cancelSchedule")
        .addEventListener("click", () => {

            loadTaskDetail(currentTask);

        });

    document
        .getElementById("saveSchedule")
        .addEventListener("click", save);

}

async function save() {

    if (!schedule.tipo) {

        showToast("Selecciona un tipo de programación.");

        return;

    }

    const payload = {

        taskId: currentTask.id,
        tipo: schedule.tipo,
        intervalo: null,
        diasSemana: "",
        diaMes: null,
        fechaInicio: "",
        activa: document.getElementById("scheduleActive").checked

    };

    if (schedule.tipo === "SEMANAL") {

        const days = Array.from(
            document.querySelectorAll(".weekday-chip.active")
        ).map(chip => chip.dataset.day);

        if (!days.length) {

            showToast("Selecciona al menos un día de la semana.");

            return;

        }

        payload.diasSemana = days.join(",");

    }

    if (schedule.tipo === "CADA_X_DIAS" || schedule.tipo === "CADA_X_SEMANAS") {

        const interval = Number(document.getElementById("scheduleInterval").value);
        const startDate = document.getElementById("scheduleStartDate").value;

        if (!interval || interval < 1) {

            showToast("Indica cada cuántos días/semanas se repite.");

            return;

        }

        if (!startDate) {

            showToast("Indica una fecha de inicio.");

            return;

        }

        payload.intervalo = interval;
        payload.fechaInicio = startDate;

    }

    if (schedule.tipo === "MENSUAL") {

        const monthDay = Number(document.getElementById("scheduleMonthDay").value);

        if (!monthDay || monthDay < 1 || monthDay > 31) {

            showToast("Indica un día del mes válido (1-31).");

            return;

        }

        payload.diaMes = monthDay;

    }

    try {

        await updateTaskSchedule(payload);

        showToast("Programación guardada.");

        loadTaskDetail(currentTask);

    } catch (error) {

        console.error(error);

        showToast(error?.message || "No se ha podido guardar la programación.");

    }

}
