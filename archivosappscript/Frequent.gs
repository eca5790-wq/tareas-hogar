function getFrequentTasks() {
  const history = getCachedHistory();
  const taskRows = getTasksTable().slice(1);
  const categoriesMap = getCategoriesMap();
  const counter = {};

  history.forEach(row => {
    const taskId = row[3];
    if (!taskId) return;

    counter[taskId] = (counter[taskId] || 0) + 1;
  });

  return taskRows
    .map(row => {
      const taskId = row[0];

      return {
        id: taskId,
        nombre: row[1],
        categoriaId: Number(row[2]),
        categoria: categoriesMap[Number(row[2])] || "General",
        puntos: Number(row[3]) || 0,
        activa: row[4],
        uso: counter[taskId] || 0,
        usos: counter[taskId] || 0
      };
    })
    .sort((a, b) => b.usos - a.usos)
    .slice(0, 5);
}