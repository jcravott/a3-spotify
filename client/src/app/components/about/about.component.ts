import { Component, OnInit } from '@angular/core';
import { SpotifyService } from '../../services/spotify.service';

@Component({
    selector: 'app-about',
    templateUrl: './about.component.html',
    styleUrls: ['./about.component.css'],
    standalone: false
})
export class AboutComponent implements OnInit {
  name:string = null;
  profile_pic:string = "assets/unknown.jpg";
  profile_link:string = null;


  errorMessage:string = '';

  //inject the Spotify service
  constructor(private spotifyService:SpotifyService) { }

  ngOnInit() {
  }

  /*create a function which gets the "about me" information from Spotify when the button in the view is clicked.
  In that function, update the name, profile_pic, and profile_link fields */
  loadInfo() {
    this.errorMessage = '';
    this.spotifyService.aboutMe().then((profile) => {
      this.name = profile.name;
      this.profile_pic = profile.imageURL;
      this.profile_link = profile.spotifyProfile;
    }).catch(() => {
      this.errorMessage = 'Unable to load profile. Check that the dummy webserver is running.';
    });
  }

}
