import { Component, DestroyRef, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, EMPTY, forkJoin, switchMap } from 'rxjs';
import { SpotifyService } from '../../services/spotify.service';
import { ArtistData } from '../../data/artist-data';
import { TrackData } from '../../data/track-data';
import { AlbumData } from '../../data/album-data';

@Component({
    selector: 'app-track-page',
    templateUrl: './track-page.component.html',
    styleUrls: ['./track-page.component.css'],
    standalone: false
})
export class TrackPageComponent implements OnInit {
	trackId:string;
	track:TrackData;

  errorMessage:string = '';

  constructor(private route: ActivatedRoute, private spotifyService:SpotifyService, private destroyRef:DestroyRef) { }

  ngOnInit() {
    //Inject the spotifyService and use it to get the track data
    this.route.paramMap.pipe(
      switchMap((params) => {
        this.trackId = params.get('id');
        this.track = undefined;
        this.errorMessage = '';
        return forkJoin({
          track: this.spotifyService.getTrack(this.trackId)
        }).pipe(
          catchError(() => {
            this.errorMessage = 'Unable to load track. Check that the dummy webserver is running.';
            return EMPTY;
          })
        );
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((data) => {
      this.track = data.track;
    });
  }

}
