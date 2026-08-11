import { Body, Controller, Param, Post } from '@nestjs/common';
import { GamesService } from './games.service';

@Controller('games')
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @Post()
  start(@Body() body: { mapId?: string }) {
    return this.gamesService.startGame(body?.mapId ?? 'catalina-poc');
  }

  @Post(':id/interact')
  interact(
    @Param('id') id: string,
    @Body() body: { lat: number; lng: number; imageId?: string | null },
  ) {
    return this.gamesService.interact(id, body.lat, body.lng, body.imageId);
  }
}
