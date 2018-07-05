'use strict';

angular.module('vsko.stock')

.factory('Temporaries', ['$http', 'uuid4', function ($http, uuid4) {

  var url = telasAPIUrl;

  this.getAllDispatchs = function()
  {
    return $http.get(url + 'temporaries_GET.php?expand=FULL');
  } ;

  this.getFilesList = function(filter)
  {
    return $http.post(url + 'temporaries_POST.php?filesList=true', filter);
  };

  this.getTemporariesStock = function(groupId)
  {
    return $http.get(url + 'temporaries_GET.php?stock=true&groupId='+groupId);
  };

  /**
   * Dispatch info with an array of temporaries products to be created as files
   */
  this.saveDispatch = function(dispatch) {

    if (!dispatch.id) {
      dispatch.id = uuid4.generate();
    }
    // updates some the info section of the order
    return $http.post(url + 'temporaries_POST.php?saveDispatch=true', dispatch);
  };

  this.updateDispatchField = function(dispatch, fieldName, isDate) {

    var date = '';
    if (isDate) {
      date = '&isDate=true';
    }
        
    return $http.post(url + 'temporaries_POST.php?editDispatch=true&field='+fieldName + date, dispatch)
  }

  this.saveFile = function(tFile) {

    if (!tFile.id) {
      tFile.id = uuid4.generate();
    }
    
    return $http.post(url + 'temporaries_POST.php?saveFile=true', tFile);
  };

  this.updateFileField = function(tFile, fieldName, isNumeric) {
    var numeric = '';
    if (isNumeric) {
      numeric = '&isNumber=true';
    }
        
    return $http.post(url + 'temporaries_POST.php?editFile=true&field='+fieldName + numeric, tFile)
  }

  this.saveDownload = function(download, loggedUser) {

    if (!download.id) {
      download.id = uuid4.generate();
    }
    download.downloadedBy = loggedUser;
    
    return $http.post(url + 'temporaries_POST.php?saveDownload=true', download);
  };

  this.deleteDownload = function(download) {

    return $http.post(url + 'temporaries_DELETE.php?deleteDownload=true', download);
  };


  return this;
}]);
