import { resolve } from 'path';


export default function (kibana) {
  return new kibana.Plugin({
    require: ['elasticsearch'],
    name: 'kbn-vis-multigraph',
    uiExports: {
      
      app: {
        title: 'Kbn Vis Multigraph',
        description: 'kibana test plugin',
        main: 'plugins/kbn-vis-multigraph/app'
      },
      
      
      translations: [
        resolve(__dirname, './translations/es.json')
      ],
      
      
    },

    config(Joi) {
      return Joi.object({
        enabled: Joi.boolean().default(true),
      }).default();
    },

    

  });
};
