/**
 *
 */
angular.module('vsko.stock').factory('Rules',[ '$q', 'Previsions', 'Production', function ($q, Previsions, Production) { //eslint-disable-line
  var that = {};

  that.updatePrevisionPercentage = function (prevision, save) {
    var lastPercentage = prevision.percentage

    // . de 0 pasa a 3% si se le tilda SOLO el anticipo.
    if (!prevision.infoDate && prevision.advanceDate) {
      prevision.percentage = 3;
    }
		// . de 0 a 4% si se le tilda SOLO la INFO.
    if (prevision.infoDate && !prevision.advanceDate) {
      prevision.percentage = 4;
    }
		// . de 0/3 o 4 pasa a 5% si se tilda INFO y ANTICIPO.
    if (prevision.infoDate && prevision.advanceDate) {
      prevision.percentage = 5;
    }

    // . de 5 a 6% si se tilda DISEÑADA.
    if (prevision.designed) {
      prevision.percentage = 6;
    }

    // . de 6 a 25% una vez que se corta.
    if (prevision.allCutted) {
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
      var newDate = moment(prevision.advanceDate, "DD-MM-YYYY");

      Production.getWeeksBySeason().then(function(weeksBySeason) {

        weeks = getCorrespondingWeek(selectedLine, weeksBySeason.data);

        if (weeks != 0) {
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

    if (line) {
      return +weeksBySeason.filter(function(p) { return p.name == 'seasonWeeks'; })[0].value;
    } 

    return 0;
  }

  return that;
}]);
