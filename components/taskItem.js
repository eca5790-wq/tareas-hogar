export function taskItem(name, points = null, subtitle = "") {

    return `
        <div class="task-item">

            <div class="task-info">

                <div class="task-name">${name}</div>

                ${subtitle ? `<div class="task-subtitle">${subtitle}</div>` : ""}

            </div>

            ${points !== null ? `
                <div class="task-points">
                    ${points}
                </div>
            ` : ""}

        </div>
    `;

}