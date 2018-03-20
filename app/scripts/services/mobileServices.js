'use strict';

angular.module("openshiftConsole")
  .factory("MobileServicesService", function (APIService, CatalogService, DataService) {
    var mobileclientVersion = {
      group: "mobile.k8s.io",
      version: "v1alpha1",
      resource: "mobileclients"
    };

    var getIcon = function (serviceInstance) {
      var serviceName = _.get(serviceInstance, "metadata.labels.serviceName");
      return CatalogService.getCatalogItems().then(function (catalogServices) {
        var item = _.find(catalogServices, function (catalogService) {
          var serviceClassName = _.get(catalogService, 'resource.spec.externalMetadata.serviceName');
          return serviceClassName === serviceName
        })
        return _.get(item, 'resource.spec.externalMetadata.imageUrl');
      });
    };

    var filterExcluded = function (mobileClient, serviceInstances) {
      var excludedServices = _.get(mobileClient, 'spec.excludedServices');
      return _.filter(serviceInstances, function (serviceInstance) {
        var serviceName = _.get(serviceInstance, 'metadata.name', '');
        return _.includes(excludedServices, serviceName);
      });
    };

    var filterNotExcluded = function (mobileClient, serviceInstances) {
      var excludedServices = _.get(mobileClient, 'spec.excludedServices');
      return _.filter(serviceInstances, function (serviceInstance) {
        var serviceName = _.get(serviceInstance, 'metadata.name', '');
        return !_.includes(excludedServices, serviceName);
      });
    };

    var removeFromExcluded = function (mobileClient, serviceInstance, context) {
      var excludedServices = _.get(mobileClient, 'spec.excludedServices') || [];
      var clientName = _.get(mobileClient, 'spec.name');
      var serviceName = _.get(serviceInstance, 'metadata.name');

      _.remove(excludedServices, function (serviceInstance) {
        return serviceInstance === serviceName;
      });

      return DataService.update(mobileclientVersion, _.get(mobileClient, 'metadata.name'), mobileClient, context)
    };

    var excludeService = function (mobileClient, serviceInstance, context) {
      var excludedServices = _.get(mobileClient, 'spec.excludedServices') || [];
      var clientName = _.get(mobileClient, 'spec.name');
      var serviceName = _.get(serviceInstance, 'metadata.name');

      excludedServices.push(_.get(serviceInstance, 'metadata.name'));
      _.set(mobileClient, 'spec.excludedServices', excludedServices);

      return DataService.update(mobileclientVersion, _.get(mobileClient, 'metadata.name'), mobileClient, context);
    };

    return {
      getIcon: getIcon,
      filterExcluded: filterExcluded,
      filterNotExcluded: filterNotExcluded,
      removeFromExcluded: removeFromExcluded,
      excludeService: excludeService
    };
  });