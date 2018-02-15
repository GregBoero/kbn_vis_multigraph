import {uiModules} from 'ui/modules';
import _ from 'lodash';
import c3 from 'c3';

// get the kibana/table_vis module, and make sure that it requires the 'kibana' module if it
// didn't already
const module = uiModules.get('kibana/kbn_vis_multiple_graph', ['kibana']);

// add a controller to tha module, which will transform the esResponse into a
// tabular format that we can pass to the table directive
module.controller('kbnVisMultipleGraphController', ($scope, $element, $rootScope) => {

  //TODO improve the error handler

  const xAxisValues = [];
  const parsedData = [];
  const idChart = $element.children().find('.chartc3');

  let hold = '';
  let wold = '';
  let timeSeries = [];
  let chartLabels = {};
  let xLabel = '';
  let isTimeSeries = false;
  // Identify the div element in the HTML
  let message = 'This chart require more than one data point. Try adding an X-Axis Aggregation.';

  // this function type the option object
  let gen_chart_opt = (id, label, type, color) => {
    return {id: id, label: label, type: type, color: color};
  };

  $rootScope.editorParams = {};
  $rootScope.activate_grouped = false;

  // Be alert to changes in vis_params
  $scope.$watch('vis.params', (params) => {
    if (params) {
      console.debug('param => ', params);
    }
    if (!$rootScope.show_chart) return;

    $scope.chartGen();
  });

  // C3JS chart generator
  $scope.chart = null;
  $scope.chartGen = () => {

    // change bool value
    $rootScope.show_chart = true;

    let dataColors = {};
    let dataTypes = {};

    _.each($rootScope.charts_option, (chart) => {
      dataColors[chart.label] = chart.color;
      dataTypes[chart.label] = chart.type;
    });

    console.debug('dataTypes => ', dataTypes);
    // count bar charts and change bar ratio
    const theTypes = Object.values(dataTypes);
    const chartCount = {};

    _.each(theTypes, (i) => {
      chartCount[i] = (chartCount[i] || 0) + 1;
    });
    console.debug('chartCount => ', chartCount);
    let myRatio;
    if (chartCount.bar) {

      myRatio = 5 / timeSeries.length;
      myRatio = (myRatio > 0.35) ? 0.3 : myRatio;

      if (chartCount.bar > 1) {

        myRatio = (myRatio < 0.02) ? 0.02 : myRatio;
        $rootScope.activate_grouped = true;

      } else {

        myRatio = (myRatio < 0.01) ? 0.01 : myRatio;
        $rootScope.activate_grouped = false;
      }

    }

    const getDataArrayMap = {
      0: () => {
        message = 'Something went wrong during data representation';
      },
      1: () => {
        return [timeSeries, parsedData[0]];
      },
      2: () => {
        return [timeSeries, parsedData[0], parsedData[1]];
      },
      3: () => {
        return [timeSeries, parsedData[0], parsedData[1], parsedData[2]];
      },
      4: () => {
        return [timeSeries, parsedData[0], parsedData[1], parsedData[2], parsedData[3]];
      },
      5: () => {
        return [timeSeries, parsedData[0], parsedData[1], parsedData[2], parsedData[3], parsedData[4]];
      }
    };
    // define the data to show
    const totalData = {
      'x': 'x1',
      'columns': parsedData.length > 4 ? getDataArrayMap[5]() : getDataArrayMap[parsedData.length]()
    };

    console.debug('totalData => ', totalData);
    // largest number possible in JavaScript.
    let globalMin = Number.MAX_VALUE;

    // Search the min value of the data
    const parsedDataCopy = JSON.parse(JSON.stringify(parsedData));
    _.each(parsedDataCopy, (eachArray) => {
      eachArray.splice(0, 1);
      const eachArrayMin = Math.min(...eachArray);
      globalMin = (eachArrayMin < globalMin) ? eachArrayMin : globalMin;
    });

    console.debug('parsedDataCopy => ', parsedDataCopy);

    globalMin = (globalMin >= 0) ? 0 : globalMin;

    // configurate C3 object
    const config = {};
    config.bindto = idChart[0];
    config.data = totalData;
    config.data.types = dataTypes;
    config.data.colors = dataColors;
    config.data.labels = $scope.vis.params.dataLabels;
    config.legend = {'position': $scope.vis.params.legend_position};

    // timeSeries config
    if (isTimeSeries) {
      console.log('a time seris');
      config.bar = {'width': {'ratio': myRatio}};
      let timeFormat;
      const lastTimestapm = timeSeries[timeSeries.length - 1];
      const firstTimestamp = timeSeries[1];
      const timestampDiff = lastTimestapm - firstTimestamp;

      if (timestampDiff > 86400000) {
        timeFormat = $scope.vis.params.time_format;
      } else {
        timeFormat = '%H:%M';
      }
      config.axis = {
        'x': {
          'label': {'text': xLabel, 'position': 'outer-center'},
          'type': 'timeSeries',
          'tick': {
            'fit': (timeSeries.length < 4),
            'multiline': false,
            'format': timeFormat
          }
        }, 'y': {'min': globalMin, 'padding': {'top': 30, 'bottom': 0}}
      };
      config.tooltip = {
        'format': {
          'title': (x) => {
            return x;
          }
        }
      };

      if ($scope.vis.params.legend_position === 'bottom') {
        config.padding = {'right': 20};
      }
      // category data config
    } else {
      console.log('not a time seris');
      config.axis = {
        'x': {
          'label': {'text': xLabel, 'position': 'outer-center'},
          'type': 'category',
          'tick': {'multiline': false}
        }, 'y': {'min': globalMin, 'padding': {'top': 30, 'bottom': 1}}
      };

      if (timeSeries.length - 1 > 13 && $scope.vis.params.fewXAxis) {
        console.log('fewXAxis');
        config.axis = {
          'x': {
            'label': {'text': xLabel, 'position': 'outer-center'},
            'type': 'category',
            'tick': {
              'fit': false,
              'multiline': false,
              'culling': {'max': 10},
              'format': $scope.vis.params.time_format
            }
          }, 'y': {'min': globalMin, 'padding': {'top': 30, 'bottom': 1}}
        };
      }
    }


    // Group bar charts, we need 2+ bar charts and checked checkbox in params
    if ($rootScope.activate_grouped && $scope.vis.params.grouped) {

      const losKeys = Object.keys(dataTypes);
      const losValues = Object.values(dataTypes);
      const groupCharts = [];
      _.each(losValues, (chartType, index) => {
        if (chartType === 'bar') {
          groupCharts.push(losKeys[index]);
        }
      });
      config.data.groups = [groupCharts];
    }

    if ($scope.vis.params.gridlines) {
      config.grid = {'x': {'show': true}, 'y': {'show': true}};
    }

    // zoom and hide points features
    config.point = {'show': !$scope.vis.params.hidePoints};
    config.zoom = {'enabled': $scope.vis.params.enableZoom};

    // Generate and draw
    console.log('C3 config', config);
    $scope.chart = c3.generate(config);

    // resize
    const elem = angular.element(idChart[0]).closest('div.visualize-chart');
    const h = elem.height();
    const w = elem.width();
    $scope.chart.resize({height: h - 50, width: w - 50});
  };

  // Get data from ES
  $scope.processTableGroups = (tableGroups) => {
    if(!$scope.$root.charts_option || ($scope.$root.charts_option && $scope.$root.charts_option.length < 1)){
      $scope.$root.charts_option = $scope.vis.params.charts_option;
    }
    let chart_opt = [];
    if (tableGroups && tableGroups.tables) {
      _.each(tableGroups.tables, (table) => {
        console.log('table', table);
        _.each(table.columns, (column, index) => {
          console.log('column', column);
          const data = table.rows;
          const tmp = [];
          _.each(data, (val) => {
            if (val) {
              tmp.push(val[index]);
            }
          });
          if (column.aggConfig.__schema.group === 'metrics' ) {
            chart_opt.push(gen_chart_opt(column.aggConfig.id, column.title, $scope.vis.params.chart_type, $scope.vis.params.chart_color));
            chartLabels[column.title] = column.title;
            tmp.splice(0, 0, column.title);
            parsedData.push(tmp);
          } else if(column.aggConfig.__schema.title === 'X-Axis'){
            isTimeSeries = column.aggConfig.__type.name === 'date_histogram' || column.aggConfig.__type.name === 'date_range';
            xLabel = column.title;
            xAxisValues.push(tmp);
          }
        });
      });
      console.log('parsedData',parsedData);
    }
    $rootScope.editorParams.label = chartLabels;
    if (!$rootScope.charts_option) {
      $rootScope.charts_option = chart_opt;
    } else {
      let tmp = $rootScope.charts_option;
      $rootScope.charts_option = chart_opt;

      _.each($rootScope.charts_option, (newChart) => {
        _.each(tmp, (chart) => {
          if (newChart.id === chart.id) {
            newChart.type = chart.type;
            newChart.color = chart.color;
          }
        });
      });
    }
  };


  $scope.$watch('esResponse', (resp) => {
    if (resp) {
      console.debug('$scope vis aggs bucket  ->', $scope.vis.aggs.bySchemaName.bucket);
      if (!$scope.vis.aggs.bySchemaName.bucket) {
        $scope.waiting = message;
        return;
      }

      xAxisValues.length = 0;
      timeSeries.length = 0;
      parsedData.length = 0;
      chartLabels = {};
      $scope.processTableGroups(resp);

      if (!xAxisValues[0]) {
        $scope.waiting = 'No data to display increase the time range or review your filter ';
        return;
      }

      // avoid reference between arrays!!!
      timeSeries = xAxisValues[0].slice();
      timeSeries.splice(0, 0, 'x1');
      $scope.chartGen();
    }

  });

  // Automatic resizing of graphics
  $scope.$watch(
    () => {
      const elem = angular.element(idChart[0]).closest('div.visualize-chart');
      const h = elem.height();
      const w = elem.width();

      if (!$scope.chart) return;

      if (idChart.length > 0 && h > 0 && w > 0) {

        if (hold !== h || wold !== w) {
          $scope.chart.resize({height: h - 50, width: w - 50});
          hold = elem.height();
          wold = elem.width();
        }

      }
      $element.trigger('renderComplete');
    },
    true
  );

});

