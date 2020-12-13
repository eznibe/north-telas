var XLSX = require('xlsx');

// this is generated using view v_onedesign_max_sequence_by_model
// var workbook = XLSX.readFile('/home/ezequiel/work/north-sites/telas/nodejs-scripts/raw-models.xls');
const workbook = XLSX.readFile('/home/ezequiel/work/north-sites/telas/nodejs-scripts/v_onedesign_max_sequence_by_model.prod.csv');

var sheet_name_list = workbook.SheetNames;

function isNumeric(str) {
  if (typeof str != "string") return false // we only process strings!  
  return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
          !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
}

sheet_name_list.forEach(function(y) {
    
    var xlData = XLSX.utils.sheet_to_json(workbook.Sheets[y]);
    
    xlData.forEach(function(row) {
      // console.log(row);
      row.model = row.model || 'NULL';

      let updatedModel = row.model;
      let modelParts = row.model.split('-');
      let sequence = row.model.split('-').pop();
      if (modelParts.length > 1 && sequence && isNumeric(sequence)) {
        modelParts.pop();
        updatedModel = modelParts.join('-');
      }
      // console.log(`UPDATE onedesignmodels SET model = '${updatedModel}' WHERE boat = '${row.boat}' and model = '${row.model}' and country = '${row.country}';`);
      let insert = `INSERT INTO onedesignmodels (boat, sail, model, country) VALUES ('${row.boat}', '${row.sail}', '${updatedModel}', '${row.country}');`;
      insert = insert.replace('\'<null>\'', 'null');
      insert = insert.replace('\'NULL\'', 'null');
      console.log(insert);
    });
});
