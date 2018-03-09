'use strict';


angular.module('openshiftConsole').component('mobileClientConfig', {
    bindings: {
      mobileClient: '<',
    },
    templateUrl: 'views/mobile-client-config.html',
    controller: [
      'APIService', 
      'DataService', 
      'API_CFG', 
      MobileClientConfigCtrl]
  });

function MobileClientConfigCtrl(APIService, DataService, API_CFG) {
  var ctrl = this;
  var watches = [];
  ctrl.$onInit = function(){
    var context = {namespace: _.get(ctrl, "mobileClient.metadata.namespace")};
    //keep list of active services upto date
    DataService.watch(
      APIService.getPreferredVersion('serviceinstances'), 
      context, 
      function (serviceinstances){
        ctrl.services = _.filter(serviceinstances.by("metadata.name"), function(service, serviceName){
          return _.indexOf(ctrl.mobileClient.spec.excludedServices, serviceName) === -1;
        });
        DataService.list(APIService.getPreferredVersion('configmaps'), context, updateConfig, {errorNotification: false});
      }, 
      { errorNotification: false }
    );
    watches.push(DataService.watch(APIService.getPreferredVersion('configmaps'), context, updateConfig, {errorNotification: false}));

    // update the config string by pulling out configmaps that match ctrl.services
    function updateConfig(configmaps){
      var configs =_(configmaps.by("metadata.name"))
      .filter(function(configmap) {
        return  _.findIndex(ctrl.services, {metadata: {labels: {serviceName: _.get(configmap, "metadata.name")}}}) !== -1;
      })
      .map(function(configmap) {
        return {
          id: _.get(configmap, "metadata.name"),
          name: _.get(configmap, "metadata.name"),
          type: configmap.data.type,
          url: configmap.data.uri,
          config: configmap.data
        };
      }).value();
      ctrl.prettyConfig = JSON.stringify({
        version: 1,
        clusterName: API_CFG.openshift.hostPort,
        namespace: _.get(ctrl, "mobileClient.metadata.namespace"),
        clientId: _.get(ctrl, "mobileClient.metadata.name"),
        services: configs
      }, null, "  ");
    }
  };
  
  ctrl.$onDestroy = function() {
    DataService.unwatchAll(watches);
  };
}