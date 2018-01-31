# kbn_vis_multi_graph

> Kibana plugin that allow us to display data in multiple graph (max 4) 

> Available chart type : Bar chart / Line Chart / Spline Chart / Step Chart / Dot Chart / Area Chart / Area-Spline Chart / Area-Step Chart
---
![Screenshot](/public/images/graph.PNG)


## Status : 
|*in Development*| released     |
|:-------------:|:-------------:|

|*working*      | not working   |
|:-------------:|:-------------:|


| Kibana version| Compatible    | check          | 
|:-------------:|:-------------:|:-------------: |
| master        |      YES      |    NO          |
| 6.2.x         |      YES      |    NO          | 
| 6.1.x         |      YES      |    YES         |
| < 5           |      NO       |    YES         |


## Installation 
```
$ cd KIBANA_HOME/plugins
$ git clone https://github.com/GregBoero/kbn_vis_multiple_graph.git
$ cd kbn_vis_multiple_graph
 (if needed)
$ vi(m) ./package.json (change the kibana version to yours)
$ npm install
```

## Development

#### Minor
- Change the logo of the graph to use a accurate one 
- Fix the TODO and FIXME in the Code
#### Major
- Add option Conditional Y-axis in order to condition the data displayed  
- Add some css to be more user friendly 

See the [kibana contributing guide](https://github.com/elastic/kibana/blob/master/CONTRIBUTING.md) for instructions setting up your development environment. Once you have completed that, use the following npm tasks.
