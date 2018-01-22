import { uiModules } from 'ui/modules';
import tableVisParamsTemplate from 'plugins/kbn_vis_multiple_graph/kbn_vis_multiple_graph_params.html';

uiModules.get('kibana/kbn_vis_multiple_graph')
  .directive('kbnVisMultipleGraphParams', function () {
    return {
      restrict: 'E',
      template: tableVisParamsTemplate,
      link: function ($scope) {
        // $scope.totalAggregations = ['sum', 'avg', 'min', 'max', 'count'];
        //
        // $scope.$watchMulti([
        //   'vis.params.showPartialRows',
        //   'vis.params.showMeticsAtAllLevels'
        // ], function () {
        //   if (!$scope.vis) return;
        //
        //   const params = $scope.vis.params;
        //   if (params.showPartialRows || params.showMeticsAtAllLevels) {
        //     $scope.metricsAtAllLevels = true;
        //   } else {
        //     $scope.metricsAtAllLevels = false;
        //   }
        // });
      }
    };
  });
