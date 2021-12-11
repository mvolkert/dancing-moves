import { Component, ElementRef, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import * as cytoscape from 'cytoscape';
import * as go from 'gojs';
import * as Highcharts from 'highcharts';
import { Subscription, switchMap } from 'rxjs';
import { Connection } from '../model/connection';
import { RelationDisplayType } from '../model/relation-display-type-enum';
import { RelationParams } from '../model/relation-params';
import { DataManagerService } from '../services/data-manager.service';
import { NavService } from '../services/nav.service';

@Component({
  templateUrl: './relations-page.component.html',
  styleUrls: ['./relations-page.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class RelationsPageComponent implements OnInit, OnDestroy {

  loaded = false;
  show = "";
  private valueChangesSubscription!: Subscription
  cy!: cytoscape.Core;


  @ViewChild('chartHighchart')
  chartViewChildHighchart!: ElementRef;

  @ViewChild('chartCytoscape')
  chartViewChildCytoscape!: ElementRef;

  constructor(private dataManagerService: DataManagerService, private navService: NavService) {
    this.navService.headlineObservable.next("Relations");
    require('highcharts/modules/networkgraph')(Highcharts);
  }

  async ngOnInit(): Promise<void> {
    await this.dataManagerService.loading();
    this.loaded = true;
    this.valueChangesSubscription = this.dataManagerService.relationsSelectionObservable.pipe(
      switchMap((value: RelationParams) => this.dataManagerService.getRelationPairs(value.relationTypes))).subscribe((pairs: Array<Connection>) => {
        if (this.dataManagerService.relationsSelectionObservable.value.displayType === RelationDisplayType.highchartsNetworkgraph) {
          this.show = "Highchart";
          this.createHighchart(pairs);
        } else if (this.dataManagerService.relationsSelectionObservable.value.displayType === RelationDisplayType.cytoscape) {
          this.show = "Cytoscape";
          this.createCytoscape(pairs);
        } else {
          this.show = "Gojs";
          this.updateGojsDiagram(pairs);
        }
      });
  };

  private createHighchart(pairs: Connection[]) {
    Highcharts.chart(this.chartViewChildHighchart.nativeElement, {
      chart: {
        type: 'networkgraph',
        plotBorderWidth: 0,
        backgroundColor: 'transparent',
      },
      title: {
        text: 'Relations',
        style: {
          fontFamily: 'monospace',
          color: "#fff"
        }
      },
      plotOptions: {
        networkgraph: {
          keys: ['from', 'to'],
          layoutAlgorithm: {
            enableSimulation: false,
            integration: 'verlet',
            linkLength: 100
          }
        }
      },
      series: [{
        name: 'K8',
        marker: {
          radius: 20,
          fillColor: "#c2185b"
        },
        dataLabels: {
          enabled: true,
          textPath: {
            enabled: true,
            attributes: {
              dy: 9,
              startOffset: '45%',
              fill: "#fff"
            } as Highcharts.SVGAttributes
          },
          style: {
            fontSize: '9',
            fontWeight: '100'
          },
          linkFormat: '',
          allowOverlap: true
        },
        data: pairs
      }]
    } as Highcharts.Options);
  }

  // Big object that holds app-level state data
  // As of gojs-angular 2.0, immutability is required of state for change detection
  gojsState = {
    // Diagram state props
    diagramNodeData: [],
    diagramLinkData: [],
    diagramModelData: { prop: 'value' },
    skipsDiagramUpdate: false,
  };

  private updateGojsDiagram(pairs: Array<Connection>) {
    const nodes = Array.from(new Set(pairs.flatMap(m => [m.from, m.to])).values()).map(m => { return { id: m, text: m } });
    const links = pairs;
    this.gojsState = {
      diagramNodeData: nodes as any,
      diagramLinkData: links as any,
      diagramModelData: { prop: 'value' },
      skipsDiagramUpdate: false,
    };
    console.log(this.gojsState);
  }
  // initialize diagram / templates
  createGojsDiagram(): go.Diagram {
    const $ = go.GraphObject.make;
    const dia = $(go.Diagram, {
      'undoManager.isEnabled': true,
      model: $(go.GraphLinksModel,
        {
          nodeKeyProperty: 'id',
          linkKeyProperty: 'key' // IMPORTANT! must be defined for merges and data sync when using GraphLinksModel
        }
      ),
      initialAutoScale: go.Diagram.Uniform,  // an initial automatic zoom-to-fit
      contentAlignment: go.Spot.Center,  // align document to the center of the viewport
      layout:
        $(go.ForceDirectedLayout,  // automatically spread nodes apart
          { maxIterations: 200, defaultSpringLength: 30, defaultElectricalCharge: 100 })
    });

    // define each Node's appearance
    dia.nodeTemplate =
      $(go.Node, "Auto",  // the whole node panel
        { locationSpot: go.Spot.Center },
        // define the node's outer shape, which will surround the TextBlock
        $(go.Shape, "Rectangle",
          { fill: $(go.Brush, "Linear", { 0: "#c2185b", 1: "#c2185b" }) }),
        $(go.TextBlock,
          { font: "bold 10pt helvetica, bold arial, sans-serif", margin: 4 },
          new go.Binding("text", "text"))
      );

    // replace the default Link template in the linkTemplateMap
    dia.linkTemplate =
      $(go.Link,  // the whole link panel
        $(go.Shape,  // the link shape
          { stroke: "white" }),
        $(go.Shape,  // the arrowhead
          { toArrow: "standard", stroke: "white" }),
        $(go.Panel, "Auto",
          $(go.TextBlock,  // the label text
            {
              textAlign: "center",
              font: "10pt helvetica, arial, sans-serif",
              stroke: "#555555",
              margin: 4
            },
            new go.Binding("text", "text"))
        )
      );
    return dia;
  }

  /**
   * Handle GoJS model changes, which output an object of data changes via Mode.toIncrementalData.
   * This method should iterate over thoe changes and update state to keep in sync with the FoJS model.
   * This can be done with any preferred state management method, as long as immutability is preserved.
   */
  diagramModelChange = function (changes: go.IncrementalData) {
    console.log(changes);
    // see gojs-angular-basic for an example model changed handler that preserves immutability
    // when setting state, be sure to set skipsDiagramUpdate: true since GoJS already has this update
  };


  createCytoscape(pairs: Array<Connection>) {
    const nodes = Array.from(new Set(pairs.flatMap(m => [m.from, m.to])).values()).map(m => { return { data: { id: m, width: m.length * 10 } } });
    const links = pairs.map(m => { return { data: { id: m.from + m.to, source: m.from, target: m.to } } });
    const options: cytoscape.CytoscapeOptions = {
      container: this.chartViewChildCytoscape.nativeElement,

      elements: [
        ...nodes, ...links
      ],

      style: [
        {
          selector: 'node',
          style: {
            'label': 'data(id)',
            'height': 30,
            'width': 'data(width)',
            'border-color': '#000',
            'border-width': 3,
            'border-opacity': 0.5,
            'background-color': '#c2185b',
            'color': '#ccc',
            'text-wrap': 'wrap',
            'text-halign': 'center',
            'text-valign': 'center',
            'shape': 'roundrectangle'
          }
        },

        {
          selector: 'edge',
          style: {
            'width': 3,
            'line-color': '#ccc',
            'target-arrow-color': '#ccc',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier'
          }
        }
      ],

      layout: {
        name: 'cose',
        nodeDimensionsIncludeLabels: true,
        nodeRepulsion: (node) => 10000000,
      }
    };
    if (this.cy) {
      this.cy.json(options);
      this.cy.layout(options.layout as cytoscape.LayoutOptions).run();
      return;
    }
    this.cy = cytoscape(options);
    this.cy.on('tap', 'node', (evt) => {
      this.navService.navigate(["move", evt.target.id()]);
    });
  }

  ngOnDestroy(): void {
    this.valueChangesSubscription?.unsubscribe();
  }
}
