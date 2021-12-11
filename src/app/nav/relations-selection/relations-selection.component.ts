import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { RelationDisplayType } from 'src/app/model/relation-display-type-enum';
import { RelationType } from 'src/app/model/relation-type-enum';
import { DataManagerService } from 'src/app/services/data-manager.service';

@Component({
  selector: 'app-relations-selection',
  templateUrl: './relations-selection.component.html',
  styleUrls: ['./relations-selection.component.css']
})
export class RelationsSelectionComponent implements OnInit {
  relationTypes: Array<string> = [RelationType.start, RelationType.end, RelationType.related, RelationType.otherDance];
  displayTypes: Array<string> = [RelationDisplayType.cytoscape, RelationDisplayType.highchartsNetworkgraph, RelationDisplayType.gojsConceptMap]

  relationsForm = new FormGroup({
    relationTypes: new FormControl([]),
    displayType: new FormControl("")
  });
  constructor(private dataManagerService: DataManagerService, private route: ActivatedRoute, private router: Router) { }

  async ngOnInit(): Promise<void> {
    await this.dataManagerService.loading();
    this.dataManagerService.relationsSelectionObservable.subscribe(value => {
      this.relationsForm.patchValue(value);
    })
    this.relationsForm.valueChanges.subscribe(
      value => this.router.navigate([], {
        queryParams: value,
        queryParamsHandling: 'merge'
      }));
  }

}
