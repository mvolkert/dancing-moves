import { Component, ElementRef, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import * as go from 'gojs';
import * as  Highcharts from 'highcharts';
import { Subscription, switchMap, tap } from 'rxjs';
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
      switchMap((value: RelationParams) => this.dataManagerService.getRelationPairs(value.relationTypes))).subscribe((pairs: Array<Array<string>>) => {
        if (this.relationsForm.get("displayType")?.value === RelationDisplayType.highchartsNetworkgraph) {
          this.showGoJs = false;
          this.createHighchart(pairs);
        } else {
          this.showGoJs = true;
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

  private createHighchart(pairs: string[][]) {
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
  public state = {
    // Diagram state props
    diagramNodeData: [
      { id: 'Alpha', text: "Alpha", color: 'lightblue' },
      { id: 'Beta', text: "Beta", color: 'orange' }
    ],
    diagramLinkData: [
      { key: -1, from: 'Alpha', to: 'Beta' }
    ],
    diagramModelData: { prop: 'value' },
    skipsDiagramUpdate: false,

    // Palette state props
    paletteNodeData: [
      { key: 'PaletteNode1', color: 'firebrick' },
      { key: 'PaletteNode2', color: 'blueviolet' }
    ]
  }; // end state object

  public diagramDivClassName: string = 'myDiagramDiv';
  public paletteDivClassName = 'myPaletteDiv';

  // initialize diagram / templates
  public initDiagram(): go.Diagram {
    const $ = go.GraphObject.make;
    const dia = $(go.Diagram, {
      'undoManager.isEnabled': true,
      model: $(go.GraphLinksModel,
        {
          nodeKeyProperty: 'id',
          linkKeyProperty: 'key' // IMPORTANT! must be defined for merges and data sync when using GraphLinksModel
        }
      )
    });

    // define the Node template
    dia.nodeTemplate =
      $(go.Node, 'Auto',
        $(go.Shape, 'RoundedRectangle', { stroke: null },
          new go.Binding('fill', 'color')
        ),
        $(go.TextBlock, { margin: 8, editable: true },
          new go.Binding('text').makeTwoWay())
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
