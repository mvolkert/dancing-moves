import { Component, ElementRef, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import * as go from 'gojs';
import * as  Highcharts from 'highcharts';
import { Subscription, switchMap, tap } from 'rxjs';
import { Connection } from '../model/connection';
import { RelationDisplayType } from '../model/relation-display-type-enum';
import { RelationParams } from '../model/relation-params';
import { RelationType } from '../model/relation-type-enum';
import { DataManagerService } from '../services/data-manager.service';

@Component({
  templateUrl: './relations-page.component.html',
  styleUrls: ['./relations-page.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class RelationsPageComponent implements OnInit, OnDestroy {

  loaded = false;
  showGoJs = false;
  relationTypes: Array<string> = [RelationType.start, RelationType.end, RelationType.related, RelationType.otherDance];
  displayTypes: Array<string> = [RelationDisplayType.highchartsNetworkgraph, RelationDisplayType.gojsInteractiveForce]
  private valueChangesSubscription!: Subscription

  relationsForm = new FormGroup({
    relationTypes: new FormControl([]),
    displayType: new FormControl("")
  });

  @ViewChild('chart')
  chartViewChild!: ElementRef;

  constructor(private dataManagerService: DataManagerService, private route: ActivatedRoute, private router: Router) {
    require('highcharts/modules/networkgraph')(Highcharts);
  }

  async ngOnInit(): Promise<void> {
    await this.dataManagerService.loading();
    this.loaded = true;
    this.valueChangesSubscription = this.relationsForm.valueChanges.pipe(
      tap(value => this.router.navigate([], {
        queryParams: value,
        queryParamsHandling: 'merge'
      })),
      switchMap((value: RelationParams) => this.dataManagerService.getRelationPairs(value.relationTypes))).subscribe((pairs: Array<Connection>) => {
        if (this.relationsForm.get("displayType")?.value === RelationDisplayType.highchartsNetworkgraph) {
          this.showGoJs = false;
          this.createHighchart(pairs);
        } else {
          this.showGoJs = true;
          this.updateGojsDiagram(pairs);
        }
      });
    this.route.queryParams.subscribe(params => {
      console.log(params);
      let relationTypeParams = params["relationTypes"];
      if (!relationTypeParams) {
        relationTypeParams = [RelationType.start, RelationType.end, RelationType.related, RelationType.otherDance]
      } else if (typeof relationTypeParams === 'string') {
        relationTypeParams = [relationTypeParams];
      }
      let displayTypeParam = params["displayType"]?.trim();
      if (!displayTypeParam) {
        displayTypeParam = RelationDisplayType.highchartsNetworkgraph
      }
      this.relationsForm.patchValue({ relationTypes: relationTypeParams, displayType: displayTypeParam });
    })
  };

  private createHighchart(pairs: Connection[]) {
    Highcharts.chart(this.chartViewChild.nativeElement, {
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

  ngOnDestroy(): void {
    this.valueChangesSubscription?.unsubscribe();
  }

  // Big object that holds app-level state data
  // As of gojs-angular 2.0, immutability is required of state for change detection
  public gojsState = {
    // Diagram state props
    diagramNodeData: [
    ],
    diagramLinkData: [
    ],
    diagramModelData: { prop: 'value' },
    skipsDiagramUpdate: false,
  }; // end state object

  public gojsDivClassName: string = 'gojsDiv';

  updateGojsDiagram(pairs: Array<Connection>) {
    const nodes = Array.from(new Set(pairs.flatMap(m => [m.from, m.to])).values()).map(m => { return { id: m, text: m } });
    const links = pairs;
    this.gojsState = {
      // Diagram state props
      diagramNodeData: nodes as any,
      diagramLinkData: links as any,
      diagramModelData: { prop: 'value' },
      skipsDiagramUpdate: false,
    }; // end state object
    console.log(this.gojsState);
  }
  // initialize diagram / templates
  public createGojsDiagram(): go.Diagram {
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
  public diagramModelChange = function (changes: go.IncrementalData) {
    console.log(changes);
    // see gojs-angular-basic for an example model changed handler that preserves immutability
    // when setting state, be sure to set skipsDiagramUpdate: true since GoJS already has this update
  };
}
