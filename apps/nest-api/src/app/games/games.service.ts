import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import axios from 'axios';
import { haversineMeters } from './geo.util';
import { GameSession, MapPack, MapPackStep } from './games.types';

@Injectable()
export class GamesService {
  private readonly logger = new Logger(GamesService.name);
  private readonly sessions = new Map<string, GameSession>();

  private get pyGeoUrl(): string {
    return process.env.PY_GEO_URL ?? 'http://localhost:8000';
  }

  async startGame(mapId = 'catalina-poc') {
    const pack = await this.fetchMapPack(mapId);
    const sessionId = randomUUID();
    const session: GameSession = {
      sessionId,
      mapId,
      pack,
      activeStepIndex: 0,
      status: 'playing',
    };
    this.sessions.set(sessionId, session);

    const step = pack.steps[0];
    this.logger.log(
      `Started ${sessionId} map=${mapId} firstClue=${step.id} answer@${step.lat},${step.lng}`,
    );

    return {
      sessionId,
      mapId,
      start: pack.start,
      clueText: step.clueText,
      status: session.status,
      stepIndex: 0,
      totalSteps: pack.steps.length,
    };
  }

  interact(
    sessionId: string,
    lat: number,
    lng: number,
    imageId?: string | null,
  ) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new NotFoundException(`Game session '${sessionId}' not found`);
    }

    if (session.status === 'won') {
      return {
        found: true,
        status: session.status,
        message: 'you win',
        answerLabel: null,
        clueText: null,
        stepIndex: session.activeStepIndex,
        totalSteps: session.pack.steps.length,
        distanceMeters: 0,
      };
    }

    const step = session.pack.steps[session.activeStepIndex];
    const distance = haversineMeters(lat, lng, step.lat, step.lng);
    const byImage = this.matchesImage(step, imageId);
    const byDistance = distance <= step.radiusMeters;
    const found = byImage || byDistance;

    this.logger.log(
      `Interact session=${sessionId} step=${step.id} ` +
        `player=(${lat},${lng}) imageId=${imageId ?? 'none'} ` +
        `target=(${step.lat},${step.lng}) distance=${distance.toFixed(1)}m ` +
        `radius=${step.radiusMeters}m byImage=${byImage} byDistance=${byDistance} found=${found}`,
    );

    if (!found) {
      return {
        found: false,
        status: session.status,
        message: 'nothing found',
        answerLabel: null,
        clueText: step.clueText,
        stepIndex: session.activeStepIndex,
        totalSteps: session.pack.steps.length,
        distanceMeters: Math.round(distance),
      };
    }

    const isLast = session.activeStepIndex >= session.pack.steps.length - 1;
    if (isLast) {
      session.status = 'won';
      return {
        found: true,
        status: session.status,
        message: `I found it! ${step.answerLabel}`,
        answerLabel: step.answerLabel,
        clueText: null,
        stepIndex: session.activeStepIndex,
        totalSteps: session.pack.steps.length,
        distanceMeters: Math.round(distance),
      };
    }

    session.activeStepIndex += 1;
    const next = session.pack.steps[session.activeStepIndex];
    return {
      found: true,
      status: session.status,
      message: `I found it! ${step.answerLabel}`,
      answerLabel: step.answerLabel,
      clueText: next.clueText,
      stepIndex: session.activeStepIndex,
      totalSteps: session.pack.steps.length,
      distanceMeters: Math.round(distance),
    };
  }

  private matchesImage(step: MapPackStep, imageId?: string | null): boolean {
    if (!imageId) {
      return false;
    }
    if (step.imageId && step.imageId === imageId) {
      return true;
    }
    return (step.acceptedImageIds ?? []).includes(imageId);
  }

  private async fetchMapPack(mapId: string): Promise<MapPack> {
    const url = `${this.pyGeoUrl}/map-packs/${mapId}`;
    try {
      const { data } = await axios.get<MapPack>(url, { timeout: 5000 });
      return data;
    } catch (err) {
      this.logger.error(`Failed to fetch map pack from ${url}`);
      throw err;
    }
  }
}
