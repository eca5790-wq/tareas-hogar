export function card(title, content = "") {

    return `

        <section class="card">

            <h3 class="card-title">

                ${title}

            </h3>

            <div class="card-content">

                ${content}

            </div>

        </section>

    `;

}