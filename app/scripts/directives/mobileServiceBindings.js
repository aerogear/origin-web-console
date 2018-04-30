'use strict';

angular.module('openshiftConsole').component('mobileServiceBindings', {
  controller: [
    'APIService',
    'DataService',
    MobileServiceBindings
  ],
  bindings: {
    integrations: '<',
    consumerService: '<'
  },
  templateUrl: 'views/directives/mobile-service-bindings.html'
});

function MobileServiceBindings(APIService, DataService) {
  var ctrl = this;
  
  var serviceClassesPreferredVersion = APIService.getPreferredVersion('clusterserviceclasses');

  DataService.list(serviceClassesPreferredVersion, {})
  .then(function(serviceClasses) {
    ctrl.serviceProviders = _.filter(serviceClasses.by('metadata.name'), function(serviceClass) {
      var serviceClassName = _.get(serviceClass, 'spec.externalMetadata.serviceName');
      return ctrl.integrations.contains(serviceClassName);
    });
  });
}