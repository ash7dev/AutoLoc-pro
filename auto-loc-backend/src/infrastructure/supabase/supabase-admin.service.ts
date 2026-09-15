import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

/** Client serveur exclusivement destiné aux opérations d'identité sensibles. */
@Injectable()
export class SupabaseAdminService {
  private readonly client: SupabaseClient | null;

  constructor(config: ConfigService) {
    const projectId = config.get<string>('SUPABASE_PROJECT_ID')?.trim();
    const serviceRoleKey = config.get<string>('SUPABASE_SERVICE_ROLE_KEY')?.trim();
    this.client = projectId && serviceRoleKey
      ? createClient(`https://${projectId}.supabase.co`, serviceRoleKey, {
          auth: { autoRefreshToken: false, persistSession: false },
        })
      : null;
  }

  get auth(): SupabaseClient['auth'] {
    if (!this.client) {
      throw new ServiceUnavailableException(
        'La gestion des identifiants n’est pas encore configurée. Contactez le support AutoLoc.',
      );
    }
    return this.client.auth;
  }
}
