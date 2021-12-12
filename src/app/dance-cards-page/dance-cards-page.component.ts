import { Component, OnInit } from '@angular/core';
import { DanceDto } from '../model/dance-dto';
import { DataManagerService } from '../services/data-manager.service';
import { NavService } from '../services/nav.service';

@Component({
  templateUrl: './dance-cards-page.component.html',
  styleUrls: ['./dance-cards-page.component.css']
})
export class DanceCardsPageComponent implements OnInit {
  dances: DanceDto[] = [];
  loaded = false;
  constructor(private dataManagerService: DataManagerService, private navService: NavService) {
    this.navService.headlineObservable.next("Dances");
  }

  async ngOnInit(): Promise<void> {
    await this.dataManagerService.loading();
    this.dances = this.dataManagerService.getDances();
    this.loaded = true;
  }

}
