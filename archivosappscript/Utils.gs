var __tareasHogarSpreadsheet = null;

function getSheet() {
  if (!__tareasHogarSpreadsheet) {
    __tareasHogarSpreadsheet = SpreadsheetApp.openById(
      "1raDEhPcRzjyY2R0qh73Ts0UVDOJlOfsKnZHSBipKBYA"
    );
  }

  return __tareasHogarSpreadsheet;
}

function json(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}