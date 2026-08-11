export interface LatLng {
  lat: number;
  lng: number;
}

export interface MapStart {
  lat: number;
  lng: number;
  imageId: string;
}

export interface PlayerPose extends LatLng {
  imageId: string | null;
}

export interface MapProvider {
  init(container: HTMLElement, start: MapStart, accessToken: string): Promise<void>;
  getPose(): PlayerPose | null;
  destroy(): void;
}
