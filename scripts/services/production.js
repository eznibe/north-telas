// @see http://docs.angularjs.org/api/ngResource.$resource

'use strict';

angular.module('vsko.stock')

.factory('Production', ['$http', 'uuid4', function ($http, uuid4) {

		var url = telasAPIUrl;

      this.getLines = function()
      {
				var lines = [{name: 'OD'}, {name: 'CA'}, {name: 'NY'}, {name: 'RA'}, {name: 'DA'}, {name: 'REP'}];
      	return lines;
      };

      this.getPrevisions = function(clothId)
      {
      	return $http.get(url + 'previsions_GET.php?clothId='+clothId+'&designed=false&expand=FULL');
      };

      this.save = function(prevision, loggedUser) {

				if(prevision.previsionId) {
					prevision.id = prevision.previsionId;
				}

      	if(!prevision.id)
      		prevision.id = uuid4.generate();

      	$.each(prevision.cloths, function(index){
      		if(!this.cpId)
      			this.cpId = uuid4.generate();
      	});

				prevision.modifiedBy = loggedUser;

      	return $http.post(url + 'previsions_POST.php', prevision);
      };

      return this;
    }]);
