import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import * as  Highcharts from 'highcharts';
import { Subscription, switchMap } from 'rxjs';
import { RelationType } from '../model/relation-type-enum';
import { DataManagerService } from '../services/data-manager.service';

@Component({
  templateUrl: './relations-page.component.html',
  styleUrls: ['./relations-page.component.css']
})
export class RelationsPageComponent implements OnInit, OnDestroy {

  loaded = false;

  relationTypes: Array<string> = [RelationType.start, RelationType.end, RelationType.related, RelationType.otherDance];
  private valueChangesSubscription!: Subscription

  relationsForm = new FormGroup({
    relationTypes: new FormControl("")
  });


  @ViewChild('chart')
  chartViewChild!: ElementRef;

  constructor(private dataManagerService: DataManagerService) {
    require('highcharts/modules/networkgraph')(Highcharts);
  }

  async ngOnInit(): Promise<void> {
    await this.dataManagerService.loading();
    this.loaded = true;
    this.valueChangesSubscription = this.relationsForm.valueChanges.pipe(
      switchMap((value: { relationTypes: Array<string> }) => this.dataManagerService.getRelationPairs(value.relationTypes))).subscribe((pairs: Array<Array<string>>) => {
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
      });
    this.relationsForm.patchValue({ relationTypes: [RelationType.start, RelationType.end, RelationType.related, RelationType.otherDance] });
  };

  ngOnDestroy(): void {
    this.valueChangesSubscription?.unsubscribe();
  }
}
