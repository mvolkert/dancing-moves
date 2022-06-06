import { Component, OnInit } from '@angular/core';
import { DanceDto } from '../model/dance-dto';
import { SearchDto } from '../model/search-dto';
import { DataManagerService } from '../services/data-manager.service';
import { NavService } from '../services/nav.service';
import { deepCopy, generateSortFn } from '../util/util';

@Component({
  templateUrl: './dance-cards-page.component.html',
  styleUrls: ['./dance-cards-page.component.css']
})
export class DanceCardsPageComponent implements OnInit {
  dances: DanceDto[] = [];
  allDances: DanceDto[] = [];
  loaded = false;
  constructor(private dataManagerService: DataManagerService, private navService: NavService) {
    this.navService.headlineObservable.next("Dances");
  }

  async ngOnInit(): Promise<void> {
    this.dataManagerService.isStarting.subscribe(starting => {
      if (!starting) {
        this.start();
      }
      this.loaded = !starting;
    });
  }

  private start() {
    this.dances = this.dataManagerService.getDances();
    this.allDances = deepCopy(this.dances);
    this.dataManagerService.searchFilterObservable.subscribe(
      (value: SearchDto) => {
        this.dances = this.dataManagerService.selectDances(this.allDances, value).sort(generateSortFn([d => d.name]));
      });
  }

  openDetails(name: string): Promise<boolean> {
    return this.navService.navigate(["dance", encodeURI(name)]);
  }
}
