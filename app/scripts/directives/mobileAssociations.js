'use strict';

(function () {
  angular.module('openshiftConsole').component('mobileAssociations', {
    controller: [
      MobileAssociationsController
    ],
    bindings: {
      add: '<',
      canAdd: '<',
      exclude: '<',
      filterResources: '<',
      filterExcluded: '<',
      project: '<',
      resource: '<',
      resources: '<',
      title: '<'
    },
    templateUrl: 'views/directives/mobile-associations.html'
  });

  function MobileAssociationsController() {
    var ctrl = this;

    ctrl.$doCheck = function () {
      ctrl.filteredResources = ctrl.filterResources(ctrl.resource, ctrl.resources);
    }

    ctrl.canAddResource = function() {
        return ctrl.canAdd(ctrl.resource, ctrl.resources);
    }

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