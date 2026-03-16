import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

/**
 * Guard protégeant les endpoints internes (simulation webhook, jobs admin, etc.).
 *
 * Valide le header `X-Internal-Key` contre la variable d'environnement
 * `INTERNAL_API_KEY`. En production, cet endpoint sera remplacé par un
 * vrai webhook Wave/Orange Money avec validation de signature HMAC.
 *
 * Usage :
 *   @UseGuards(InternalKeyGuard)
 *   @Patch(':id/confirm-payment')
 */
@Injectable()
export class InternalKeyGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest<Request>();
        const provided = request.headers['x-internal-key'];
        const expected = process.env.INTERNAL_API_KEY;

        if (!expected) {
            throw new UnauthorizedException(
                'INTERNAL_API_KEY non configurée — endpoint désactivé',
            );
        }

        if (!provided || provided !== expected) {
            throw new UnauthorizedException('Clé interne invalide ou absente');
        }

        return true;
    }
}
