export function loadHome(){

    document.getElementById("header").innerHTML=`

        <h2>Tareas Hogar</h2>

        <div>👩</div>

    `;

    document.getElementById("content").innerHTML=`

        <div class="card">

            <h3>📅 Hoy</h3>

            <p>No hay tareas programadas.</p>

        </div>

        <div class="card">

            <h3>🏆 Esta semana</h3>

            <p>Elena 0 pts</p>

            <p>Tomás 0 pts</p>

        </div>

    `;

}