function doGet() {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("Form Responses 1"); 
    if (!sheet) {
        return ContentService.createTextOutput(JSON.stringify({ error: "Sheet 'Form Responses 1' not found. Check sheet name." }))
            .setMimeType(ContentService.MimeType.JSON);
    }

    var data = sheet.getDataRange().getValues();

    if (data.length < 2) {
        return ContentService.createTextOutput(JSON.stringify({ error: "No data available in the sheet." }))
            .setMimeType(ContentService.MimeType.JSON);
    }

    var headers = data[0]; 
    var results = {}; 

    // 🔹 Read votes for each position
    for (var i = 1; i < data.length; i++) {
        for (var j = 1; j < headers.length; j++) { 
            var position = headers[j].trim(); 
            var candidate = data[i][j];

            if (!candidate) continue; 

            var candidates = candidate.split(",").map(c => c.trim()); // 

            if (!results[position]) {
                results[position] = {};
            }

            candidates.forEach(name => {
                results[position][name] = (results[position][name] || 0) + 1;
            });
        }
    }

    // 🔹 Convert results to structured JSON
    var formattedResults = Object.keys(results).map(position => ({
        position: position,
        candidates: Object.entries(results[position]).map(([name, votes]) => ({
            candidate: name,
            votes: votes
        }))
    }));

    return ContentService.createTextOutput(JSON.stringify(formattedResults))
        .setMimeType(ContentService.MimeType.JSON);
}


