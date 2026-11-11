import { SavedItemsService } from '../../services/saved-items.service';
import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-home-page',
    templateUrl: './home-page.component.html',
    styleUrls: ['./home-page.component.css'],
    standalone: false
})
export class HomePageComponent implements OnInit {

  favoriteCategories = ['artist', 'album', 'track'];

  constructor(public savedItems:SavedItemsService) { }

  ngOnInit() {
  }

}
