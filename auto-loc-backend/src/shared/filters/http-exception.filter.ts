import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const status =
            exception instanceof HttpException
                ? exception.getStatus()
                : HttpStatus.INTERNAL_SERVER_ERROR;

        let message = 'Une erreur interne est survenue';
        let error = 'Internal Server Error';

        if (exception instanceof HttpException) {
            const res = exception.getResponse() as any;
            message = res.message || exception.message;
            error = res.error || 'Error';
        } else {
            console.error('[AllExceptionsFilter] Unhandled exception:', exception);
        }

        // ── Traduction Professionnelle ───────────────────────────────────────
        const translations: Record<number, { error: string; message?: string }> = {
            [HttpStatus.BAD_REQUEST]: {
                error: 'Requête Invalide',
                message: 'Les données transmises sont incorrectes ou incomplètes.',
            },
            [HttpStatus.UNAUTHORIZED]: {
                error: 'Non Authentifié',
                message: 'Votre session a expiré ou vous n\'êtes pas connecté.',
            },
            [HttpStatus.FORBIDDEN]: {
                error: 'Accès Refusé',
                message: 'Vous n\'avez pas les permissions nécessaires pour cette action.',
            },
            [HttpStatus.NOT_FOUND]: {
                error: 'Ressource Introuvable',
                message: 'La ressource demandée n\'existe pas ou a été déplacée.',
            },
            [HttpStatus.UNPROCESSABLE_ENTITY]: {
                error: 'Règle Métier',
                message: 'L\'action ne peut pas être effectuée (conflit de données).',
            },
            [HttpStatus.TOO_MANY_REQUESTS]: {
                error: 'Limite Atteinte',
                message: 'Trop de tentatives. Veuillez patienter quelques instants.',
            },
            [HttpStatus.INTERNAL_SERVER_ERROR]: {
                error: 'Erreur Technique',
                message: 'Une erreur imprévue est survenue sur nos serveurs.',
            },
        };

        const translation = translations[status];

        response.status(status).json({
            statusCode: status,
            error: translation?.error || error,
            message: message === exception ? (translation?.message || message) : message,
            timestamp: new Date().toISOString(),
        });
    }
}
