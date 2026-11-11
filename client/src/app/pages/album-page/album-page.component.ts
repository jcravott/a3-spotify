import { Component, DestroyRef, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, EMPTY, forkJoin, switchMap } from 'rxjs';
import { SpotifyService } from '../../services/spotify.service';
import { ArtistData } from '../../data/artist-data';
import { TrackData } from '../../data/track-data';
import { AlbumData } from '../../data/album-data';

@Component({
    selector: 'app-album-page',
    templateUrl: './album-page.component.html',
    styleUrls: ['./album-page.component.css'],
    standalone: false
})
export class AlbumPageComponent implements OnInit {
	albumId:string;
	album:AlbumData;
	tracks:TrackData[];


  errorMessage:string = '';

  constructor(private route: ActivatedRoute, private spotifyService:SpotifyService, private destroyRef:DestroyRef) { }

  ngOnInit() {
    //inject spotifyService and use it to get the album data and the tracks for the album
    this.route.paramMap.pipe(
      switchMap((params) => {
        this.albumId = params.get('id');
        this.album = undefined;
        this.tracks = undefined;
        this.errorMessage = '';
        return forkJoin({
          album: this.spotifyService.getAlbum(this.albumId),
          tracks: this.spotifyService.getTracksForAlbum(this.albumId)
        }).pipe(
          catchError(() => {
            this.errorMessage = 'Unable to load album. Check that the dummy webserver is running.';
            return EMPTY;
          })
        );
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((data) => {
      this.album = data.album;
      this.tracks = data.tracks;
    });
  }

}
