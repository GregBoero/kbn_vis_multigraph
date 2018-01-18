
import './less/kbn_vis_multiple_graph.less';
import './kbn_vis_multiple_graph_controller';


import optionsTemplate from './kbn_vis_multiple_graph_params.html';
import VisTemplate from './kbn_vis_multiple_graph.html';

import { CATEGORY } from 'ui/vis/vis_category';
import { VisFactoryProvider } from 'ui/vis/vis_factory';
import { VisTypesRegistryProvider } from 'ui/registry/vis_types';
import { VisSchemasProvider } from 'ui/vis/editors/default/schemas';

// Require the JavaScript CSS file
require('../node_modules/c3/c3.css');


// register the provider with the visTypes registry
VisTypesRegistryProvider.register(KbnVisProvider);

function KbnVisProvider(Private) {
  const VisFactory = Private(VisFactoryProvider);
  const Schemas = Private(VisSchemasProvider);

  return VisFactory.createAngularVisualization({
    name: 'multi graph ',
    title: 'multi graph charts widget',
    icon: 'fa-spinner',
    description: 'This is Kibana 6 >  plugin which uses the JavaScript library C3.js for data representations.',
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
      template: VisTemplate,
    },
    editorConfig: {
      optionsTemplate: optionsTemplate,
      schemas: new Schemas([
        {
          group: 'metrics',
          name: 'metric',
          title: 'Y-axis metric',
          min: 1,
          max: 5,
          defaults: [ { type: 'count', schema: 'metric' } ],
        },
        {
          group: 'buckets',
          name: 'buckets',
          title: 'X-Axis',
          min: 1,
          max: 1,
          aggFilter: ['!geohash_grid']
        }
      ])
    }

  });
}

// export the provider so that the visType can be required with Private()
export default KbnVisProvider;

