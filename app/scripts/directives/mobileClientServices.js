'use strict';

(function () {
  angular.module('openshiftConsole').component('mobileClientServices', {
    controller: [
      '$filter',
      'APIService',
      'DataService',
      'MobileServicesService',
      MobileClientServicesController
    ],
    bindings: {
      client: '<',
      project: '<'
    },
    templateUrl: 'views/directives/mobile-client-services.html'
  });

  function MobileClientServicesController($filter, APIService, DataService, MobileServicesService) {
    var ctrl = this;
    ctrl.serviceInstances = [];

    ctrl.$onInit = function () {
      var context = { namespace: ctrl.project };
      var isServiceInstanceReady = $filter('isServiceInstanceReady');

      DataService.watch(APIService.getPreferredVersion('serviceinstances'), context, function (serviceInstancesData) {
        var data = serviceInstancesData.by("metadata.name");
        _.each(data, function (serviceInstance) {
          if (_.get(serviceInstance, 'metadata.labels', {}).mobile === 'enabled' && isServiceInstanceReady(serviceInstance)) {
            if (!_.includes(ctrl.serviceInstances, serviceInstance)) {
              ctrl.serviceInstances.push(serviceInstance);
            }
          }
        });
        ctrl.filteredServices = MobileServicesService.filterNotExcluded(ctrl.serviceInstances, ctrl.client);
      });
    }

    ctrl.$doCheck = function () {
      if (ctrl.serviceInstances) {
        ctrl.filteredServices = MobileServicesService.filterNotExcluded(ctrl.serviceInstances, ctrl.client);
      }
    };

    ctrl.canAddMobileService = function() {
      return !MobileServicesService.filterExcluded(ctrl.serviceInstances, ctrl.client).length;
    };

    ctrl.closeOverlayPanel = function () {
      _.set(ctrl, 'overlay.panelVisible', false);
    };

    ctrl.showOverlayPanel = function (panelName, state) {
      _.set(ctrl, 'overlay.panelVisible', true);
      _.set(ctrl, 'overlay.panelName', panelName);
      _.set(ctrl, 'overlay.state', state);
    };
  }
})();