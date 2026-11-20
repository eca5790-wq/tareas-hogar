function getCategories() {
  const values = getCategoriesTable();

  return values
    .slice(1)
    .filter(row => row[0] !== "" && row[0] !== null)
    .map(row => ({
      id: row[0],
      nombre: row[1],
      icono: row[2] || "",
      color: row[3] || ""
    }));
}

function getCategoriesMap() {
  const map = {};

  getCategories().forEach(category => {
    map[category.id] = category.nombre;
  });

  return map;
}