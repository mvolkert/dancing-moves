import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { RelationDisplayType } from 'src/app/model/relation-display-type-enum';
import { RelationType } from 'src/app/model/relation-type-enum';
import { DataManagerService } from 'src/app/services/data-manager.service';
import { NavService } from 'src/app/services/nav.service';

@Component({
  selector: 'app-relations-selection',
  templateUrl: './relations-selection.component.html',
  styleUrls: ['./relations-selection.component.css']
})
export class RelationsSelectionComponent implements OnInit {
  relationTypes: Array<string> = [RelationType.start, RelationType.end, RelationType.contained, RelationType.related, RelationType.otherDance];
  displayTypes: Array<string> = [RelationDisplayType.cytoscape]

  relationsForm = new FormGroup({
    relationTypes: new FormControl([]),
    displayType: new FormControl("")
  });
  constructor(private dataManagerService: DataManagerService, private navService: NavService) { }

  async ngOnInit(): Promise<void> {
    await this.dataManagerService.loading();
    this.dataManagerService.relationsSelectionObservable.subscribe(value => {
      this.relationsForm.patchValue(value);
    })
    this.relationsForm.valueChanges.subscribe(
      value => this.navService.navigate([], value));
  }

}
