import {uiModules} from 'ui/modules';
import _ from 'lodash';
import $ from 'jquery';
import c3 from 'c3';

// get the kibana/table_vis module, and make sure that it requires the "kibana" module if it
// didn't already
const module = uiModules.get('kibana/kbn_vis_multiple_graph', ['kibana']);

// add a controller to tha module, which will transform the esResponse into a
// tabular format that we can pass to the table directive
module.controller('kbnVisMultipleGraphController', function ($scope, $element, $rootScope) {

  const xAxisValues = [];
  const parsedData = [];
  const idchart = $element.children().find('.chartc3');

  let hold = '';
  let wold = '';
  let timeseries = [];
  let chartLabels = {};
  let xLabel = '';
  let timeFormat = '';
  // Identify the div element in the HTML
  let message = 'This chart require more than one data point. Try adding an X-Axis Aggregation.';

  $rootScope.label_keys = [];
  $rootScope.editorParams = {};
  $rootScope.activate_grouped = false;

  // Be alert to changes in vis_params
  $scope.$watch('vis.params', function (params) {
    if (params) {
      console.log("param => ", params);
    }
    if (!$rootScope.show_chart) return;
    //if (Object.keys(params.editorPanel).length == 0 && params.enableZoom == previo_zoom) return;
    $scope.chartGen();
  });


  // C3JS chart generator
  $scope.chart = null;
  $scope.chartGen = () => {

    // change bool value
    $rootScope.show_chart = true;

    //create data_colors object
    const theLabels = Object.keys(chartLabels);
    const dataColors = {};
    const dataTypes = {};

    _.each(theLabels, (chart, index) => {
      switch (index) {
        case 0:
          dataColors[chart] = $scope.vis.params.color1;
          dataTypes[chart] = $scope.vis.params.type1;
          break;
        case 1:
          dataColors[chart] = $scope.vis.params.color2;
          dataTypes[chart] = $scope.vis.params.type2;
          break;
        case 2:
          dataColors[chart] = $scope.vis.params.color3;
          dataTypes[chart] = $scope.vis.params.type3;
          break;
        case 3:
          dataColors[chart] = $scope.vis.params.color4;
          dataTypes[chart] = $scope.vis.params.type4;
          break;
        case 4:
          dataColors[chart] = $scope.vis.params.color5;
          dataTypes[chart] = $scope.vis.params.type5;
          break;
      }
    });
    console.log("dataTypes => ", dataTypes);
    // count bar charts and change bar ratio
    const theTypes = Object.values(dataTypes);
    const chartCount = {};

    _.each(theTypes, (i) => {
      chartCount[i] = (chartCount[i] || 0) + 1;
    });
    console.log("chartCount => ", chartCount);
    let myRatio;
    if (chartCount.bar) {

      myRatio = 5 / timeseries.length;
      myRatio = (myRatio > 0.35) ? 0.3 : myRatio;

      if (chartCount.bar > 1) {

        myRatio = (myRatio < 0.02) ? 0.02 : myRatio;
        $rootScope.activate_grouped = true;

      } else {

        myRatio = (myRatio < 0.01) ? 0.01 : myRatio;
        $rootScope.activate_grouped = false;
      }

    }


    let totalData;
    // define the data to representate

    switch (parsedData.length) {
      case 0:
        message = "Something went wrong during data representation";
        break;
      case 1:
        totalData = {'x': 'x1', 'columns': [timeseries, parsedData[0]]};
        break;
      case 2:
        totalData = {'x': 'x1', 'columns': [timeseries, parsedData[0], parsedData[1]]};
        break;
      case 3:
        totalData = {'x': 'x1', 'columns': [timeseries, parsedData[0], parsedData[1], parsedData[2]]};
        break;
      case 4:
        totalData = {'x': 'x1', 'columns': [timeseries, parsedData[0], parsedData[1], parsedData[2], parsedData[3]]};
        break;
      default:
        totalData = {
          'x': 'x1',
          'columns': [timeseries, parsedData[0], parsedData[1], parsedData[2], parsedData[3], parsedData[4]]
        };
        break;
    }

    console.log("totalData => ", totalData);
    // largest number possible in JavaScript.
    let globalMin = Number.MAX_VALUE;

    // Search the min value of the data
    const parsedDataCopy = JSON.parse(JSON.stringify(parsedData));
    _.each(parsedDataCopy, (eachArray) => {
      eachArray.splice(0, 1);
      const eachArrayMin = Math.min(...eachArray);
      globalMin = (eachArrayMin < globalMin) ? eachArrayMin : globalMin;
    });

    console.log("parsedDataCopy => ", parsedDataCopy);

    globalMin = (globalMin >= 0) ? 0 : globalMin;

    // configurate C3 object
    const config = {};
    config.bindto = idchart[0];
    config.data = totalData;
    config.data.types = dataTypes;
    config.data.colors = dataColors;
    config.data.labels = $scope.vis.params.dataLabels;
    config.legend = {'position': $scope.vis.params.legend_position};

    console.log("$scope vis aggs bucket  name ->", $scope.vis.aggs.bySchemaName['bucket'][0].type.name);
    const bucketType = ($scope.vis.aggs.bySchemaName['bucket'] && $scope.vis.aggs.bySchemaName['bucket'][0] && $scope.vis.aggs.bySchemaName['bucket'][0].type ? null : $scope.vis.aggs.bySchemaName['bucket'][0].type.name);

    // timeseries config
    if (bucketType && (bucketType === 'date_histogram' || bucketType === 'date_range')) {

      config.bar = {'width': {'ratio': myRatio}};

      const lastTimestapm = timeseries[timeseries.length - 1];
      const firstTimestamp = timeseries[1];
      const timestampDiff = lastTimestapm - firstTimestamp;

      if (timestampDiff > 86400000) {
        timeFormat = '%Y-%m-%d';
      } else {
        timeFormat = '%H:%M';
      }

      const boolFit = (timeseries.length < 4);

      config.axis = {
        'x': {
          'label': {'text': xLabel, 'position': 'outer-center'},
          'type': 'timeseries',
          'tick': {'fit': boolFit, 'multiline': false, 'format': timeFormat}
        }, 'y': {'min': globalMin, 'padding': {'top': 30, 'bottom': 0}}
      };
      config.tooltip = {
        'format': {
          'title': function (x) {
            return x;
          }
        }
      };

      if ($scope.vis.params.legend_position === 'bottom') {
        config.padding = {'right': 20};
      }

      // category data config
    } else {

      config.axis = {
        'x': {
          'label': {'text': xLabel, 'position': 'outer-center'},
          'type': 'category',
          'tick': {'multiline': false}
        }, 'y': {'min': globalMin, 'padding': {'top': 30, 'bottom': 1}}
      };

      if (timeseries.length - 1 > 13 && $scope.vis.params.fewXAxis) {
        config.axis = {
          'x': {
            'label': {'text': xLabel, 'position': 'outer-center'},
            'type': 'category',
            'tick': {'fit': false, 'multiline': false, 'culling': {'max': 10}}
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
    $scope.chart = c3.generate(config);

    // resize
    const elem = $(idchart[0]).closest('div.visualize-chart');
    const h = elem.height();
    const w = elem.width();
    $scope.chart.resize({height: h - 50, width: w - 50});
  };

  // Get data from ES
  $scope.processTableGroups = (tableGroups) => {
    if (tableGroups && tableGroups.tables) {
      _.each(tableGroups.tables, (table) => {
        _.each(table.columns, (column, index) => {
          const data = table.rows;
          const tmp = [];
          _.each(data, (val) => {
            if (val) {
              tmp.push(val[index]);
            }
          });
          if (index > 0) {
            $rootScope.label_keys.push(column.title);
            chartLabels[column.title] = column.title;
            tmp.splice(0, 0, column.title);
            parsedData.push(tmp);
          } else {
            xLabel = column.title;
            xAxisValues.push(tmp);
          }
        });
      });
    }
    $rootScope.editorParams.label = chartLabels;
  };


  $scope.$watch('esResponse', function (resp) {
    if (resp) {
      console.log("$scope vis aggs bucket  ->", $scope.vis.aggs.bySchemaName['bucket']);
      if (!$scope.vis.aggs.bySchemaName['bucket']) {
        $scope.waiting = message;
        return;
      }

      xAxisValues.length = 0;
      timeseries.length = 0;
      parsedData.length = 0;
      chartLabels = {};
      $rootScope.label_keys = [];
      $scope.processTableGroups(resp);

      if (!xAxisValues) {
        $scope.waiting = "No data to display increase the time range or review your filter ";
        return;
      }

      // avoid reference between arrays!!!
      timeseries = xAxisValues[0].slice();
      timeseries.splice(0, 0, 'x1');
      $scope.chartGen();
    }

  });

  // Automatic resizing of graphics
  $scope.$watch(
    function () {
      const elem = $(idchart[0]).closest('div.visualize-chart');
      const h = elem.height();
      const w = elem.width();

      if (!$scope.chart) return;

      if (idchart.length > 0 && h > 0 && w > 0) {

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

