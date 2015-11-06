'use strict';

angular.module('vsko.stock')

.factory('Files', ['$http', function ($http) {

    	var url = 'http://localhost:8080';
    	var apiContext = '/files/';
    	
        this.list = function(uri) 
        { 
        	return $http.get(url + apiContext + 'paths/' + uri);
        };
        
        this.createFolder = function(uri) 
        { 
        	return $http.post(url + apiContext + 'paths/' + uri);
        }; 
        
        this.contentHref = function(key)
        {
        	return url + apiContext + key + '/content';
        };
        
        this.previewHref = function(href, preview, width, height)
        {
        	return url + href + '?preview='+preview;//+'&width='+width+'&height='+height;
        };
        

        return this;
    }]);

