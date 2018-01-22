import 'plugins/kbn_vis_multiple_graph/kbn_vis_multiple_graph.less';
import 'plugins/kbn_vis_multiple_graph/kbn_vis_multiple_graph_controller';
import 'plugins/kbn_vis_multiple_graph/kbn_vis_multiple_graph_params';
import 'ui/agg_table';
import 'ui/agg_table/agg_table_group';
import { VisFactoryProvider } from 'ui/vis/vis_factory';
import { CATEGORY } from 'ui/vis/vis_category';
import { VisSchemasProvider } from 'ui/vis/editors/default/schemas';
import tableVisTemplate from 'plugins/kbn_vis_multiple_graph/kbn_vis_multiple_graph.html';
import { VisTypesRegistryProvider } from 'ui/registry/vis_types';
import image from './images/icon-table.svg';
// we need to load the css ourselves

// we also need to load the controller and used by the template

// our params are a bit complex so we will manage them with a directive

// require the directives that we use as well

// register the provider with the visTypes registry
VisTypesRegistryProvider.register(TableVisTypeProvider);

// define the TableVisType
function TableVisTypeProvider(Private) {
  const VisFactory = Private(VisFactoryProvider);
  const Schemas = Private(VisSchemasProvider);

  // define the TableVisController which is used in the template
  // by angular's ng-controller directive

  // return the visType object, which kibana will use to display and configure new
  // Vis object of this type.
  return VisFactory.createAngularVisualization({
    type: 'table',
    name: 'kbn_vis_multiple_graph',
    title: 'Multiple graph',
    image,
    description: 'Display values in a table',
    category: CATEGORY.OTHER,
    visConfig: {
      defaults: {
        type1: 'line',
        color1: '#1f77b4',
        type2: 'line',
        color2: '#ff7f0e',
        type3: 'line',
        color3: '#2ca02c',
        type4: 'line',
        color4: '#d62728',
        type5: 'line',
        color5: '#9467bd',
        enableZoom: false,
        dataLabels: false,
        hidePoints: false,
        gridlines: false,
        few_x_axis: false,
        legend_position: 'right',
        time_format: '%d-%m-%Y',
        grouped: false
      },
      template: tableVisTemplate,
    },
    editorConfig: {
      optionsTemplate: '<kbn-vis-multiple-graph-params></kbn-vis-multiple-graph-params>',
      schemas: new Schemas([
        {
          group: 'metrics',
          name: 'metric',
          title: 'Y-axis metric',
          min: 1,
          max: 5,
          defaults: [
            { type: 'count', schema: 'metric' }
          ]
        },
        {
          group: 'buckets',
          name: 'bucket',
          title: 'X-Axis',
          min: 1,
          max: 1,
          aggFilter: ['!geohash_grid']
        }
      ])
    },
    responseHandlerConfig: {
      asAggConfigResults: true
    }
  });
}

export default TableVisTypeProvider;
