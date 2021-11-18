import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { MoveDto } from '../model/move-dto';
import { MoveGroupDto } from '../model/move-group-dto';
import { DataManagerService } from '../services/data-manager.service';
import { SettingsService } from '../services/settings.service';

@Component({
  selector: 'app-move-page',
  templateUrl: './move-page.component.html',
  styleUrls: ['./move-page.component.css']
})
export class MovePageComponent implements OnInit {
  move: MoveDto | undefined;
  dances = new Set<string>();
  types = new Set<string>();
  moveForm = new FormGroup({
    name: new FormControl('', [Validators.required, this.nameExistsValidator()]),
    dance: new FormControl('', Validators.required),
    date: new FormControl(''),
    order: new FormControl(''),
    count: new FormControl(''),
    nameVerified: new FormControl(''),
    type: new FormControl(''),
    startMove: new FormControl(''),
    endMove: new FormControl(''),
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
    links: new FormControl(''),
    row: new FormControl('')
  });
  movesGroup: MoveGroupDto[] | undefined;
  otherMovesNames: Set<string> = new Set<string>();
  loaded = false;
  nameParam = ""

  constructor(private route: ActivatedRoute, private dataManager: DataManagerService, 
    private settings: SettingsService) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.init(params);
    });
    this.moveForm.valueChanges.subscribe(value => {
      console.log(value);
    });
    this.dataManager.getGroupedMoveNames().subscribe(groupedMoveNames => {
      this.movesGroup = groupedMoveNames;
    });
  }

  async init(params: ParamMap) {
    await this.dataManager.loading();
    this.dances = this.dataManager.getDances();
    this.types = this.dataManager.getTypes();
    this.otherMovesNames = this.dataManager.getMovesNames();
    this.otherMovesNames.add("new");
    if (!params.has('name')) {
      return;
    }
    this.nameParam = params.get('name') as string;
    this.nameParam = decodeURI(this.nameParam);

    if (this.nameParam == "new") {
      this.loaded = true;
    } else {
      this.move = this.dataManager.getMove(this.nameParam);
      if (this.move) {
        this.moveForm.patchValue(this.move);
        this.otherMovesNames.delete(this.move.name);
        this.loaded = true;
      }
    }
    this.moveForm.updateValueAndValidity();
    if (!this.settings.secretWrite) {
      this.moveForm.disable();
    }
  }

  onSubmit() {
    console.log(this.moveForm.value);
    if (this.nameParam == "new") {
      this.dataManager.create(this.moveForm.value);
    } else {
      this.dataManager.save(this.moveForm.value);
    }
  }

  private nameExistsValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const forbidden = this.otherMovesNames?.has(control.value);
      return forbidden ? { nameExists: { value: control.value } } : null;
    };
  }
}
