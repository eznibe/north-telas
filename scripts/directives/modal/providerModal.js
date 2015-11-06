'use strict';

angular.module('vsko.stock')

.directive('providerModal', function($modal, Stock, Orders) {
        
    return {
          restrict: 'E',
          link: function postLink(scope, element, attrs) {
              
        	  var $scope = scope;

        	  $scope.pctNac = 1.45; // TODO move to constants
        	  Stock.getDolar().then(function(result){
        		  $scope.dolar = result.data[0].value;
        	  });
        	  
        	  $scope.showProviderModal = function(provider) {
        		  
        		  $scope.provider = provider;
              	
                  $scope.modalNewProduct = $modal({template: 'views/modal/provider.html', show: false, scope: $scope});

                  $scope.modalNewProduct.$promise.then($scope.modalNewProduct.show);
        	  };
        	  
        	  $scope.saveProvider = function(provider) {
        		  
        		  Stock.saveCloth(cloth).then(function(result){

        			  Stock.getAllGroups().then(function(result){
        				  // refresh groups because of possible modification in the cloth group 
                  		  $scope.groups = result.data;
                  		  
            			  $scope.modalNewProduct.hide();
            			  
            			  $.notify("Cambios guardados.", {className: "success", globalPosition: "bottom right"});
                  	  });
        		  });
        	  };
        	  
        	  $scope.showBuyModal= function(provider, product) {
              	
              	  // init selected cloth provider
        		  $scope.provider = provider;
        		  $scope.product = product;
              	  $scope.cloth = {name: product.name};
              	
              	
                  $scope.modalBuy = $modal({template: 'views/modal/buy.html', show: false, scope: $scope, animation:'am-fade-and-slide-top'});

                  $scope.modalBuy.$promise.then($scope.modalBuy.show);
              }; 
              
              $scope.buy = function(amount) {

            	  $scope.modalBuy.hide();
            	  
            	  $scope.provider.amount = amount;
            	  $scope.provider.providerId = $scope.provider.id;  
            	  $scope.provider.productId = $scope.product.productId;
            	  $scope.provider.clothId = $scope.product.clothId;
            	  $scope.provider.price = $scope.product.price;
            	  
            	  Orders.buy($scope.provider).then(function(result){
            		 
            		  // show feedback message
            		  $.notify("Cantidad a comprar: "+amount+ " mts", {className: "success", globalPosition: "bottom right"});
            	  });
              };
              
              $scope.toPriceNac = function(price) {

            	  return (price * $scope.pctNac).toFixed(2) ;
              };
              
              $scope.toPriceRef = function(price) {

            	  return (price * $scope.pctNac * $scope.dolar).toFixed(2);
              };
          }
        };
	}
)

.directive('newProductModal', function($modal, Stock, Orders) {
        
    return {
          restrict: 'E',
          link: function postLink(scope, element, attrs) {
              
        	  var $scope = scope;

        	  Stock.getAllCloths().then(function(result) {
        		  $scope.cloths = result.data;
          	  });
        	  
        	  $scope.showNewProductModal = function(provider) {
        		  
        		  $scope.newProduct = {provider: provider ? provider : {}, selectedCloth: {}};
              	
                  $scope.modalNewProduct = $modal({template: 'views/modal/newProduct.html', show: false, scope: $scope});

                  $scope.modalNewProduct.$promise.then($scope.modalNewProduct.show);
        	  };
        	  
        	  $scope.saveNewProduct = function(newProduct) {
        		  
        		  newProduct.clothId = newProduct.selectedCloth.id;
        		  
        		  Stock.saveNewProduct(newProduct).then(function(result){
        			  
        			  	  if(result.data.isNewProvider) {
        			  		  $scope.providers.push(result.data.provider);
        			  	  }
        			  	  else {
        			  		  $scope.provider.products.push(result.data.product);
        			  	  }
        			  	  
            			  $scope.modalNewProduct.hide();
            			  
            			  $.notify("Nuevo producto guardado.", {className: "success", globalPosition: "bottom right"});
        		  });
        	  };
          }
        };
	}
);
