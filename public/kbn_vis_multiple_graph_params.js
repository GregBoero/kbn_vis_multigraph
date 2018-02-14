import {uiModules} from 'ui/modules';
import tableVisParamsTemplate from 'plugins/kbn_vis_multiple_graph/kbn_vis_multiple_graph_params.html';
import _ from 'lodash';


uiModules.get('kibana/kbn_vis_multiple_graph')
  .directive('kbnVisMultipleGraphParams', () => {
    return {
      restrict: 'E',
      template: tableVisParamsTemplate,
      link: ($scope) => {

        if (!$scope.$root.charts_option || ($scope.$root.charts_option && $scope.$root.charts_option.length < 1)) {
          $scope.$root.charts_option = $scope.vis.params.charts_option;
        }

        $scope.setHasChange = () => {
          $scope.vis.params.charts_option = $scope.$root.charts_option;
        };

        $scope.shouldShowHidePoint = () => {
          const lineChartLabel = 'line';
          const splineChartLabel = 'spline';

          let result = false;
          _.each($scope.$root.charts_option, (chartOpt) => {
            result |= chartOpt.type.includes(lineChartLabel) || chartOpt.type.includes(splineChartLabel);
          });

          return result;

        };

        $scope.shouldShowGrouped = () => {
          let result = 0;
          _.each($scope.$root.charts_option, (option) => {

            if (option.type === 'bar') {
              result++;
            }
          });
          return (result >= 2);
        }
      }
    };
  });
