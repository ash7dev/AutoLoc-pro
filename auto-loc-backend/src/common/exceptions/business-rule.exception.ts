import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Exception métier 422 — règle business violée.
 * Utilisée par le StateMachine, les policies, etc.
 */
export class BusinessRuleException extends HttpException {
    readonly code?: string;

    constructor(message: string, code?: string) {
        super(
            {
                statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
                error: 'Business Rule Violation',
                message,
                ...(code ? { code } : {}),
            },
            HttpStatus.UNPROCESSABLE_ENTITY,
        );
        this.code = code;
    }
}
