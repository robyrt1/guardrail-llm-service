import { Module } from '@nestjs/common';
import { GuardrailModule } from './guardrail/guardrail.module.js';
import { LlmModule } from './llm/llm.module.js';
import { ChatModule } from './chat/chat.module.js';
@Module({
  imports: [GuardrailModule, LlmModule, ChatModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
