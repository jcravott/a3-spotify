import { Component, OnInit } from '@angular/core';
import { SpotifyService } from '../../services/spotify.service';
import { TrackData } from '../../data/track-data';
import { ResourceData } from '../../data/resource-data';

@Component({
    selector: 'app-search',
    templateUrl: './search.component.html',
    styleUrls: ['./search.component.css'],
    providers: [SpotifyService],
    standalone: false
})
export class SearchComponent implements OnInit {
  searchString:string = '';
  searchCategory:string = 'artist';
  searchCategories:string[] = ['artist', 'album', 'track'];
  resources:ResourceData[];
  tracks:TrackData[];
  resultCategory:string;
  searching:boolean = false;
  errorMessage:string = '';

  constructor(private spotifyService:SpotifyService) { }

  ngOnInit() {
  }

  search() {
    //call search function in spotifyService and parse response
    const category = this.searchCategory;
    //Remove the old carousel so each new result set starts on its first card.
    this.resources = undefined;
    this.tracks = undefined;
    this.errorMessage = '';
    this.searching = true;
    this.spotifyService.searchFor(category, this.searchString).then((resources) => {
      this.resultCategory = category;
      this.resources = resources;
      this.tracks = category === 'track' ? resources as TrackData[] : undefined;
    }).catch(() => {
      this.errorMessage = 'Unable to search. Check that the dummy webserver is running.';
    }).finally(() => {
      this.searching = false;
    });
  }

}
