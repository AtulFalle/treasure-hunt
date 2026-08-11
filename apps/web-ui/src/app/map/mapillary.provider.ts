import { Viewer } from 'mapillary-js';
import { MapProvider, MapStart, PlayerPose } from './map-provider';

export class MapillaryProvider implements MapProvider {
  private viewer: Viewer | null = null;
  private pose: PlayerPose | null = null;

  async init(
    container: HTMLElement,
    start: MapStart,
    accessToken: string,
  ): Promise<void> {
    this.pose = {
      lat: start.lat,
      lng: start.lng,
      imageId: start.imageId,
    };

    this.viewer = new Viewer({
      accessToken,
      container,
      imageId: start.imageId,
      component: {
        cover: false,
        keyboard: false,
      },
    });

    this.viewer.on('image', (event) => {
      const image = event.image;
      const { lat, lng } = image.lngLat;
      this.pose = {
        lat,
        lng,
        imageId: image.id,
      };
      console.debug('[mapillary] pose', this.pose);
    });
  }

  getPose(): PlayerPose | null {
    return this.pose;
  }

  destroy(): void {
    this.viewer?.remove();
    this.viewer = null;
    this.pose = null;
  }
}
