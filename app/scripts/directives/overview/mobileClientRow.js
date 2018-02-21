'use strict';

(function () {
  angular.module('openshiftConsole').component('mobileClientRow', {
    controller: [
      '$scope',
      '$filter',
      '$routeParams',
      'ProjectsService',
      'DataService',
      'APIService',
      'MobileClientsService',
      'ListRowUtils',
      'Navigate',
      'AuthorizationService',
      MobileAppRow,
    ],
    controllerAs: 'row',
    bindings: {
      apiObject: '<',
      state: '<',
      bindings: '<'
    },
    templateUrl: 'views/overview/_mobile-client-row.html'
  });

  function MobileAppRow($scope, $filter, $routeParams, ProjectsService, DataService, APIService, MobileClientsService, ListRowUtils, Navigate, AuthorizationService) {
    var row = this;
    row.installType = '';

    _.extend(row, ListRowUtils.ui);

    row.bundleDisplay = "bundle id: " + row.apiObject.spec.appIdentifier;
    switch (row.apiObject.spec.clientType) {
      case 'android':
        row.installType = 'maven';
        row.bundleDisplay = "package name: " + row.apiObject.spec.appIdentifier;
        break;
      case 'iOS':
        row.installType = 'cocoapods';
        break;
      case 'cordova':
        row.installType = 'npm';
        break;
    }
    row.mobileclientVersion = {
      group: "mobile.k8s.io",
      version: "v1alpha1",
      resource: "mobileclients"
    };
    row.remove = function () {
      MobileClientsService.deleteClient(row.apiObject);
    };
    row.actionsDropdownVisible = function () {
      // no actions on those marked for deletion
      if (_.get(row.apiObject, 'metadata.deletionTimestamp')) {
        return false;
      }

      // We can delete mobileclients
      return AuthorizationService.canI(row.mobileclientVersion, 'delete');
    };

    $scope.browseCatalog = function () {
      Navigate.toProjectCatalog($scope.projectName);
    };
    $scope.projectName = $routeParams.project;
    $scope.renderOptions = $scope.renderOptions || {};
    $scope.renderOptions.hideFilterWidget = true;
    $scope.app = row.apiObject;
  }
})();
