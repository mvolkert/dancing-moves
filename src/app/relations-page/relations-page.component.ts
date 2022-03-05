import { Component, ElementRef, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import * as cytoscape from 'cytoscape';
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

  @ViewChild('chartCytoscape')
  chartViewChildCytoscape!: ElementRef;

  constructor(private dataManagerService: DataManagerService, private navService: NavService) {
    this.navService.headlineObservable.next("Relations");
  }

  async ngOnInit(): Promise<void> {
    await this.dataManagerService.loading();
    this.dataManagerService.isStarting.subscribe(starting => {
      this.loaded = !starting;
      if (!starting) {
        this.start();
      }
    });
  }

  private start() {
    this.valueChangesSubscription = this.dataManagerService.relationsSelectionObservable.pipe(
      switchMap((value: RelationParams) => this.dataManagerService.getRelationPairs(value.relationTypes))).subscribe((pairs: Array<Connection>) => {
        if (this.dataManagerService.relationsSelectionObservable.value.displayType === RelationDisplayType.cytoscape) {
          this.show = "Cytoscape";
          this.createCytoscape(pairs);
        }
      });
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
