'use strict';

(function () {
  angular.module('openshiftConsole').component('mobileClientRow', {
    controller: [
      '$filter',
      '$location',
      '$routeParams',
      'APIService',
      'AuthorizationService',
      'DataService',
      'ListRowUtils',
      'Navigate',
      'ServiceInstancesService',
      MobileAppRow,
    ],
    controllerAs: 'row',
    bindings: {
      apiObject: '<',
      state: '<'
    },
    templateUrl: 'views/overview/_mobile-client-row.html'
  });

  function MobileAppRow($filter, $location, $routeParams, APIService, AuthorizationService, DataService, ListRowUtils, Navigate, ServiceInstancesService) {
    var row = this;
    var serviceInstancesVersion = APIService.getPreferredVersion('serviceinstances');
    var serviceClassesVersion = APIService.getPreferredVersion('clusterserviceclasses');
    var serviceBindingsVersion = APIService.getPreferredVersion('servicebindings');
    var isServiceInstanceReady = $filter('isServiceInstanceReady');
    var isMobileService = $filter('isMobileService');
    row.installType = '';

    _.extend(row, ListRowUtils.ui);

    row.$onInit = function() {
      row.context = {namespace: _.get(row, 'apiObject.metadata.namespace')};
      DataService.list(serviceClassesVersion, row.context, function(serviceClasses) {
        serviceClasses = serviceClasses.by('metadata.name');
        DataService.watch(serviceInstancesVersion, row.context, function(serviceinstances) {
          row.services = _.filter(serviceinstances.by('metadata.name'), function(serviceInstance){
            var serviceClass = _.get(serviceClasses, ServiceInstancesService.getServiceClassNameForInstance(serviceInstance));
            return isMobileService(serviceClass) && isServiceInstanceReady(serviceInstance);
          });
          row.updateServicesInfo();
        }, { errorNotification: false });
      });

      DataService.watch(serviceBindingsVersion, row.context, function(bindingsData) {
        row.bindings = _.filter(bindingsData.by('metadata.name'), function(binding) {
          return _.get(binding.metadata.annotations, 'binding.aerogear.org/consumer') === _.get(row, 'apiObject.metadata.name');
        });
        row.updateServicesInfo();
      });
    };

    row.navigateToMobileServices = function() {
      var resource = _.get(row, 'apiObject.metadata.name');
      var kind = _.get(row, 'apiObject.kind');
      var namespace = _.get(row, 'apiObject.metadata.namespace');
      var opts = {
        tab: "mobileServices"
      };
      $location.url(Navigate.resourceURL(resource, kind, namespace, null, opts));
    }

    row.updateServicesInfo = function() {
      if (row.services) {
        row.servicesNotBoundCount = row.services.length - row.bindings.length;
      }
    };

    row.$onChanges = function(changes) {
      if (changes.apiObject) {
        row.bundleDisplay = row.apiObject.spec.appIdentifier;
        row.clientType = row.apiObject.spec.clientType.toUpperCase();
        switch (row.apiObject.spec.clientType) {
          case 'android':
            row.installType = 'gradle';
            break;
          case 'iOS':
            row.installType = 'cocoapods';
            break;
          case 'cordova':
            row.installType = 'npm';
            break;
        }
      }
    };


    row.mobileclientVersion = {
      group: "mobile.k8s.io",
      version: "v1alpha1",
      resource: "mobileclients"
    };
    row.actionsDropdownVisible = function () {
      // no actions on those marked for deletion
      if (_.get(row.apiObject, 'metadata.deletionTimestamp')) {
        return false;
      }

      // We can delete mobileclients
      return AuthorizationService.canI(row.mobileclientVersion, 'delete');
    };
    row.projectName = $routeParams.project;
    row.browseCatalog = function () {
      Navigate.toProjectCatalog(row.projectName, {category: 'mobile', subcategory: 'services'});
    };
  }
})();
