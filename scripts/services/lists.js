// @see http://docs.angularjs.org/api/ngResource.$resource

'use strict';

angular.module('vsko.stock')

.factory('Lists', ['$http', '$q', 'uuid4', function ($http, $q, uuid4) {

		var url = telasAPIUrl;

        this.clothPlottersHistory = function(cloth)
        {
        	return $http.get(url + 'lists_GET.php?plottersHistory=true&clothId='+cloth.id);
        };

        this.betweenDates = function(filter, type, groupBy)
        {
        	var startDate = filter.startDate ? filter.startDate : "01-01-1000";
        	var endDate = filter.endDate ? filter.endDate : "12-12-2999";
        	var paramCloth = (filter.selectedCloth && filter.selectedCloth.id) ? ('&clothId='+filter.selectedCloth.id) : '';
        	var paramInvoice = (filter.invoice) ? ('&invoiceNumber='+filter.invoice) : '';
					var paramUser = (filter.selectedUser && filter.selectedUser.name) ? ('&userName='+filter.selectedUser.name) : '';
					var paramGroup = (filter.selectedGroup && filter.selectedGroup.name) ? ('&groupName='+filter.selectedGroup.name) : '';
					var paramProvider = (filter.selectedProvider && filter.selectedProvider.name) ? ('&providerName='+filter.selectedProvider.name) : '';

					var paramGroupBy = groupBy ? '&groupBy='+groupBy : '';

        	return $http.get(url + 'lists_GET.php?betweenDates=true&type='+type+'&startDate='+startDate+"&endDate="+endDate+paramCloth+paramInvoice+paramUser+paramGroup+paramProvider+paramGroupBy);
        };

				this.betweenDatesGroupedBy = function(filter, type)
        {
        	var startDate = filter.startDate ? filter.startDate : "01-01-1000";
        	var endDate = filter.endDate ? filter.endDate : "12-12-2999";
        	var paramCloth = (filter.selectedCloth && filter.selectedCloth.id) ? ('&clothId='+filter.selectedCloth.id) : '';
        	var paramInvoice = (filter.invoice) ? ('&invoiceNumber='+filter.invoice) : '';
					var paramUser = (filter.selectedUser && filter.selectedUser.name) ? ('&userName='+filter.selectedUser.name) : '';

        	return $http.get(url + 'lists_GET.php?betweenDates=true&type='+type+'&startDate='+startDate+"&endDate="+endDate+paramCloth+paramInvoice+paramUser);
        };

        this.clothsUnderStock = function(filter)
        {
        	var groupId = filter.groupId ? "&groupId="+filter.groupId : "";
        	return $http.get(url + 'lists_GET.php?underStock=true'+groupId);
        };

        this.getAllRolls = function(distincts)
        {
        	return $http.get(url + 'rolls_GET.php?all=true&distincts='+distincts);
        };

        this.getRollLotes = function(roll)
        {
        	return $http.get(url + 'rolls_GET.php?lotes=true&rollNumber='+roll.number);
        };

        this.getRollCuts = function(roll, cloth)
        {
        	var rollParam = roll ? '&rollId='+roll.id : '';
        	var clothParam = cloth ? '&clothId='+cloth.id : '';

        	return $http.get(url + 'rolls_GET.php?cuts=true'+rollParam+clothParam);
        };

				this.stockUpToDate = function(groupId, date, includeStock0)
        {
        	return $http.get(url + 'lists_GET.php?upToDate=true&groupId='+groupId+'&date='+date+'&includeStock0='+includeStock0);
        };

				this.getPrices = function(group)
        {
					var groupCondition = group ? '&groupId='+group.id : '';

        	return $http.get(url + 'lists_GET.php?getPrices=true'+groupCondition);
        };

				//---------------------------------------------------------------------------//

        this.executeQuery = function(query)
        {
        	return $http.get(url + 'lists_GET.php?executeQuery=true&query='+query);
        };

        this.executeUpdate = function(query)
        {
        	return $http.get(url + 'lists_GET.php?executeUpdate=true&query='+query);
        };

				this.executePostUpdate = function(query)
        {
					var payload = {query: query};
        	return $http.post(url + 'lists_POST.php?executeUpdate=true', payload);
        };


				//---------------------------------------------------------------------------//

				this.log = function(log)
        {
        	return $http.post(url + 'log_POST.php', log);
        };

        return this;
    }]);
