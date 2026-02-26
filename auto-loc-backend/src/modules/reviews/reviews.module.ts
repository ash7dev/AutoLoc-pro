import { Module, forwardRef } from '@nestjs/common';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { CreateReviewUseCase } from '../../domain/review/create-review.use-case';
import { QueueModule } from '../../infrastructure/queue/queue.module';

@Module({
    imports: [forwardRef(() => QueueModule)],
    controllers: [ReviewsController],
    providers: [
        ReviewsService,
        CreateReviewUseCase,
    ],
    exports: [CreateReviewUseCase],
})
export class ReviewsModule { }
