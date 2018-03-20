'use strict';

(function () {
  angular.module('openshiftConsole').component('mobileClientServices', {
    controller: [
      '$filter',
      'APIService',
      'DataService',
      'MobileServicesService',
      'NotificationsService',
      MobileClientServicesController
    ],
    bindings: {
      mobileClient: '<',
      project: '<',
    },
    templateUrl: 'views/directives/mobile-client-services.html'
  });

  function MobileClientServicesController($filter, APIService, DataService, MobileServicesService, NotificationsService) {
    var ctrl = this;
    var context = { namespace: ctrl.project };
    var getErrorDetails = $filter('getErrorDetails');
    var isServiceInstanceReady = $filter('isServiceInstanceReady');
    var isMobileService = $filter('isMobileService');
    ctrl.title = "Mobile Services";

    ctrl.$onInit = function () {
      DataService.watch(APIService.getPreferredVersion('serviceinstances'), context, function (serviceInstancesData) {
        var data = serviceInstancesData.by("metadata.name");

        ctrl.services = _.filter(data, function (serviceInstance) {
          return isMobileService(serviceInstance) && isServiceInstanceReady(serviceInstance);
        });

        _.each(ctrl.services, function (serviceInstance) {
          if (!serviceInstance.resourceData) {
            MobileServicesService.getIcon(serviceInstance).then(function (icon) {
              serviceInstance.resourceData = {};
              serviceInstance.resourceData.imageUrl = icon;
              serviceInstance.resourceData.name = _.get(serviceInstance, 'metadata.labels.serviceName');
              serviceInstance.resourceData.id = _.get(serviceInstance, 'metadata.name');
            });
          }
        });
      });
    }

    ctrl.excludeService = function (serviceInstance) {
      var clientName = _.get(ctrl.mobileClient, 'spec.name');
      var serviceName = _.get(serviceInstance, 'metadata.name');

      MobileServicesService.excludeService(ctrl.mobileClient, serviceInstance, context)
        .then(function () {
          NotificationsService.addNotification({
            type: 'success',
            message: 'Mobile service ' + serviceName + ' excluded from client ' + clientName + '.'
          });
        }).catch(function (error) {
          NotificationsService.addNotification({
            type: 'error',
            message: 'Failed to exclude mobile service ' + serviceName + ' from client ' + clientName + '.',
            details: getErrorDetails(error)
          });
        });
    }

    ctrl.addService = function (serviceInstance) {
      var clientName = _.get(ctrl.mobileClient, 'spec.name');
      var serviceName = _.get(serviceInstance, 'metadata.name');

      MobileServicesService.removeFromExcluded(ctrl.mobileClient, serviceInstance, context)
        .then(function () {
          NotificationsService.addNotification({
            type: 'success',
            message: 'Mobile service ' + serviceName + ' added to client ' + clientName + '.'
          });
        }).catch(function (error) {
          NotificationsService.addNotification({
            type: 'error',
            message: 'Failed to add mobile service ' + serviceName + ' to client ' + clientName + '.',
            details: getErrorDetails(error)
          });
        });
    }

    ctrl.filterServices = function (mobileClient, serviceInstances) {
      return MobileServicesService.filterNotExcluded(mobileClient, serviceInstances);
    }

    ctrl.filterExcluded = function (mobileClient, serviceInstances) {
      return MobileServicesService.filterExcluded(mobileClient, serviceInstances);
    }

    ctrl.canAddService = function (mobileClient, serviceInstances) {
      return _.isEmpty(MobileServicesService.filterExcluded(mobileClient, serviceInstances));
    };
  }
})();