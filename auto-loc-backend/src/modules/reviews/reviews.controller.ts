import {
    Controller,
    Post,
    Get,
    Body,
    Param,
    Req,
    HttpCode,
    HttpStatus,
    ParseUUIDPipe,
    UseGuards,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { RequestUser } from '../../common/types/auth.types';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';

@Controller('reviews')
@UseGuards(JwtAuthGuard)
export class ReviewsController {
    constructor(private readonly reviewsService: ReviewsService) { }

    /**
     * POST /reviews
     * Créer un avis après checkout (réservation TERMINEE).
     */
    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(
        @Req() req: Request & { user?: RequestUser },
        @Body() dto: CreateReviewDto,
    ) {
        const user = req.user!;
        return this.reviewsService.create(user, dto);
    }

    /**
     * GET /reviews/user/:id
     * Avis reçus par un utilisateur (public).
     */
    @Get('user/:id')
    @HttpCode(HttpStatus.OK)
    async getByUser(@Param('id', ParseUUIDPipe) userId: string) {
        return this.reviewsService.getByUser(userId);
    }
}
