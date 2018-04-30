'use strict';

angular.module('openshiftConsole').component('mobileClientBindings', {
  controller: [
    'APIService',
    'DataService',
    MobileClientBindings
  ],
  bindings: {
    mobileClient: '<'
  },
  templateUrl: 'views/directives/mobile-clent-bindings.html'
});

function MobileClientBindings(APIService, DataService) {
  var ctrl = this;

  var serviceClassesPreferredVersion = APIService.getPreferredVersion('clusterserviceclasses');

  DataService.list(serviceClassesPreferredVersion, {})
  .then(function(serviceClasses) {
    ctrl.clientProviders = _.filter(serviceClasses.by('metadata.name'), function(serviceClass) {
      var tags = _.get(serviceClass, 'spec.tags', []);
      return _.includes(tags, 'mobile-client-enabled');
    });
  });
}