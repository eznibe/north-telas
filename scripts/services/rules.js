/**
 *
 */
angular.module('vsko.stock').factory('Rules',[ '$q', 'Previsions', 'Production', function ($q, Previsions, Production) { //eslint-disable-line
  var that = {};

  that.updatePrevisionPercentage = function (prevision, save) {
    var lastPercentage = prevision.percentage

    // . a 0% si no tiene nada cargado
    if (!prevision.infoDate && !prevision.advanceDate && prevision.percentage < 6) {
      prevision.percentage = 0;
    }
    // . de 0 pasa a 3% si se le tilda SOLO el anticipo.
    if (!prevision.infoDate && prevision.advanceDate && prevision.percentage < 6) {
      prevision.percentage = 3;
    }
		// . de 0 a 4% si se le tilda SOLO la INFO.
    if (prevision.infoDate && !prevision.advanceDate && prevision.percentage < 6) {
      prevision.percentage = 4;
    }
		// . de 0/3 o 4 pasa a 5% si se tilda INFO y ANTICIPO.
    if (prevision.infoDate && prevision.advanceDate && prevision.percentage < 6) {
      prevision.percentage = 5;
    }

    // . de 5 a 6% si se tilda DISEÑADA.
    if (prevision.designed && prevision.percentage < 6) {
      prevision.percentage = 6;
    }

    // . a 25% una vez que se corta. (no importa % anterior)
    if (prevision.percentage < 25 && prevision.allCutted) {
      prevision.percentage = 25;
    }

    if(lastPercentage != prevision.percentage) {
      prevision.percentageChanged = true;
    }

    if (prevision.percentageChanged && save) {
      Previsions.editField(prevision, 'percentage');
    }
  };

  that.updatePrevisionDeliveryDate = function (prevision, save) {

    var d = $q.defer();

    var lastDeliveryDate = prevision.deliveryDate

    var selectedLine = prevision.selectedLine ? prevision.selectedLine.name : prevision.line;

    // .
    if (prevision.infoDate && prevision.advanceDate && selectedLine) {

      var dateToStartFrom = moment(prevision.advanceDate, "DD-MM-YYYY").valueOf() > moment(prevision.infoDate, "DD-MM-YYYY").valueOf()
                                  ? prevision.advanceDate
                                  : prevision.infoDate;
      var newDate = moment(dateToStartFrom, "DD-MM-YYYY");

      Production.getWeeksBySeason().then(function(weeksBySeason) {

        weeks = getCorrespondingWeek(selectedLine, weeksBySeason.data);

        if (weeks != 0 && prevision.deliveryDateManuallyUpdated !== '1') {
          prevision.deliveryDate = newDate.add(weeks * 7, 'days').format('DD-MM-YYYY');

          if(lastDeliveryDate != prevision.deliveryDate) {
            prevision.deliveryDateChanged = true;
          }

          if (prevision.deliveryDateChanged && save) {
            Production.updateDate(prevision, 'deliveryDate').then(function() {
              d.resolve(true);
            });
          }
        }
      });
    } else {
      d.resolve(false);
    }

    return d.promise;
  };

  function getCorrespondingWeek(line, weeksBySeason) {

    if (line && (line == 'OD' || line == 'CA' || line == 'REP')) {
      return +weeksBySeason.filter(function(p) { return p.name == 'seasonWeeks.1'; })[0].value;
    } else if (line && (line == 'NY' || line == 'RA' || line == 'DA')) {
      return +weeksBySeason.filter(function(p) { return p.name == 'seasonWeeks.2'; })[0].value;
    }

    return 0;
  }

  return that;
}]);
