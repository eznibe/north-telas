'use strict';

angular.module('vsko.stock')

.directive('onedesignModal', function($modal, Utils, Stock, OneDesign) {

    return {
          restrict: 'E',
          link: function postLink(scope, element, attrs) {

        	  var $scope = scope;

        	  Stock.getAllCloths().then(function(result) {
        		  $scope.cloths = result.data;
          	  });


        	  $scope.showOneDesignModal = function(boat) {

        		  $scope.onedesign = boat ? boat : {isNew: true};

        		  $scope.onedesign.isManualSail = false;

        		  // trasform data toshow in table
        		  if(boat) {
	        		  $scope.boat = boat;
	        		  $scope.boat.allsails = getBoatSails(boat);
        		  }
        		  else {
        			  $scope.boat = {};
        		  }

                  $scope.modalOneDesign = $modal({template: 'views/modal/onedesignDetails.html', show: false, scope: $scope});

                  $scope.modalOneDesign.$promise.then($scope.modalOneDesign.show);
        	  };

        	  $scope.save = function(onedesign) {

        		  onedesign.clothId = onedesign.selectedCloth.id;
        		  if(onedesign.selectedSail)
        			  onedesign.sail = onedesign.selectedSail.sail;

        		  OneDesign.save(onedesign).then(function(result){

        			  	  if(result.data.successful) {

        			  		  if(!$scope.boat.allsails)
        			  			  $scope.boat.allsails = [];

        			  		  result.data.onedesign.odId = result.data.onedesign.id;

        			  		  $scope.boat.allsails.push(result.data.onedesign);

        			  		  $scope.onedesign = {boat: result.data.onedesign.boat};

        			  		  $scope.loadSails();
        			  	  }
        			  	  else {

        			  	  }

//            			  $scope.modalOneDesign.hide();

                    Utils.showMessage('notify.od_cloth_added');
        		  });
        	  };

        	  $scope.deleteOneDesignCloth = function(odCloth) {

        		  OneDesign.deleteCloth(odCloth).then(function(result){

        			  if(result.data.successful) {

        				  $scope.boat.allsails.remove(odCloth);

        				  $scope.loadSails();

                  Utils.showMessage('notify.od_cloth_deleted');
        			  }
        		  });
        	  };


        	  function getBoatSails(boat) {

        		  var allsails = new Array();

        		  if(boat) {

	        		  $.each(boat.sails, function(i, sail){

	        			  $.each(sail.cloths, function(j, cloth){

	        				  allsails.push({odId: cloth.odId, sail: sail.sail, boat: boat.boat, cloth: cloth.name, mts: cloth.mts});
	            		  });
	        		  });
        		  }

        		  return allsails;
        	  }

        	  $scope.loadSails = function() {

        		  OneDesign.getSails().then(function(result){
            		  $scope.sails = result.data;
            	  });
        	  };

        	  $scope.loadSails();
          }
        };
	}
);
