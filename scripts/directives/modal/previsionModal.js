'use strict';

angular.module('vsko.stock')

.directive('previsionModal', function($modal, $rootScope, $q, $translate, countries, Utils, Stock, Previsions, Files, OneDesign, Lists, Production, Rules, Dispatchs, Users, DriveAPI, lkGoogleSettings) {

  return {
    restrict: 'E',
    link: function postLink(scope, element, attrs) {

        	  var $scope = scope;

            $scope.files = [];

            $scope.countries = countries;


            $scope.onBeforePickerOpen = function(elementInfo) {
              // TODO change the drive folder id (prod/design) according to clicked button -> check elementInfo.id == 'productionPicker' / 'designPicker'
              // Note: google-picker module was modified to include this extra call
              // console.log('Google Picker before open!', elementInfo);
            }

            $scope.onLoaded = function () {
            //  console.log('Google Picker loaded!');
            }

            $scope.onPicked = function (docs) {

              // show selection popup, download or delete (only if it doesnt come from upload action)
              if (docs && !docs[0].isNew) {
                // show selection popup, download or delete (only if it doesnt come from upload action)
                $scope.showPrevisionFilesModal(docs);
              } else {
                // new files uploaded
                angular.forEach(docs, function (file, index) {
                  // console.log('Selected', file);
                  if (file.isNew) {
                    Utils.logFiles(file.id, file.name, 'upload', 'production', $scope.prevision.driveIdProduction, $scope.prevision.id);
                  }
                });
                // refersh count of files in folder
                DriveAPI.listFiles($scope.prevision.driveIdProduction).then(function(files) {
                  Utils.translate('Files count', {count: files.length}).then(function(value) {
                    $scope.filesLbl = value;
                  });
                });
              }

            }

            $scope.onCancel = function () {
              // console.log('Google picker close/cancel!');
            }

            $scope.clickedPicker = function() {
              console.log('Clicked to open picker');
            }

            $scope.offlineUpload = function() {
              scope.showPrevisionOfflineFilesModal(true);
            }

            $scope.checkOnline = function() {
              console.log('Is online', $rootScope.online);
            }

            $scope.checkPermissions = function() {
              DriveAPI.hasPermissions('0B3ufmcTU0qqcRDJGVEl2cVpudFE');
            }


        	  Stock.getAllCloths(true).then(function(result) {
        		  $scope.cloths = result.data;
        	  });

            Stock.getAllSailGroups().then(function(result) {
        		  $scope.sailGroups = result.data;
              translateSailGroups();
        	  });

        	  OneDesign.getBoats().then(function(result) {
        		  $scope.boats = result.data;
              $scope.allBoats = result.data;
        	  });

        	  OneDesign.getSails().then(function(result) {
      		    $scope.oneDesignSails = result.data;
              $scope.allOneDesignSails = result.data;
        	  });

            $scope.lines = Production.getLines();

            $scope.updateSails = function() {
              if ($scope.prevision.selectedSailGroup) {
                Stock.getSails($scope.prevision.selectedSailGroup.id).then(function(result) {
                  if (!$scope.prevision.id || $scope.prevision.createdOn > '2016-10-07') {
                    // do not show old sails if creating a new prevision or created after date of new sails released
                    $scope.sails = result.data.filter(function(s) {
                      return s.formulaId;
                    });
                  } else {
                    $scope.sails = result.data;
                  }
                  translateSails();
                });
              } else {
                $scope.sails = [];
              }
            }

            $scope.acceptStateChange = function(p) {
              Previsions.acceptStateChange(p).then(function() {
                Utils.showMessage('notify.state_accepted_prevision');
                p.stateAccepted = '1';
              });
            };

            $scope.listFiles = function(parentId) {
              DriveAPI.init().then(function() {
                // DriveAPI.findPrevisionFolder('0B85OZZCDsYWNMnEyNTBfZUZpUTg');
                DriveAPI.listFiles(parentId);
              },
              function() {
                console.log('Loaded rejected!');
              });

            };

            $scope.downloadFile = function() {
              DriveAPI.init().then(function() {
                DriveAPI.downloadFile('0B85OZZCDsYWNbWo3RmFPdHpxYmc'); // cehck.sql
              },
              function() {
                console.log('Loaded rejected!');
              });

            };

        	  $scope.showPrevisionModal = function(prevision, previousModal) {



        		  $scope.prevision = prevision ? prevision : {isNew: true, oneDesign: false, greaterThan44: false, country: $rootScope.user.country};

        		  $scope.origPrevision = prevision ? $.extend(true, {}, prevision) : {}; // used when the user cancel the modifications (close the modal)

              $scope.prevision.startedAsOD = prevision ? prevision.oneDesign : true;

              // handle creation/load of drive folders if they dont exists yet
              handlePrevisionDriveFolders(prevision);

              // reset OD sails
              $scope.oneDesignSails = $scope.allOneDesignSails;

              if(!$scope.prevision.cloths || $scope.prevision.cloths.length == 0) {
                // init with one cloth empty, useful for creating new prevision
                $scope.prevision.cloths = new Array();
                $scope.prevision.cloths.push({});
              }

              // cloths to show depends on the prevision country
              Stock.getAllCloths(true, $scope.prevision.country).then(function(result) {
          		  $scope.cloths = result.data;

                // set current value for each cloth (needed for dropdown)
            	  $scope.prevision.cloths.each(function( cloth ) {
            		  cloth.selectedCloth = $scope.cloths.findAll({id:cloth.id})[0];
            	  });
          	  });

              // sellers to show depends on the prevision country
              Production.getSellers($scope.prevision.country).then(function(result) {
                $scope.sellers = result.data;

                if ($scope.prevision.seller && result.data.filter(function(d) {
                    return d.name === $scope.prevision.seller;
                  }).length == 0) {

                  $scope.sellers.push({name: $scope.prevision.seller});
                }

                $scope.prevision.selectedSeller = $scope.prevision.seller ? $scope.sellers.findAll({name:$scope.prevision.seller})[0] : {};
              });


          	  // set current selected sail
              if ($scope.prevision.sailGroupId) {
                $scope.prevision.selectedSailGroup = $scope.sailGroups.findAll({id:$scope.prevision.sailGroupId})[0];

                if ($scope.prevision.sailId) {
                  Stock.getSails($scope.prevision.sailGroupId).then(function(result) {
                    if (!$scope.prevision.id || $scope.prevision.createdOn > '2016-10-07') {
                      // do not show old sails if creating a new prevision or created after date of new sails released
                      $scope.sails = result.data.filter(function(s) {
                        return s.formulaId;
                      });
                    } else {
                      $scope.sails = result.data;
                    }
                    translateSails();
                    $scope.prevision.selectedSail = result.data.findAll({id:$scope.prevision.sailId})[0];
                  });
                }
              } else {
                $scope.prevision.selectedSailGroup = {};
                $scope.prevision.selectedSail = {};
              }

          	  // set current selected boat
          	  $scope.prevision.selectedBoat = $scope.prevision.oneDesign ? $scope.boats.findAll({boat:$scope.prevision.boat})[0] : {};

              if ($scope.prevision.selectedBoat && $scope.prevision.selectedBoat.boat) {
                // filter sails of boat is already selected
                $scope.oneDesignSails = $scope.prevision.selectedBoat.sails;
              }

          	  // set current selected one design sail
          	  $scope.prevision.selectedOneDesignSail = $scope.prevision.oneDesign ? $scope.oneDesignSails.findAll({sail:$scope.prevision.sailOneDesign})[0] : {};


              $scope.prevision.selectedLine = $scope.prevision.line ? $scope.lines.findAll({name:$scope.prevision.line})[0] : {};

              if (!$scope.prevision.week) {
                $scope.prevision.week = 19;
              }

              if (!$scope.prevision.percentage) {
                $scope.prevision.percentage = 0;
              }

              if ($scope.prevision.infoDate) {
                $scope.prevision.hasInfo = true;
              }

              if ($scope.prevision.advanceDate) {
                $scope.prevision.hasAdvance = true;
              }

              // load and choose dispatch if already have one
              Dispatchs.getDispatchs('NONE').then(function(result){
                // for the drop dropdown only OPEN dispatchs
          			$scope.openDispatchs = result.data.filter(function(d) {
                  return d.archived == '0';
                });

                if ($scope.prevision.dispatchId) {
                  // load the the already saved one
                  $scope.prevision.selectedDispatch = result.data.filter(function(d) {
                    return d.id === $scope.prevision.dispatchId;
                  })[0];

                  if ($scope.prevision.selectedDispatch.archived == '1') {
                    // in some case the prevision is referring an already closed dispatch -> add it to the options list
                    $scope.openDispatchs.push($scope.prevision.selectedDispatch);
                  }
                }
          		});

              isInPlotterWithCuts($scope.prevision);

              // order previsions of the autocomplete by sequence number desc when same order number
              if ($scope.previsions) {

                $scope.previsionsForAC = $scope.previsions.slice().sort(function(p1, p2) {
                  var p1Split = p1.orderNumber.split('-');
                  var p2Split = p2.orderNumber.split('-');

                  if (p1Split[0] === p2Split[0]) {
                    return p1Split[1] <= p2Split[1] ? 1 : -1;
                  }

                  return p1.orderNumber <= p2.orderNumber ? -1 : 1;
                });
              } else {
                $scope.previsionsForAC = [];
              }

          	  $scope.modalPrevision = $modal({template: 'views/modal/prevision.html', show: false, scope: $scope, backdrop:'static', animation:'am-fade-and-slide-top'});

              $scope.modalPrevision.$promise.then($scope.modalPrevision.show);


              if(previousModal) {
        			  $scope.previousModal = previousModal;
        			  previousModal.hide();
        		  }
          };

          $scope.addCloth = function() {
        	  $scope.prevision.cloths.push({});
          };

          $scope.removeCloth = function(index) {
        	  $scope.prevision.cloths.splice(index, 1);

          	  if($scope.prevision.cloths.length==0) {
          		  $scope.prevision.cloths.push({});
          	  }
          };

          $scope.save = function() {

            // save changes in each cloth (extending current values only if a new cloth was selected)
            $scope.prevision.cloths.each(function( item ) {
              if(item.selectedCloth && item.id != item.selectedCloth.id) {
                $.extend(item, item.selectedCloth);
                item.clothId = item.selectedCloth.id;
                item.previsionId = $scope.prevision.id; // when the cloth is new the previsionid is not set, other cases will have no effect
              }
            });

            if($scope.prevision.selectedSail && $scope.prevision.selectedSail.id) {
              $scope.prevision.sailId = $scope.prevision.selectedSail.id;
            }

            if($scope.prevision.selectedSailGroup.id) {
              $scope.prevision.sailGroupId = $scope.prevision.selectedSailGroup.id;
              if ($scope.prevision.selectedSailGroup.id != '9' && $scope.prevision.createdOn > '2016-10-07') {
                // group different to 'Otra' -> always clear sail description field
                delete $scope.prevision.sailDescription;
              }
            }

            if($scope.prevision.selectedBoat && $scope.prevision.selectedBoat.boat) {
              $scope.prevision.boat = $scope.prevision.selectedBoat.boat;
            }

            if($scope.prevision.selectedOneDesignSail && $scope.prevision.selectedOneDesignSail.sail) {
              $scope.prevision.sailOneDesign = $scope.prevision.selectedOneDesignSail.sail;
            }

            if($scope.prevision.selectedSeller && $scope.prevision.selectedSeller.name) {
              $scope.prevision.seller = $scope.prevision.selectedSeller.name;
            } else {
              $scope.prevision.seller = null;
            }

            if($scope.prevision.selectedLine && $scope.prevision.selectedLine.name) {
              $scope.prevision.line = $scope.prevision.selectedLine.name;
            } else {
              $scope.prevision.line = null;
            }


            $scope.prevision.dispatchId = $scope.prevision.selectedDispatch ? $scope.prevision.selectedDispatch.id : null;

            handlePrevisionInDispatch($scope.origPrevision);


            var waitForPossiblePrevisionStateChange = false;
            var showChangedStateModal = false;
            var errors = false;

            function newStateClose() {
              // called after the new state warning modal is closed, or called just after save if state is not changed
              $scope.modalPrevision.hide();

              if($scope.previousModal) {
                $scope.previousModal.show();
              }

              if ($scope.onSavePrevision) {
                $scope.onSavePrevision($scope.prevision);
              }

              // special case when the country was changed -> remove from list
              if ($scope.origPrevision.country && $scope.origPrevision.country != $scope.prevision.country) {
                $scope.previsions.remove($scope.prevision);
              }
            }

            Previsions.validateUniqueOrderNumber($scope.prevision.orderNumber).then(function(result) {

              // valid scenarios to be a valid ordernumber:
              // . it is not a new prevision but the order number is unique or the one that exists it's the same to current prevision
              // . it is a new prevision and the order number is unique
              if (($scope.prevision.id && (result.data.valid || $scope.prevision.id == result.data.previsionId || $scope.prevision.previsionId == result.data.previsionId))
                      || (!$scope.prevision.id && result.data.valid)) {

                Previsions.save($scope.prevision, $rootScope.user.name).then(function(result) {

                  if(result.data.successful && result.data.isNew) {

                    $scope.previsions.push($scope.prevision);

                    delete $scope.prevision.isNew;

                    Utils.showMessage('notify.prevision_created');

                    waitForPossiblePrevisionStateChange = true;

                    // new prevision -> create folders in google drive for production and design files
                    Files.createFolders($scope.prevision).then(function() {
                      // nothing to do here
                    });

                    updatePrevisionState($scope.prevision).then(function(state) {
                      console.log('Ended update prev state (new):', state);
                      // the prevision is new => show modal with the prev state for the user
                      $scope.state = state;
                      $scope.onClose = newStateClose;
                      var modal = $modal({template: 'views/modal/showNewState.html', show: false, scope: $scope, backdrop:'static', animation:'am-fade-and-slide-top'});
                      modal.$promise.then(modal.show);
                    });;
                  }
                  else if(result.data.successful && !result.data.isNew) {

                    Utils.showMessage('notify.prevision_modified');

                    waitForPossiblePrevisionStateChange = true;

                    // if observations general has changed, send notify to other users
                    if ($scope.prevision.observations !== $scope.origPrevision.observations) {
                      Users.storePrevisionNotify($rootScope.user, $scope.prevision.orderNumber);
                    }

                    updatePrevisionState($scope.prevision).then(function(state) {
                      console.log('Ended update prev state:', state);
                      if(state) {
                        // the prevision state was updated => show modal with the new prev state for the user
                        $scope.state = state;
                        $scope.onClose = newStateClose;
                        var modal = $modal({template: 'views/modal/showNewState.html', show: false, scope: $scope, backdrop:'static', animation:'am-fade-and-slide-top'});
                        modal.$promise.then(modal.show);
                      } else {
                        newStateClose();
                      }
                    });
                  }
                  else if(!result.data.successfulInsert && result.data.insert) {
                    Lists.log({type: 'error.insertPrevision', log: result.data.insert}).then(function(result) {});
                    Utils.showMessage('notify.prevision_create_failed', 'error');
                    errors = true;
                  }
                  else if(!result.data.successfulUpdate && result.data.update) {
                    Lists.log({type: 'error.updatePrevision', log: result.data.update}).then(function(result) {});
                    Utils.showMessage('notify.prevision_edit_failed', 'error');
                    errors = true;
                  }
                  else if(!result.data.successfulCloths && result.data.queryCloths) {
                    Lists.log({type: 'error.queryCloths', log: result.data.queryCloths}).then(function(result) {});
                    Utils.showMessage('notify.prevision_cloth_save_failed', 'error');
                    errors = true;
                  }
                  else if(!result.data.successful) {
                    Utils.showMessage('notify.unknown_error', 'error');
                    Utils.logUIError('errorUI.savePrevision', result.data);
                    errors = true;
                  }

                  if(!waitForPossiblePrevisionStateChange && !errors) {
                    $scope.modalPrevision.hide();

                    if($scope.previousModal) {
                      $scope.previousModal.show();
                    }

                    if ($scope.onSavePrevision) {
                      $scope.onSavePrevision($scope.prevision);
                    }

                    // special case when the country was changed -> remove from list
                    if ($scope.origPrevision.country && $scope.origPrevision.country != $scope.prevision.country) {
                      $scope.previsions.remove($scope.prevision);
                    }
                  }
                }, function(err) {
                  Utils.showIntrusiveMessage('notify.unknown_error', 'error');
                  Utils.logUIError('error.rejected.savePrevision', {error: err, entity: $scope.prevision});
                  errors = true;
                });

              } else {
                // save attempt but prevision order number not unique
                Utils.showMessage('notify.prevision_ordernumber_notunique', 'error');
              }
            });
          };

          $scope.isAdmin = function() {
            return $rootScope.user.role === 'admin';
          };

          $scope.deletePrevision = function(prevision) {

        	  console.log('Deleteing prevision: '+prevision.id);

          	  Previsions.remove($scope.prevision).then(function(result) {
          		  $scope.previsions.remove(prevision);

          		  $scope.modalPrevision.hide();

                Utils.showMessage('notify.prevision_deleted');

                updatePrevisionState($scope.prevision, true);
          	  });
          };

          $scope.selectedPrevision = function(prevision) {

            if(prevision) {

              $scope.prevision.orderNumber = prevision.originalObject.orderNumber;

              // load the values of the selected prevision in the new one we are creating
              $scope.prevision.client = prevision.originalObject.client;
              $scope.prevision.boat = prevision.originalObject.boat;
              $scope.prevision.deliveryDate = prevision.originalObject.deliveryDate;
              $scope.prevision.tentativeDate = prevision.originalObject.deliveryDate;
              $scope.prevision.type = prevision.originalObject.type;
              $scope.prevision.greaterThan44 = prevision.originalObject.greaterThan44;
              $scope.prevision.oneDesign = prevision.originalObject.oneDesign;
              $scope.prevision.selectedBoat = $scope.prevision.oneDesign ? $scope.boats.findAll({boat:$scope.prevision.boat})[0] : {};

              $scope.prevision.p = prevision.originalObject.p;
              $scope.prevision.e = prevision.originalObject.e;
              $scope.prevision.i = prevision.originalObject.i;
              $scope.prevision.j = prevision.originalObject.j;
              // $scope.prevision.area = prevision.originalObject.area;

              // $scope.prevision.selectedLine = prevision.originalObject.line ? $scope.lines.findAll({name:prevision.originalObject.line})[0] : {};
              $scope.prevision.selectedSeller = prevision.originalObject.seller ? $scope.sellers.findAll({name:prevision.originalObject.seller})[0] : {};
              $scope.prevision.priority = prevision.originalObject.priority;

              /*console.log('Selected prevision: '+prevision.originalObject.orderNumber);
              console.log('Stored in entity: '+$scope.prevision.orderNumber);*/
            }
          };

          $scope.orderNumberInputChanged = function(str) {
            $scope.prevision.orderNumber = str;
          }

          $scope.deliveryDateChanged = function(oldValue) {
            if (!$scope.prevision.tentativeDate || $scope.prevision.isNew) {
              $scope.prevision.tentativeDate = $scope.prevision.deliveryDate;
            }
            // mark as manually changed
            console.log('deliveryDate changed:', oldValue, $scope.prevision.deliveryDate)
            if (oldValue !== $scope.prevision.deliveryDate && !$scope.prevision.isNew) {
              $scope.prevision.deliveryDateManuallyUpdated = "1";
              $scope.prevision.deliveryDateChanged = true
            }
          }

          $scope.updateFieldsByRule = function() {
            $scope.updatePrevisionPercentage();
            $scope.updatePrevisionDeliveryDate();
          }

          $scope.updatePrevisionPercentage = function() {
            Rules.updatePrevisionPercentage($scope.prevision);
          }

          $scope.updatePrevisionDeliveryDate = function() {
            Rules.updatePrevisionDeliveryDate($scope.prevision);
          }

          $scope.hasInfoChanged = function() {
            if (!$scope.prevision.hasInfo) {
              delete $scope.prevision.infoDate;
              $scope.updatePrevisionPercentage();
              $scope.updatePrevisionDeliveryDate();
            }
          }

          $scope.hasAdvanceChanged = function() {
            if (!$scope.prevision.hasAdvance) {
              delete $scope.prevision.advanceDate;
              $scope.updatePrevisionPercentage();
              $scope.updatePrevisionDeliveryDate();
            }
          }

          $scope.close = function() {

        	  $.extend($scope.prevision, $scope.origPrevision);

        	  $scope.modalPrevision.hide();

        	  if($scope.previousModal) {
        		  $scope.previousModal.show();
        	  }
          };

          $scope.refreshCountry = function() {

            // update list of sellers
            Production.getSellers($scope.prevision.country).then(function(result) {
              $scope.sellers = result.data;

              // if a seller was selected in the previous country we should keep it in the list
              if ($scope.prevision.selectedSeller && $scope.prevision.selectedSeller.name && result.data.filter(function(d) {
                  return d.name === $scope.prevision.selectedSeller.name;
                }).length == 0) {

                $scope.sellers.push({name: $scope.prevision.selectedSeller.name});
              }

              if ($scope.prevision.selectedSeller) {
                $scope.prevision.selectedSeller = $scope.sellers.findAll({name:$scope.prevision.selectedSeller.name})[0];
              }
            });

            // update list of dispatchs
            Dispatchs.getDispatchs('NONE', null, $scope.prevision.country).then(function(result){
              // for the drop dropdown only OPEN dispatchs
              $scope.openDispatchs = result.data.filter(function(d) {
                return d.archived == '0';
              });

              if ($scope.prevision.dispatchId) {
                // load the the already saved one
                $scope.prevision.selectedDispatch = null;
                $scope.prevision.dispatchId = null;
              }
            });

            // update the list of possible cloths and the selected cloths to the ones in the new country
            updateClothToNewCountry();
          };

          function updateClothToNewCountry() {

            var promises = [];

            var matchIds = [];
            $scope.prevision.cloths.each(function( item ) {
              if (item.selectedCloth) {
                if (item.selectedCloth.matchClothId) {
                  matchIds.push(item.selectedCloth.matchClothId);
                } else {
                  // selected cloth doesn't have a match -> copy cloth in new country
                  // TODO is this still used?
                  promises.push(Stock.copyCloth(item, $scope.prevision.country));
                }
              }
            });

            promises.push(Stock.getCorrespondingCountryCloth(matchIds, $scope.prevision.country));

            // wait for all cloth copies and get of corresponding cloths in new country are done
            $q.all(promises).then(function(results) {

              Stock.getAllCloths(true, $scope.prevision.country).then(function(allCloths) {

                $scope.cloths = allCloths.data;

                results.each(function(result) {

                  var matchs = [].concat(result.data);

                  matchs.each(function(match) {

                    // get the slected cloth with the original cloth id and set the new cloth
                    var cloths = $scope.prevision.cloths.filter(function(item) {
                      return item.selectedCloth && item.selectedCloth.id == match.originalClothId;
                    });

                    cloths[0].selectedCloth = $scope.cloths.findAll({id: match.newClothId})[0];
                  });
                })
              });
            });
          }


          function isInPlotterWithCuts(prevision) {
            // check if the current prevision is in plotter and has assigned some plotter cuts
            if (!prevision.isNew) {
              Previsions.isInPlotterWithCuts(prevision.previsionId ? prevision.previsionId : prevision.id).then(function(result) {
                prevision.isInPlotterWithCuts = result.data;
              });
            } else {
                prevision.isInPlotterWithCuts = false;
            }
          }

          $scope.calculateMts = function() {

        	  if(!$scope.prevision.oneDesign && $scope.prevision.selectedSail) {

              var line = $scope.prevision.selectedLine ? $scope.prevision.selectedLine.name : null;

        		  // for sails that split the mts in two cloths (grande y chica) (with line=RA) check that there are at least 2 cloths already added
        		  if(line=='RA' && $scope.prevision.cloths.length < 2) {
        			  $scope.prevision.cloths.push({});
        		  }
        		  else if (line != 'RA' && $scope.prevision.cloths.length > 1 && !$scope.prevision.cloths[1].selectedCloth) {
        			  // selected sail with NO split in two cloths, if the second cloth is not selected yet remove it and leave only one cloth
        			  var cloth = $scope.prevision.cloths[0];

        			  $scope.prevision.cloths = new Array();
        			  $scope.prevision.cloths.push(cloth);
        		  }

    				  $scope.calculateClothMts([$scope.prevision.selectedSail.valueF1, $scope.prevision.selectedSail.valueF2],
                                        $scope.prevision.selectedSail.fieldsF1,
                                        $scope.prevision.selectedSail.typeF1,
                                        line,
                                        $scope.prevision.cloths[0],
                                        $scope.prevision.cloths[1],
                                        $scope.prevision.greaterThan44,
                                        $scope.prevision.selectedSail.rizo == 'Y');
        	  }
          };

          $scope.calculateClothMts = function(formulaValues, fields, type, line, cloth1, cloth2, greaterThan44, hasRizo) {

        	  var mts=undefined;

        	  if(fields == 'E') {
        		  mts = doFormula(type, formulaValues, fields, $scope.prevision.e);
        	  }
        	  else if(fields == 'SUP') {

              if (hasRizo) {
                // some sails has option to select rizo and will change the formula value
                if ($scope.prevision.rizo) {
                  if (+$scope.prevision.rizo == 2) {
                    formulaValues[0] = +formulaValues[0] + 0.05;
                    formulaValues[1] = +formulaValues[1] + 0.05;
                  } else if (+$scope.prevision.rizo == 3) {
                    formulaValues[0] = +formulaValues[0] + 0.1;
                    formulaValues[1] = +formulaValues[1] + 0.1;
                  }
                }
              }

        		  mts = doFormula(type, formulaValues, fields, $scope.prevision.area, line);
        	  }

            if(mts) {

              if (greaterThan44) {
                mts = mts * 1.1;
              }

              if(cloth2 && line == 'RA') {
                cloth1.mts = Math.round((mts * 0.7).toFixed(2));
                cloth2.mts = Math.round((mts * 0.3).toFixed(2));
              }
        		  else {
        			  // cloth1.mts = Math.round(mts.toFixed(2));
                cloth1.mts = Math.round(mts.toFixed(2));
        		  }
        	  }
          };

          function doFormula(type, formulaValues, fields, peijValue, line) {

	  	  	  if(type == 'MULT') {

              if (fields == 'E') {
                return (+peijValue * +formulaValues[0]) + +formulaValues[1];
              }
              else if (line == 'RA') {
                return +peijValue * (formulaValues[1] ? +formulaValues[1] : +formulaValues[0]);
              } else {
                return +peijValue * +formulaValues[0];
              }
		        }

        	  return undefined;
          }

          $scope.filterSails = function() {

            // filter OD boat sails
            if ($scope.prevision.oneDesign) {

              if ($scope.prevision.selectedBoat && $scope.prevision.selectedBoat.boat) {
                $scope.oneDesignSails = $scope.prevision.selectedBoat.sails;
              } else {
                $scope.oneDesignSails = $scope.allOneDesignSails;
              }
            }
          }

          $scope.setBoatBySail = function() {
            // choose the corresponding boat according to selected OD sail
            // Not implemented yet
          }

          $scope.oneDesignCloths = function() {

            // load the cloth(s) cthat corresponds to the selected combination boat - sail
        	  if($scope.prevision.oneDesign && $scope.prevision.selectedBoat && $scope.prevision.selectedBoat.boat && $scope.prevision.selectedOneDesignSail && $scope.prevision.selectedOneDesignSail.sail) {

        		  // var sail = $scope.prevision.selectedOneDesignSail.description;

        		  $scope.prevision.cloths = new Array();

        		  OneDesign.findCloths($scope.prevision.selectedBoat.boat, escape($scope.prevision.selectedOneDesignSail.sail)).then(function(result) {

    			  	  $scope.prevision.cloths = new Array();

    			    	$.each(result.data, function(index){

    			    		var cloth = $scope.cloths.findAll({id:this.clothId})[0];

    			    		$scope.prevision.cloths.push({selectedCloth: cloth, mts: this.mts});
    			    	});

    			    	if($scope.prevision.cloths.length==0) {
        			  	$scope.prevision.cloths.push({});
        		  	}
        		  });

        	  }
          };

          function dbFormat(date) {

        	  if(!date) return;

        	  var dateParts = date.split("-");

          	  return dateParts[2] + "-" + dateParts[1] + "-" + dateParts[0];
          }

          function updatePrevisionState(prevision, skipNotify) {

            var d = $q.defer();

            console.log('Prevision', prevision);

  					var clothsIds = prevision.cloths.map(function(c) { return c.clothId; }).join(',');

  					Previsions.updatePrevisionState(clothsIds).then(function(result) {

              console.log('update prevision state', result);
              if(skipNotify) {
                Utils.showMessage('notify.previsions_state_updated');
              }

              var currentPrevisionUpdated = false;

              // update the state of the modified previsions in the scope
              result.data.modifiedPrevisions.map(function(modifiedPrevision) {

                var previsionsToUpdate = $scope.previsions || ($scope.cloth && $scope.cloth.previsions) || $scope.plotters;

                if(previsionsToUpdate) {
                  previsionsToUpdate.map(function(p) {
                    if(modifiedPrevision.id == p.id || modifiedPrevision.id == p.previsionId) {

                      if(p.state != modifiedPrevision.state) {
                        p.state = modifiedPrevision.state;
                        p.stateAccepted = "0";

                        // the prevision of this modal was updated => resolve the promise with the new state
                        if(p.id == prevision.id) {
                          d.resolve(p.state);
                          currentPrevisionUpdated = true;
                        }
                      }
                    }
                  });
                }
              });

              if(!currentPrevisionUpdated) {
                d.resolve(null);
              }
  					});

            return d.promise;
  				}

          function translateSails() {
            $scope.sails.map(function(s) {
              var translation = $translate.instant('sails.'+s.id);
              s.description = translation != 'sails.'+s.id ? translation : s.description;
            });
          }

          function translateSailGroups() {
            $scope.sailGroups.map(function(s) {
              var translation = $translate.instant('sailGroups.'+s.id);
              s.name = translation != 'sailGroups.'+s.id ? translation : s.name;
            });
          }

          // Help handle functions

          function handlePrevisionInDispatch() {

            // check if the prev was already in some dispatch -> remove from it
            if ($scope.origPrevision.dispatchId && $scope.origPrevision.dispatchId != $scope.prevision.dispatchId) {
              Dispatchs.removePrevisionInDispatch($scope.prevision.id, $scope.origPrevision.dispatchId).then(function(result) {
                //
              });
              if ($scope.prevision.dispatchId) {
                // send insert into dispatch previsionsToUpdate
                Dispatchs.addPrevision($scope.prevision, $scope.prevision.dispatchId).then(function(result) {
                  //
                });
              }
            } else if (!$scope.origPrevision.dispatchId && $scope.prevision.dispatchId) {
              Dispatchs.addPrevision($scope.prevision, $scope.prevision.dispatchId).then(function(result) {
                //
              });
            }
          }

          function handlePrevisionDriveFolders(prevision) {

            // handle creation/load of drive folders if they dont exists yet
            if ($scope.prevision.id) {

              if (!$scope.prevision.driveIdProduction) {
                DriveAPI.hasPermissions(productionFilesFolder).then(function(hasDrivePermissions) {

                  if (hasDrivePermissions) {

                    Files.createFolders(prevision).then(function() {
                      $scope.origPrevision.driveIdProduction = prevision.driveIdProduction;
                      $scope.origPrevision.driveIdDesign = prevision.driveIdDesign;

                      lkGoogleSettings.views = ["DocsView().setParent('"+prevision.driveIdProduction+"').setSelectFolderEnabled(true).setIncludeFolders(true)",
                                                "DocsUploadView().setParent('"+prevision.driveIdProduction+"').setIncludeFolders(true)"] ;

                      Utils.translate('Files count', {count: 0}).then(function(value) { $scope.filesLbl = value; });
                    }, function(code) {
                      // not permissions to create folder (shouldnt happen) -> show error message?
                    });
                  } else {
                    // user logged in google but not permissions to create folder
                    $scope.insufficientPermissions = true;
                    if ("admin,produccion,ordenes,plotter".split(',').lastIndexOf($rootScope.user.role) != -1) {
                      // allowed access to files but no permission in drive
                      Utils.showMessage('notify.drive_not_allowed', 'error');
                    }
                  }
                }, function(code) {
                  // rejected has permissions, possible because is not logged into google yet
                  Utils.translate('Files').then(function(value) { $scope.filesLbl = value; });
                });

                Utils.translate('Files').then(function(value) {
                  $scope.filesLbl = value;
                });

              } else {
                // drive folder already exists -> load it
                lkGoogleSettings.views = ["DocsView().setParent('"+prevision.driveIdProduction+"').setSelectFolderEnabled(true).setIncludeFolders(true)",
                                          "DocsUploadView().setParent('"+prevision.driveIdProduction+"')"] ;

                // get number of files in prevision folder to show in label
                DriveAPI.hasPermissions(productionFilesFolder).then(function(hasDrivePermissions) {

                  if (hasDrivePermissions) {
                    // list files only if the user logged in google has permissions to see the prevision prod folder
                    DriveAPI.listFiles(prevision.driveIdProduction).then(function(files) {
                      Utils.translate('Files count', {count: files.length}).then(function(value) {
                        $scope.filesLbl = value;
                      });
                    }, function(code) {
                      // rejected list files, possible because the gapi is not loaded yet
                      Utils.translate('Files').then(function(value) { $scope.filesLbl = value; });
                    });
                  } else {
                    $scope.insufficientPermissions = true;
                    if ("admin,produccion,ordenes,plotter".split(',').lastIndexOf($rootScope.user.role) != -1) {
                      // allowed access to files but no permission in drive
                      Utils.showMessage('notify.drive_not_allowed', 'error');
                    }
                    Utils.translate('Files').then(function(value) { $scope.filesLbl = value; });
                  }
                }, function(code) {
                  // rejected has permissions, possible because is not logged into google yet
                  Utils.translate('Files').then(function(value) { $scope.filesLbl = value; });
                });
              }
            }
          }
        }
      };
	}
);
