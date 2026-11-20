function doGet(e) {
  const action = e.parameter.action;

  switch (action) {
    case "home":
      return json(getHome(e.parameter.user));

    case "deleteHistory":
      return json(deleteHistory(e.parameter));

    case "registerScreen":
      return json(getRegisterScreen(e.parameter.user));

    case "registerTask":
      return json(registerTask(e.parameter));

    case "tasks":
      return json(getTasks());

    case "categories":
      return json(getCategories());

    case "pointsConfiguration":
      return json(getPointsConfiguration());

    case "updatePointsConfiguration":
      return json(updatePointsConfiguration(e.parameter));

    case "exportHistory":
      return json(getHistoryExport());

    case "historyPage":
      return historyPageResponse(e);

    case "createTask":
      return json(createTask(e.parameter));

    case "updateTask":
      return json(updateTask(e.parameter));

    default:
      return json({
        success: false,
        error: "Unknown action"
      });
  }
}

function historyPageResponse(e) {
  const result = getHistoryPage(e.parameter.offset, e.parameter.limit);
  const callback = String(e.parameter.callback || "");

  if (!callback) return json(result);

  // Solo permite un identificador de callback simple para evitar inyectar código.
  if (!/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(callback)) {
    return json({ success: false, error: "Invalid callback" });
  }

  return ContentService
    .createTextOutput(callback + "(" + JSON.stringify(result) + ");")
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}