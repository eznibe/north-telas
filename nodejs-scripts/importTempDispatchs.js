/**
 * Steps: 
 * Run this script. 
 * It will generate some insert queries to add rows in the temporaries files table.
 * The inserts will miss only the dispatch id and the cloth name, they should be filled manually
 * 
 */

var XLSX = require('xlsx');

var workbook = XLSX.readFile('/home/ezequiel/work/north-telas/modulo temporarias/FICHAS TEMP.xlsx');

var sheet_name_list = workbook.SheetNames;

var count = 1;

sheet_name_list.forEach(function(y) {
    
    // console.log('Sheet:',y)

    var xlData = XLSX.utils.sheet_to_json(workbook.Sheets[y]);
    
    if (count > 3) {
        var rownr = 1;
        var sheetdata = [y];

        xlData.forEach(function(row) {

            if (rownr == 1) {
                // cloth name
            } else if (rownr == 2) {
                // cloth type
                sheetdata.push(row['__EMPTY_4'])
            } else if (rownr == 3) {
                // roll width
                sheetdata.push(row['__EMPTY_4'].replace('"', ''))
            } else if (rownr == 4) {
                // due date NOT USED
            } else if (rownr == 5) {
                // arancelary pos
                sheetdata.push(row['__EMPTY_4'].replace('\n', ''))
            } else if (rownr == 6) {
                // cif
                sheetdata.push(row['__EMPTY_4'].replace(' USD', ''))
            } else if (rownr == 8) {
                // initial mts
                sheetdata.push(row['__EMPTY_5'])
            }
            
            rownr++;
        });
        
        // console.log('Row:',sheetdata)
        console.log(" INSERT INTO temporariesfile (id, dispatchId, productId, mtsInitial, cif, arancelary, type, rollWidth) " +
                    " SELECT uuid(), 'id-imported-', p.productId, "+sheetdata[5]+", "+sheetdata[4]+", '"+sheetdata[3]+"', '"+sheetdata[1]+"', "+sheetdata[2]+
                    " FROM cloths c join products p on c.id=p.clothId " +
                    " WHERE c.name like '%%' limit 1");
    }

    count++;
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