import { Component, OnInit } from '@angular/core';
import { NavService } from '../services/nav.service';

@Component({
  templateUrl: './dance-cards-page.component.html',
  styleUrls: ['./dance-cards-page.component.css']
})
export class DanceCardsPageComponent implements OnInit {

  constructor(private navService: NavService) {
    this.navService.headlineObservable.next("Dances");
  }

  ngOnInit(): void {
  }

}
