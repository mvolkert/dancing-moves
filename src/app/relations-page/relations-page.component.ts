import { style } from '@angular/animations';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import * as  Highcharts from 'highcharts';
import { DataManagerService } from '../services/data-manager.service';

@Component({
  templateUrl: './relations-page.component.html',
  styleUrls: ['./relations-page.component.css']
})
export class RelationsPageComponent implements OnInit {

  loaded = false;

  @ViewChild('chart')
  chartViewChild!: ElementRef;

  constructor(private dataManagerService: DataManagerService) {
    require('highcharts/modules/networkgraph')(Highcharts);
  }



  async ngOnInit(): Promise<void> {
    await this.dataManagerService.loading();
    this.loaded = true;
    this.dataManagerService.getRelationPairs().subscribe(pairs => {
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
  };

}
