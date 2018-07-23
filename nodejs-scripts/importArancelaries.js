var XLSX = require('xlsx');

var workbook = XLSX.readFile('/home/ezequiel/work/north-telas/modulo temporarias/POSICIONES ARANC.CON DECLARACION EN CERT.ORIGEN.xlsx');

var sheet_name_list = workbook.SheetNames;


sheet_name_list.forEach(function(y) {
    
    var xlData = XLSX.utils.sheet_to_json(workbook.Sheets[y]);
    
    xlData.forEach(function(row) {
        if (row.clothid) {
            console.log("UPDATE cloths SET arancelary = '"+row['POSICION ARANCELARIA']+"' WHERE id = '"+row.clothid+"';");
        }
    });
});


sheet_name_list.forEach(function(y) {
    var worksheet = workbook.Sheets[y];
    var headers = {};
    var data = [];
    for(z in worksheet) {
        if(z[0] === '!') continue;
        //parse out the column, row, and value
        var tt = 0;
        for (var i = 0; i < z.length; i++) {
            if (!isNaN(z[i])) {
                tt = i;
                break;
            }
        };
        var col = z.substring(0,tt);
        var row = parseInt(z.substring(tt));
        var value = worksheet[z].v;

        //store header names
        if(row == 1 && value) {
            headers[col] = value;
            continue;
        }

        if(!data[row]) data[row]={};
        data[row][headers[col]] = value;

        // console.log(col, row, value)
    }
    // console.log(data[1]);    
});