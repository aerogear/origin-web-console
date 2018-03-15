'use strict';

(function () {
  angular.module('openshiftConsole').component('addMobileService', {
    controller: [
      'DataService',
      'MobileServicesService',
      'NotificationsService',
      AddMobileService
    ],
    bindings: {
      client: '<',
      mobileServices: '<',
      onClose: '<',
      project: '<'
    },
    templateUrl: 'views/directives/add-mobile-service.html'
  });

  function AddMobileService(DataService, MobileServicesService, NotificationsService) {
    var ctrl = this;
    var context = { namespace: ctrl.project };

    ctrl.$onInit = function () {
      ctrl.filteredServices = MobileServicesService.filterExcluded(ctrl.mobileServices, ctrl.client);
    };

    ctrl.$doCheck = function () {
      ctrl.filteredServices = MobileServicesService.filterExcluded(ctrl.mobileServices, ctrl.client);
    };

    // add a service to the client
    ctrl.addService = function (serviceInstance) {
      var clientName = _.get(ctrl.client, 'spec.name');
      var serviceName = _.get(serviceInstance, 'metadata.name');

      MobileServicesService.removeFromExcluded(ctrl.client, serviceInstance, context)
        .then(function () {
          NotificationsService.addNotification({
            type: 'success',
            message: 'Service ' + serviceName + ' added to client ' + clientName
          });
        }).catch(function (err) {
          NotificationsService.addNotification({
            type: 'error',
            message: 'Failed to add service instance ' + serviceName,
            details: err.data.message
          });
        });

      ctrl.onClose();
    }
  }
})();