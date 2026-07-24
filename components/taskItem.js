export function taskItem({

    id = "",

    title,

    subtitle = "",

    points = null,

    icon = "",

    completed = false,

    selectable = true

}) {

    return `

        <div
            class="task-item ${completed ? "completed" : ""}"
            ${id ? `data-id="${id}"` : ""}
            ${selectable ? "" : 'data-disabled="true"'}
        >

            <div class="task-info">

                <div class="task-name">

                    ${title}

                </div>

                ${subtitle ? `

                    <div class="task-subtitle">

                        ${subtitle}

                    </div>

                ` : ""}

            </div>

            ${points !== null ? `

                <div class="task-points">

                    +${points}

                </div>

            ` : ""}

            ${icon ? `

                <span class="material-symbols-rounded">

                    ${icon}

                </span>

            ` : ""}

        </div>

    `;

}