'use strict';

(function () {
  angular.module('openshiftConsole').component('mobileClientService', {
    controller: [
      'APIService',
      'CatalogService',
      'DataService',
      'MobileServicesService',
      'NotificationsService',
      MobileClientServiceController
    ],
    bindings: {
      client: '<',
      exclude: '<?',
      project: '<',
      service: '<'
    },
    templateUrl: 'views/directives/mobile-client-service.html'
  });

  function MobileClientServiceController(APIService, CatalogService, DataService, MobileServicesService, NotificationsService) {
    var ctrl = this;
    var context = { namespace: ctrl.project };
    var serviceName = _.get(ctrl.service, "metadata.labels.serviceName");

    // get details for this service
    CatalogService.getCatalogItems().then(function (catalogServices) {
      _.each(catalogServices, function (catalogService) {
        if (_.get(catalogService, "resource.spec.externalMetadata.serviceName", "not_found") === serviceName) {
          ctrl.serviceData = {};
          ctrl.serviceData.name = serviceName;
          ctrl.serviceData.imageUrl = catalogService.imageUrl;
        }
      });
    });

    // exclude service from client
    ctrl.excludeService = function (mobileClient) {
      var clientName = _.get(mobileClient, 'spec.name');
      var serviceName = _.get(ctrl.service, 'metadata.name');

      MobileServicesService.excludeService(mobileClient, ctrl.service, context)
        .then(function () {
          NotificationsService.addNotification({
            type: 'success',
            message: 'Service ' + serviceName + ' excluded from client ' + clientName
          });
        }).catch(function (err) {
          NotificationsService.addNotification({
            type: 'error',
            message: 'Failed to exclude service instance ' + serviceName,
            details: error.data.message
          });
        });
    };
  }
})();