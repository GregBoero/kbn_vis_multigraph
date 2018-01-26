import {uiModules} from 'ui/modules';
import tableVisParamsTemplate from 'plugins/kbn_vis_multiple_graph/kbn_vis_multiple_graph_params.html';

uiModules.get('kibana/kbn_vis_multiple_graph')
  .directive('kbnVisMultipleGraphParams', function () {
    return {
      restrict: 'E',
      template: tableVisParamsTemplate,
      link: function ($scope) {
        $scope.shouldShowHidePoint = () => {
          const lineChartLabel = 'line';
          const splineChartLabel = 'spline';
          //TODO don't right all the chart type iterate over them
          return ($scope.$root.label_keys.length > 0 && ($scope.vis.params.type1.includes(lineChartLabel) || $scope.vis.params.type1.includes(splineChartLabel))) ||
            ($scope.$root.label_keys.length > 1 && ($scope.vis.params.type2.includes(lineChartLabel) || $scope.vis.params.type2.includes(splineChartLabel))) ||
            ($scope.$root.label_keys.length > 2 && ($scope.vis.params.type3.includes(lineChartLabel) || $scope.vis.params.type3.includes(splineChartLabel))) ||
            ($scope.$root.label_keys.length > 3 && ($scope.vis.params.type4.includes(lineChartLabel) || $scope.vis.params.type4.includes(splineChartLabel))) ||
            ($scope.$root.label_keys.length > 4 && ($scope.vis.params.type5.includes(lineChartLabel) || $scope.vis.params.type5.includes(splineChartLabel)));
        };

        $scope.shouldShowGrouped = () => {
          //TODO don't right all the chart type iterate over them
          const chartType = [$scope.vis.params.type1, $scope.vis.params.type2, $scope.vis.params.type3, $scope.vis.params.type4, $scope.vis.params.type5];
          let numberOfBarChart = 0 ;
          chartType.forEach((type) =>{
            if(type === 'bar'){
              numberOfBarChart++;
            }
          });
          return numberOfBarChart >= 2;
        }
      }
    };
  });
