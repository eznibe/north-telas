/**
 *
 */
angular.module('vsko.stock').factory('OneDesignWorktickets',[ '$q', 'uuid4', 'OneDesign', function ($q, uuid4, OneDesign) { //eslint-disable-line
  let that = {};

  function formatDate(date) {
    return date ? date.replace(/-/g, '/') : '';
  }

  function formatString(value) {
    return value || '';
  }

  async function getODModel(prevision) {
    let odmodel = {};

    if (prevision.oneDesign && prevision.selectedBoat && prevision.selectedOneDesignSail) {
      let result = await OneDesign.getModel(prevision.selectedBoat.boat, prevision.selectedOneDesignSail.sail);
      odmodel = result.data.length ? result.data[0] : undefined;
      
      result = await OneDesign.getModelMeasurements(odmodel);
      odmodel.measurements = result.data;

      result = await OneDesign.getModelItems(odmodel);
      odmodel.items = result.data;
    }
    return odmodel
  }

  function fillODData(prevision, odmodel) {
    const wtData = [];

    const measures1 = {
      row: 66,
      columns: ['D', 'G', 'J', 'M', 'P', 'S', 'V']
    };
    const measures2 = {
      row: 70,
      columns: ['D', 'G', 'J', 'M', 'P', 'S', 'V']
    };

    wtData.push({ cell: 'O1', value: formatString(prevision.boat) });
    wtData.push({ cell: 'D5', value: formatString(prevision.boat) });
    wtData.push({ cell: 'F63', value: formatString(prevision.boat) });
    wtData.push({ cell: 'O63', value: odmodel.model });
    wtData.push({ cell: 'T1', value: formatString(prevision.sailDescription) });
    wtData.push({ cell: 'A18', value: formatString(prevision.designObservations) });
    
    wtData.push({ cell: 'D7', value: formatString(prevision.wtSailNumber) }); 
    wtData.push({ cell: 'D8', value: formatString(prevision.wtColor1) }); 
    wtData.push({ cell: 'D9', value: formatString(prevision.wtInsignia) }); 
    wtData.push({ cell: 'D10', value: formatString(prevision.wtRoyalty) }); 
    wtData.push({ cell: 'Q4', value: formatString(prevision.wtDraft) }); 
    wtData.push({ cell: 'Q5', value: formatString(prevision.wtColor2) }); 
    wtData.push({ cell: 'Q6', value: formatString(prevision.wtSail) }); 
    wtData.push({ cell: 'Q7', value: odmodel.model });
    wtData.push({ cell: 'Q10', value: formatString(prevision.selectedSeller.name) }); 

    if (prevision.odAssigned) {
      wtData.push({ cell: 'D4', value: formatString(prevision.client) }); 
      wtData.push({ cell: 'V2', value: prevision.orderNumber }); 
      wtData.push({ cell: 'Q8', value: formatDate(prevision.deliveryDate)}); 
      wtData.push({ cell: 'Q9', value: formatDate(prevision.tentativeDate) }); 
    }

    if (prevision.cloths.length) {
      let rowCloth = 13;
      const columnCloth = 'A';
      prevision.cloths.slice(0, 3).forEach(cloth => {
        wtData.push({ cell: `${columnCloth}${rowCloth}`, value: formatString(cloth.name) }); 
        rowCloth++;
      })
    }

    if (odmodel.measurements) {
      let count = 0;
      odmodel.measurements.slice(0, 7).forEach(measure => {
        if (measure.target && measure.maximum) {
          wtData.push({ cell: `${measures1.columns[count]}${measures1.row}`, value: `${measure.name}: ${measure.target}mm` }); 
          wtData.push({ cell: `${measures1.columns[count]}${measures1.row + 1}`, value: `${measure.name}: ${measure.maximum}mm` }); 
        } else if (measure.target || measure.maximum) {
          wtData.push({ cell: `${measures1.columns[count]}${measures1.row}`, value: measure.name }); 
          wtData.push({ cell: `${measures1.columns[count]}${measures1.row + 1}`, value: `${measure.maximum ? measure.maximum : measure.target}mm` }); 
        }
        count++;
      });

      count = 0;
      odmodel.measurements.slice(7, 14).forEach(measure => {
        if (measure.target && measure.maximum) {
          wtData.push({ cell: `${measures2.columns[count]}${measures2.row}`, value: `${measure.name}: ${measure.target}mm` }); 
          wtData.push({ cell: `${measures2.columns[count]}${measures2.row + 1}`, value: `${measure.name}: ${measure.maximum}mm` }); 
        } else if (measure.target || measure.maximum) {
          wtData.push({ cell: `${measures2.columns[count]}${measures2.row}`, value: measure.name }); 
          wtData.push({ cell: `${measures2.columns[count]}${measures2.row + 1}`, value: `${measure.maximum ? measure.maximum : measure.target}mm` }); 
        }
        count++;
      });
    }

    return wtData;
  }

  function fillCAData(prevision, odmodel) {
    const wtData = [];

    const items = {
      row: 13,
      columns: ['A', 'I']
    };

    wtData.push({ cell: 'O1', value: formatString(prevision.boat) });
    wtData.push({ cell: 'T1', value: formatString(prevision.sailDescription) });

    wtData.push({ cell: 'L8', value: formatString(prevision.observations) });

    if (prevision.odAssigned) {
      wtData.push({ cell: 'D4', value: formatString(prevision.client) }); 
      wtData.push({ cell: 'V2', value: prevision.orderNumber }); 
      wtData.push({ cell: 'D5', value: formatDate(prevision.deliveryDate)}); 
    }

    if (prevision.cloths.length) {
      let rowCloth = 8;
      prevision.cloths.slice(0, 3).forEach(cloth => {
        wtData.push({ cell: `A${rowCloth}`, value: formatString(cloth.name) }); 
        wtData.push({ cell: `I${rowCloth}`, value: formatString(cloth.mts) }); 
        rowCloth++;
      })
    }

    // odmodel.items = [{
    //   name: 'SHOCKORD 3MM',
    //   amount: 15
    // },{
    //   name: 'CIERRE 50"',
    //   amount: 2
    // }]
    if (odmodel.items) {
      let count = 0;
      odmodel.items.forEach(item => {
        wtData.push({ cell: `${items.columns[0]}${items.row + count}`, value: formatString(item.name) }); 
        wtData.push({ cell: `${items.columns[1]}${items.row + count}`, value: formatString(item.amount) }); 
        count++;
      });
    }

    return wtData;
  }

  that.printWorkticket = async function (prevision) {
    const odmodel = await getODModel(prevision);
    const data = odmodel.line === 'OD' ? fillODData(prevision, odmodel) : fillCAData(prevision, odmodel);    
    generateBlob(data, odmodel.line);
  };

  return that;
}]);
