import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller.js';
import { GuardrailModule } from '../guardrail/guardrail.module.js';
import { LlmModule } from '../llm/llm.module.js';

@Module({
  imports: [GuardrailModule, LlmModule],
  controllers: [ChatController],
})
export class ChatModule {}
