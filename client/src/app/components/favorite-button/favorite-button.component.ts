import { Component, Input } from '@angular/core';
import { ResourceData } from '../../data/resource-data';
import { SavedItemsService } from '../../services/saved-items.service';

@Component({
  selector: 'app-favorite-button',
  standalone: true,
  template: `
    <button type="button" class="btn btn-outline-light"
      [class.active]="savedItems.isFavorite(resource)"
      [attr.aria-pressed]="savedItems.isFavorite(resource)"
      [attr.aria-label]="savedItems.isFavorite(resource)
        ? 'Remove ' + resource.name + ' from favorites'
        : 'Add ' + resource.name + ' to favorites'"
      (click)="savedItems.toggleFavorite(resource)">
      {{ savedItems.isFavorite(resource) ? '★ Remove favorite' : '☆ Add favorite' }}
    </button>
  `
})
export class FavoriteButtonComponent {
  @Input({ required: true }) resource:ResourceData;

  constructor(public savedItems:SavedItemsService) { }
}
