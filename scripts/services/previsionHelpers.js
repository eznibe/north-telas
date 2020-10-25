/**
 *
 */
angular.module('vsko.stock').factory('PrevisionHelpers',[ '$q', 'uuid4', 'OneDesign', function ($q, uuid4, OneDesign) { //eslint-disable-line
  var that = {};

  // used when assigning an order
  // result: target(ownProduction) with some fields from source(unassigned) 
  that.mergeODPrevisions = function (previsionSource, previsionTarget) {
    return {
      ...previsionTarget,
      odAssigned: true,
      client: previsionSource.client,
      orderNumber: previsionSource.orderNumber,
      deliveryDate: previsionSource.deliveryDate,
      type: previsionSource.type,
      selectedBoat: previsionSource.selectedBoat,
      selectedOneDesignSail: previsionSource.selectedOneDesignSail,
      selectedSailGroup: previsionSource.selectedSailGroup
    };
  };

  // used when unassigning an order
  // result: new own production prevision that keeps the needed values from the given prevision
  that.extractODOwnProduction = function (prevision) {
    const newPrevisionId = uuid4.generate();

    const cloths = prevision.cloths.map(cloth => {
      return {
        ...cloth,
        cpId: uuid4.generate(),
        previsionId: newPrevisionId
      }
    });
    const newPrevision = {
      ...prevision,
      id: newPrevisionId,
      oneDesign: true,
      odAssigned: false,
      ownProduction: true,
      orderNumber: prevision.sailDescription,
      boat: prevision.selectedBoat.boat,
      sailOneDesign: prevision.selectedOneDesignSail.sail,
      sailDescription: prevision.sailDescription,
      percentage: prevision.percentage,
      fabricationDate: prevision.fabricationDate,
      week: prevision.week,
      line: prevision.selectedLine ? prevision.selectedLine.line : undefined,
      priority: prevision.priority,
      cloths
    };

    delete newPrevision.client;
    delete newPrevision.deliveryDate;

    return newPrevision;
  };

  // used when unassigning an order
  that.removeODOwnProductionFields = function (prevision) {
    prevision.selectedBoat = undefined;
    prevision.selectedOneDesignSail = undefined;
    // prevision.percentage = 0;
    delete prevision.fabricationDate;
    delete prevision.sailDescription;
    prevision.ownProduction = false;
    return prevision;
  };


  return that;
}]);
