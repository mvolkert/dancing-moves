import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MoveDto } from '../model/move-dto';
import { DataManagerService } from '../services/data-manager.service';

@Component({
  selector: 'app-move-page',
  templateUrl: './move-page.component.html',
  styleUrls: ['./move-page.component.css']
})
export class MovePageComponent implements OnInit {
  move: MoveDto | undefined;
  dances = new Set<string>();
  moveForm = new FormGroup({
    firstName: new FormControl(''),
    name: new FormControl(''),
    dance: new FormControl(''),
    date: new FormControl(''),
    order: new FormControl(''),
    count: new FormControl(''),
    nameVerified: new FormControl(''),
    type: new FormControl(''),
    relatedMoves: new FormControl(''),
    videoname: new FormControl(''),
    description: new FormControl(''),
    sequence: new FormControl(''),
    sequenceLeader: new FormControl(''),
    sequenceFollower: new FormControl(''),
    mind: new FormControl(''),
    variations: new FormControl(''),
    date1: new FormControl(''),
    date2: new FormControl(''),
    toDo: new FormControl(''),
    links: new FormControl('')
  });
  constructor(private route: ActivatedRoute, private dataManager: DataManagerService) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      if (!params.has('name')) {
        return;
      }
      let name = params.get('name') as string;
      name = decodeURI(name);
      this.move = this.dataManager.getMove(name);
      this.dances = this.dataManager.getDances();
      if (this.move) {
        this.moveForm.patchValue(this.move);
        this.moveForm.disable();
      }
    });
  }
  onSubmit() {
    console.log(this.moveForm.value);
  }
}
