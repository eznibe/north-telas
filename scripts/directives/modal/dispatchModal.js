'use strict';

angular.module('vsko.stock')

.directive('dispatchModal', function($modal, Utils, Stock, OneDesign) {

    return {
          restrict: 'E',
          link: function postLink(scope, element, attrs) {

        	  var $scope = scope;

        	  // Stock.getAllCloths().then(function(result) {
        		//   $scope.cloths = result.data;
          	//   });


        	  $scope.showDispatchModal = function(dispatch) {

        		  $scope.dispatch = dispatch ? dispatch : {isNew: true};

              $scope.modalDispatch = $modal({template: 'views/modal/dispatchDetails.html', show: false, scope: $scope});

              $scope.modalDispatch.$promise.then($scope.modalDispatch.show);
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

          }
        };
	}
);
