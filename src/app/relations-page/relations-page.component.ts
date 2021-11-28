import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import * as  Highcharts from 'highcharts';
import { DataManagerService } from '../services/data-manager.service';

@Component({
  templateUrl: './relations-page.component.html',
  styleUrls: ['./relations-page.component.css']
})
export class RelationsPageComponent implements OnInit {

  @ViewChild('chart')
  chartViewChild!: ElementRef;

  constructor(private dataManagerService: DataManagerService) {
    require('highcharts/modules/networkgraph')(Highcharts);
  }



  async ngOnInit(): Promise<void> {
    await this.dataManagerService.loading();
    this.dataManagerService.getRelationPairs().subscribe(pairs => {
      Highcharts.chart(this.chartViewChild.nativeElement, {
        chart: {
          type: 'networkgraph',
          plotBorderWidth: 1
        },
        title: {
          text: 'Relations'
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
            radius: 35
          },
          dataLabels: {
            enabled: true,
            textPath: {
              enabled: true,
              attributes: {
                dy: 10,
                startOffset: '45%'
              } as Highcharts.SVGAttributes
            },
            linkFormat: '',
            allowOverlap: true
          },
          data: pairs
        }]
      } as Highcharts.Options);
    });
  };

}
