import { Module } from '@nestjs/common';
import { ToxicityGuard } from './guards/toxicity.guard.js';
import { GuardrailService } from './guardrail.service.js';

@Module({
  providers: [GuardrailService, ToxicityGuard],
  exports: [GuardrailService, ToxicityGuard],
})
export class GuardrailModule {}
