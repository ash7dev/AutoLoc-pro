import { Controller, Get, Param } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('hosts')
export class HostsController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * GET /hosts/:id
   * Profil public d'un hôte/propriétaire pour les locataires.
   * Retourne la carte d'identité de l'hôte, ses cartes d'annonces (flotte vérifiée) et ses avis publics.
   */
  @Get(':id')
  async getHostPublicProfile(@Param('id') id: string) {
    return this.usersService.getHostPublicProfile(id);
  }
}
