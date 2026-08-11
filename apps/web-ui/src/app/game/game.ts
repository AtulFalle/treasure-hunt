import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  OnDestroy,
  afterNextRender,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../environment';
import { MapillaryProvider } from '../map/mapillary.provider';
import { MapProvider } from '../map/map-provider';

interface StartGameResponse {
  sessionId: string;
  mapId: string;
  start: { lat: number; lng: number; imageId: string };
  clueText: string;
  status: 'playing' | 'won';
  stepIndex: number;
  totalSteps: number;
}

interface InteractResponse {
  found: boolean;
  status: 'playing' | 'won';
  message: string;
  answerLabel: string | null;
  clueText: string | null;
  stepIndex: number;
  totalSteps: number;
  distanceMeters?: number;
}

@Component({
  selector: 'app-game',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './game.html',
  styleUrl: './game.scss',
})
export class Game implements OnDestroy {
  private readonly http = inject(HttpClient);
  private readonly injector = inject(Injector);
  private readonly viewerHost =
    viewChild<ElementRef<HTMLElement>>('viewerHost');

  private mapProvider: MapProvider | null = null;
  private sessionId: string | null = null;

  readonly started = signal(false);
  readonly loading = signal(false);
  readonly clueText = signal('');
  readonly statusMessage = signal('');
  readonly won = signal(false);
  readonly stepLabel = signal('');
  readonly tokenMissing = signal(!environment.mapillaryAccessToken);

  async startGame(): Promise<void> {
    if (!environment.mapillaryAccessToken) {
      this.tokenMissing.set(true);
      this.statusMessage.set(
        'Set mapillaryAccessToken in apps/web-ui/src/app/environment.ts',
      );
      return;
    }

    this.loading.set(true);
    this.statusMessage.set('');
    this.won.set(false);

    try {
      const game = await firstValueFrom(
        this.http.post<StartGameResponse>(`${environment.nestApiUrl}/games`, {
          mapId: environment.defaultMapId,
        }),
      );

      this.sessionId = game.sessionId;
      this.clueText.set(game.clueText);
      this.stepLabel.set(`Puzzle ${game.stepIndex + 1} / ${game.totalSteps}`);
      this.started.set(true);

      afterNextRender(
        () => {
          void this.mountViewer(game);
        },
        { injector: this.injector },
      );
    } catch (err) {
      console.error(err);
      this.statusMessage.set(
        'Failed to start game — is nest-api and py-geo running?',
      );
      this.started.set(false);
      this.loading.set(false);
    }
  }

  private async mountViewer(game: StartGameResponse): Promise<void> {
    try {
      const host = this.viewerHost()?.nativeElement;
      if (!host) {
        this.statusMessage.set('Viewer container missing');
        return;
      }

      this.mapProvider?.destroy();
      this.mapProvider = new MapillaryProvider();
      await this.mapProvider.init(
        host,
        game.start,
        environment.mapillaryAccessToken,
      );
    } catch (err) {
      console.error(err);
      this.statusMessage.set('Failed to load street view');
    } finally {
      this.loading.set(false);
    }
  }

  async interact(): Promise<void> {
    if (!this.sessionId || this.won()) {
      return;
    }

    const pose = this.mapProvider?.getPose();
    if (!pose) {
      this.statusMessage.set('No position yet — wait for the map to load');
      return;
    }

    this.loading.set(true);
    try {
      const result = await firstValueFrom(
        this.http.post<InteractResponse>(
          `${environment.nestApiUrl}/games/${this.sessionId}/interact`,
          {
            lat: pose.lat,
            lng: pose.lng,
            imageId: pose.imageId,
          },
        ),
      );

      if (result.found) {
        this.statusMessage.set(result.message);
      } else {
        const dist =
          result.distanceMeters != null
            ? ` (~${result.distanceMeters}m away)`
            : '';
        this.statusMessage.set(`${result.message}${dist}`);
      }

      if (result.status === 'won') {
        this.won.set(true);
        this.clueText.set('Treasure found!');
        this.stepLabel.set('Complete');
        return;
      }

      if (result.found && result.clueText) {
        this.clueText.set(result.clueText);
        this.stepLabel.set(
          `Puzzle ${result.stepIndex + 1} / ${result.totalSteps}`,
        );
      }
    } catch (err) {
      console.error(err);
      this.statusMessage.set('Interact failed');
    } finally {
      this.loading.set(false);
    }
  }

  ngOnDestroy(): void {
    this.mapProvider?.destroy();
  }
}
