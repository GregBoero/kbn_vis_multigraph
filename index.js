export default function (kibana) {

  return new kibana.Plugin({
    uiExports: {
      visTypes: [
        'plugins/kbn_vis_multiple_graph/kbn_vis_multiple_graph'
      ]
    }
  });

}
