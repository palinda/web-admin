import { PermissionManagerService } from '@services/permission-manager.service';
import { BaseTemplateComponent } from '@components/base-template.component';
import { UserContextService } from '@services/user-context.service';
import { ComponentDef } from '@defs/component-def';
import { Component, OnInit, DoCheck, Input, Output, EventEmitter, Type, ElementRef, IterableDiffers } from '@angular/core';

@Component({
  selector: 'app-start-menu',
  templateUrl: './start-menu.component.html',
  styleUrls: ['./start-menu.component.scss']
})
export class StartMenuComponent implements OnInit, DoCheck {

  /**
   * Container definition list
   */
  containerDefList: Array<ComponentDef>;
  differ: any;

  dataSource: Object[] = [];
  /**
   * Start menu item select callback
   */
  @Output() onSelectContainer: EventEmitter<ComponentDef> = new EventEmitter<ComponentDef>();

  constructor(private _userContext: UserContextService, private _permissionMan: PermissionManagerService, differs: IterableDiffers) {
    this.containerDefList = _userContext.containerComponantInsts;
    this.containerDefList.forEach( el => {
      this.dataSource.push({
        'visible': this._permissionMan.hasOnePermission(el.permissions.permissionGroups),
        'data': el
      });
    });
    this.differ = differs.find([]).create(null);
  }

  ngOnInit() {

  }

  openComponent(compDef: ComponentDef): void {
    this.onSelectContainer.emit(compDef);
  }

  OnAuthorizedPermission(element: ElementRef) {
    element.nativeElement.parentNode.style.visibility = 'inherit';
  }

  OnUnauthorizedPermission(element: ElementRef) {
    element.nativeElement.parentNode.style.visibility = 'hidden';
  }

  ngDoCheck() {
    const changes = this.differ.diff(this.containerDefList);
    if (changes) {
      changes.forEachAddedItem(r => {
        this.dataSource.push({
          'visible': this._permissionMan.hasOnePermission(r.item.permissions.permissionGroups),
          'data': r.item
        });
      });
      // Handle dynamic remove
      // changes.forEachRemovedItem(r => this.logs.push('removed ' + r.item))
    }
  }

}
