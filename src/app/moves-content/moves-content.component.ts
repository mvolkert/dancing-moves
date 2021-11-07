import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
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

  constructor(private apiclientService: ApiclientService, private changeDetectorRef: ChangeDetectorRef) {
  }

  ngOnInit(): void {
    
    this.apiclientService.getMoves((moves: MoveDto[]) => {
      this.moves = moves;
      this.changeDetectorRef.detectChanges();
    });
  }

}
