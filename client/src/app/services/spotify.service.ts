import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { ArtistData } from '../data/artist-data';
import { AlbumData } from '../data/album-data';
import { TrackData } from '../data/track-data';
import { ResourceData } from '../data/resource-data';
import { ProfileData } from '../data/profile-data';

@Injectable({
  providedIn: 'root'
})
export class SpotifyService {
	expressBaseUrl:string = 'http://127.0.0.1:8888';

  constructor(private http:HttpClient) { }

  private sendRequestToExpress(endpoint:string):Promise<any> {
    //use the injected http Service to make a get request to the Express endpoint and return the response.
    //Specifically, update the URI according to the base URL for express and the endpoint.
    const uri = this.expressBaseUrl + endpoint;

    //firstValueFrom generates a Promise for whatever is returned first from the GET request.
    //You shouldn't need to update this part.
    //Keep HTTP errors rejected so callers can display a failure message.
    return firstValueFrom(this.http.get(uri));
  }

  aboutMe():Promise<ProfileData> {
    //This line is sending a request to express, which returns a promise with some data. We're then parsing the data 
    return this.sendRequestToExpress('/me').then((data) => {
      return new ProfileData(data);
    });
  }

  searchFor(category:string, resource:string):Promise<ResourceData[]> {
    //identify the search endpoint in the express webserver (routes/index.js) and send the request to express.
    //Make sure you're encoding the resource with encodeURIComponent().
    //Depending on the category (artist, track, album), return an array of that type of data.
    //JavaScript's "map" function might be useful for this, but there are other ways of building the array.
    return this.sendRequestToExpress('/search/' + encodeURIComponent(category) + '/' + encodeURIComponent(resource))
      .then((data) => {
        switch (category) {
          case 'artist':
            return data.artists.items.map((artist) => new ArtistData(artist));
          case 'album':
            return data.albums.items.map((album) => new AlbumData(album));
          case 'track':
            return data.tracks.items.map((track) => new TrackData(track));
          default:
            return [];
        }
      });
  }

  getArtist(artistId:string):Promise<ArtistData> {
    //use the artist endpoint to make a request to express.
    //Again, you may need to encode the artistId.
    return this.sendRequestToExpress('/artist/' + encodeURIComponent(artistId))
      .then((data) => new ArtistData(data));
  }

  getTopTracksForArtist(artistId:string):Promise<TrackData[]> {
    //use the top tracks endpoint to make a request to express.
    return this.sendRequestToExpress('/artist-top-tracks/' + encodeURIComponent(artistId))
      .then((data) => data.tracks.map((track) => new TrackData(track)));
  }

  getAlbumsForArtist(artistId:string):Promise<AlbumData[]> {
    //use the albums for an artist endpoint to make a request to express.
    return this.sendRequestToExpress('/artist-albums/' + encodeURIComponent(artistId))
      .then((data) => data.items.map((album) => new AlbumData(album)));
  }

  getAlbum(albumId:string):Promise<AlbumData> {
    //use the album endpoint to make a request to express.
    return this.sendRequestToExpress('/album/' + encodeURIComponent(albumId))
      .then((data) => new AlbumData(data));
  }

  getTracksForAlbum(albumId:string):Promise<TrackData[]> {
    //use the tracks for album endpoint to make a request to express.
    return this.sendRequestToExpress('/album-tracks/' + encodeURIComponent(albumId))
      .then((data) => data.items.map((track) => new TrackData(track)));
  }

  getTrack(trackId:string):Promise<TrackData> {
    //use the track endpoint to make a request to express.
    return this.sendRequestToExpress('/track/' + encodeURIComponent(trackId))
      .then((data) => new TrackData(data));
  }
}
