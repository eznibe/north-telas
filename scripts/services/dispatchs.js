// @see http://docs.angularjs.org/api/ngResource.$resource

'use strict';

angular.module('vsko.stock')

.factory('Dispatchs', ['$http', 'uuid4', function ($http, uuid4) {

		var url = telasAPIUrl;

        this.getDispatchs = function(expand, filter)
        {
					var startDate = filter && filter.startDate ? filter.startDate : "01-01-1000";
					var endDate = filter && filter.endDate ? filter.endDate : "12-12-2999";

					var filterParam = '';
					if (filter && filter.selectedOption!=null && filter.value != null && filter.value != '') {
						filterParam += '&filterKey=' + filter.selectedOption.key;
						filterParam += '&filterValue=' + filter.value;
					}

        	return $http.get(url + 'dispatchs_GET.php?expand='+(expand ? expand : 'NONE')+'&startDate='+startDate+"&endDate="+endDate + filterParam);
        };

				this.getDispatch = function(id)
        {
        	return $http.get(url + 'dispatchs_GET.php?id='+id);
        };

				this.getNextDispatchNumber = function()
        {
        	return $http.get(url + 'dispatchs_GET.php?nextNumber=true');
        };

				this.getDispatchCarries = function(dispatchId)
        {
        	return $http.get(url + 'dispatchs_GET.php?carriesOf='+dispatchId);
        };

				this.getDispatchDestinataries = function()
        {
        	return $http.get(url + 'dispatchs_GET.php?destinataries=true');
        };

        this.save = function(dispatch, loggedUser) {

        	if(!dispatch.id)
        		dispatch.id = uuid4.generate();

        	$.each(dispatch.previsions, function(index){
        		if(!this.dpId)
        			this.dpId = uuid4.generate();
        	});

        	return $http.post(url + 'dispatchs_POST.php', dispatch);
        };

        this.addPrevision = function(prevision, dispatchId) {

					if (!prevision.dpId) {
						prevision.dpId = uuid4.generate();
						prevision.dispatchId = dispatchId;
					}

        	return $http.post(url + 'dispatchs_POST.php?addPrevision=true', prevision);
        };

				this.updatePrevisionField = function(prevision, fieldName, isNumeric) {

					var numeric = '';
					if (isNumeric) {
						numeric = '&isNumber=true';
					}

        	return $http.post(url + 'dispatchs_POST.php?edit='+fieldName + numeric, prevision);
        };

				this.updatePrevisionCarry = function(prevision) {

        	return $http.post(url + 'dispatchs_POST.php?updatePrevisionCarry=true', prevision);
        };

				this.saveCarry = function(carry) {

					if(!carry.id)
						carry.id = uuid4.generate();

        	return $http.post(url + 'dispatchs_POST.php?saveCarry=true', carry);
        };

				this.archive = function(dispatch) {

        	return $http.post(url + 'dispatchs_POST.php?archive=true', dispatch);
        };

				this.restore = function(dispatch) {

        	return $http.post(url + 'dispatchs_POST.php?restore=true', dispatch);
        };

        this.remove = function(dispatch) {

        	return $http.delete(url + 'dispatchs_DELETE.php?id='+ dispatch.id);
        };

        this.removePrevision = function(prevision) {

        	return $http.delete(url + 'dispatchs_DELETE.php?dispatchPrevisionId='+prevision.dpId, prevision);
        };

				this.removeCarry = function(carry) {

        	return $http.delete(url + 'dispatchs_DELETE.php?carryId='+carry.id, carry);
        };

        return this;
    }]);
