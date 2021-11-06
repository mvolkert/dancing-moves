import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiclientService } from '../apiclient.service';
import { MoveDto } from '../movecard/move-dto';
@Component({
  selector: 'app-moves-content',
  templateUrl: './moves-content.component.html',
  styleUrls: ['./moves-content.component.css']
})
export class MovesContentComponent implements OnInit {

  moves: MoveDto[] = [];

  constructor(private apiclientService: ApiclientService, private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    console.log(this.moves);
    this.route.queryParams.subscribe(params => {
      const spreadsheetId = params['spreadsheetId'] as string;
      const apiKey = params['apiKey'] as string;
      if (!spreadsheetId || !apiKey) {
        return;
      }
      this.apiclientService.getMoves((moves: MoveDto[]) => {
        this.moves = moves;
      }, spreadsheetId, apiKey);
    })

  }

}
