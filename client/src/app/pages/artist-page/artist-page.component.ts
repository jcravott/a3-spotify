import { Component, DestroyRef, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, EMPTY, forkJoin, switchMap } from 'rxjs';
import { SpotifyService } from '../../services/spotify.service';
import { ArtistData } from '../../data/artist-data';
import { TrackData } from '../../data/track-data';
import { AlbumData } from '../../data/album-data';

@Component({
    selector: 'app-artist-page',
    templateUrl: './artist-page.component.html',
    styleUrls: ['./artist-page.component.css'],
    standalone: false
})
export class ArtistPageComponent implements OnInit {
	artistId:string;
	artist:ArtistData;
	topTracks:TrackData[];
	albums:AlbumData[];

  errorMessage:string = '';

  constructor(private route: ActivatedRoute, private spotifyService:SpotifyService, private destroyRef:DestroyRef) { }

  ngOnInit() {
    //Inject the spotifyService and use it to get the artist data, top tracks for the artist, and the artist's albums
    this.route.paramMap.pipe(
      switchMap((params) => {
        this.artistId = params.get('id');
        this.artist = undefined;
        this.topTracks = undefined;
        this.albums = undefined;
        this.errorMessage = '';
        return forkJoin({
          artist: this.spotifyService.getArtist(this.artistId),
          topTracks: this.spotifyService.getTopTracksForArtist(this.artistId),
          albums: this.spotifyService.getAlbumsForArtist(this.artistId)
        }).pipe(
          catchError(() => {
            this.errorMessage = 'Unable to load artist. Check that the dummy webserver is running.';
            return EMPTY;
          })
        );
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((data) => {
      this.artist = data.artist;
      this.topTracks = data.topTracks;
      this.albums = data.albums;
    });
  }

}