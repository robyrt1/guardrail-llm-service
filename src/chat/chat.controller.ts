import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { LlmService } from '../llm/llm.service.js';
import { ChatPromptDto } from './dto/chat-prompt.dto.js';
import { ToxicityGuard } from '../guardrail/guards/toxicity.guard.js';
import { GuardToxicity } from '../guardrail/decorators/toxicity-field.decorator.js';

@Controller('chat')
export class ChatController {
  constructor(private readonly llmService: LlmService) {}

  @Post()
  @UseGuards(ToxicityGuard)
  @GuardToxicity('prompt')
  async handleMessage(@Body() dto: ChatPromptDto) {
    const startTime = performance.now();
    const response = await this.llmService.generateResponse(dto.prompt);
    const elapsed = (performance.now() - startTime).toFixed(2);

    return {
      response,
      processingTimeMs: Number(elapsed),
    };
  }
}
