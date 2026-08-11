export interface MapPackStep {
  id: string;
  clueText: string;
  answerLabel: string;
  lat: number;
  lng: number;
  radiusMeters: number;
  imageId?: string;
  /** Mapillary frames where Interact should succeed for this clue. */
  acceptedImageIds?: string[];
}

export interface MapPackStart {
  lat: number;
  lng: number;
  imageId: string;
}

export interface MapPack {
  id: string;
  name: string;
  bbox: {
    south: number;
    west: number;
    north: number;
    east: number;
  };
  start: MapPackStart;
  steps: MapPackStep[];
}

export type GameStatus = 'playing' | 'won';

export interface GameSession {
  sessionId: string;
  mapId: string;
  pack: MapPack;
  activeStepIndex: number;
  status: GameStatus;
}
