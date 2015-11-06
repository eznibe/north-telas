'use strict';

angular.module('vsko.stock')

.directive('djaiModal', function($modal, Stock) {
        
    return {
          restrict: 'E',
          link: function postLink(scope, element, attrs) {
              
        	  var $scope = scope;

        	  
        	  $scope.showDjaiModal = function(djai, previousModal) {
              	
        		  if(!djai) {
        			  $scope.djai = {};
        			  $scope.origDjai = {};
        			  
        			  if(!$scope.djai.cloths || $scope.djai.cloths.length == 0) {
            			  // init with one cloth empty, useful for creating new djai
                      	  $scope.djai.cloths = new Array();
//                      	  $scope.djai.cloths.push({});
                      }
        			  
        			  Stock.getAllCloths().then(function(result) { $scope.allCloths = result.data; });
        		  }
        		  else {
        			  
        			  Stock.getDjai(djai, 'FULL').then(function(result){
        				  
//        				  $scope.djai = $.extend(true, djai, result.data);
        				  $scope.djai = result.data;
        	              	
                		  $scope.origDjai = $.extend(true, {}, $scope.djai); // used when the user cancel the modifications (close the modal)
                      	
                		  if(!$scope.allCloths) {
                			  
            	        	  Stock.getAllCloths().then(function(result) {
            	        		  $scope.allCloths = result.data;
            	        		  
            	        		  loadSelectedCloth($scope.allCloths);
            	          	  });
                    	  }
                		  else {
	                		  loadSelectedCloth($scope.allCloths);
                		  }
        			  });
        		  }
              	
              	

              	  $scope.modalDjai = $modal({template: 'views/modal/djai.html', show: false, scope: $scope, backdrop:'static', animation:'am-fade-and-slide-top'});

                  $scope.modalDjai.$promise.then($scope.modalDjai.show);
                  
                  
                  if(previousModal) {
        			  $scope.previousModal = previousModal;
        			  previousModal.hide();
        		  }
              };
        	  
              $scope.addCloth = function() {
            	  $scope.djai.cloths.push({});
              };
              
              $scope.removeCloth = function(index) {
            	  $scope.djai.cloths.splice(index, 1);
              	
              	  if($scope.djai.cloths.length==0) {
//              		  $scope.djai.cloths.push({});
              	  }
              };
              
              $scope.save = function() {
              
            	  // save changes in each cloth (extending current values only if a new cloth was selected)
              	  $scope.djai.cloths.each(function( item ) {
              		if(item.selectedCloth && item.id != item.selectedCloth.id) {
              			$.extend(item, item.selectedCloth);
              			//item.id = item.selectedCloth.id; // when the cloth is new the previsionid is not set, other cases will have no effect
              		}
              	  });

              	  
              	  Stock.saveDjai($scope.djai).then(function(result) {
              		  
              		  if(result.data.successful && result.data.isNew) {
              			
              			  //$scope.djais.push($scope.djai);
              		  }
              	  });
              	
              	  
              	  $scope.modalDjai.hide();
              	  
              	  if($scope.previousModal) {
              		  $scope.previousModal.show();
              	  }
              };
              
              $scope.deleteDjai = function(djai) {
              	
            	  console.log('Deleteing djai: '+djai.id);
              	
              };
              
              $scope.close = function(force) {
              	
            	  $.extend($scope.djai, $scope.origDjai);
              	
              	  $scope.modalDjai.hide();
              	  
              	  if($scope.previousModal && !force) {
              		  $scope.previousModal.show();
            	  }
              };
              
              $scope.back = function() {
                	
            	  $.extend($scope.djai, $scope.origDjai);
              	
              	  $scope.modalDjai.hide();
              	  
              	  if($scope.previousModal) {
              		  $scope.previousModal.show();
            	  }
              };
              
              function dbFormat(date) {
            	  
            	  if(!date) return;
            	  
            	  var dateParts = date.split("-");

              	  return dateParts[2] + "-" + dateParts[1] + "-" + dateParts[0];
              }
              
              function loadSelectedCloth(allCloths) {
            	  // set current value for each cloth (needed for dropdown)
              	  $scope.djai.cloths.each(function( cloth ) {
              		  cloth.selectedCloth = allCloths.findAll({id:cloth.id})[0];
              	  }); 
              }
          }
        };
	}
);
