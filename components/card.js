export function card(title, content) {

    return `

        <section class="card">

            <div class="card-header">

                <h3>${title}</h3>

            </div>

            <div class="card-content">

                ${content}

            </div>

        </section>

    `;

}