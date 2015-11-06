'use strict';

angular.module('vsko.stock')

.directive('documentsModal', function($modal, Files) {
        
    return {
          restrict: 'E',
          link: function postLink(scope, element, attrs) {
              
        	  var $scope = scope; // scope of the template where is located the directive (first parent?)
        	  
        	  $scope.loading = true;
        	  
        	  $scope.showDocuments= function(path, previousModal) {
              	
              	  // init selected cloth provider
        		  $scope.path = path;
              	
        		  if(previousModal) {
        			  $scope.previousModal = previousModal;
        			  previousModal.hide();
        		  }
              	
                  $scope.modalDocuments = $modal({template: 'views/modal/documents.html', show: false, scope: $scope, animation:'am-fade-and-slide-top'});

                  $scope.modalDocuments.$promise.then(function(){
                			  
                			  $scope.modalDocuments.show();
                			  
                			  Files.list($scope.path).then(
                					  function(response){
	                    				  $scope.documents = response.data.results;
	                    				  $scope.loading = false;
	                    			  },
	                    			  function(error){
	                    				  console.log(error);
	                    			  }
	                    	  );
                		  }
				  );
              }; 
              
              $scope.upload = function() {
            	  
              };
              
              $scope.downloadContentHref = function(document) {
            	  
            	  return Files.contentHref(document.$$expanded.key);
              };
              
              $scope.previewHref = function(document) {
            	  
            	  return Files.previewHref(document.href, 'medium', 180, 150);
              };
              
              $scope.back = function() {
            	  
            	  $scope.modalDocuments.hide();
            	  $scope.previousModal.show();
              };
              
              $scope.ok = function() {

            	  $scope.modalDocuments.hide();
            	  
            	  alert('Path: '+$scope.path);
              };
          }
        };
    }
);
