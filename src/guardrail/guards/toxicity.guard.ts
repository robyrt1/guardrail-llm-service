import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GuardrailService } from '../guardrail.service.js';
import { TOXICITY_FIELD_KEY } from '../decorators/toxicity-field.decorator.js';

interface RequestWithBody {
  body?: Record<string, unknown>;
}

@Injectable()
export class ToxicityGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly guardrailService: GuardrailService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const targetField =
      this.reflector.get<string>(TOXICITY_FIELD_KEY, context.getHandler()) ||
      this.reflector.get<string>(TOXICITY_FIELD_KEY, context.getClass()) ||
      'prompt';

    const request = context.switchToHttp().getRequest<RequestWithBody>();
    const payload = request.body?.[targetField];

    if (!payload || typeof payload !== 'string') {
      return true;
    }

    const evaluation = await this.guardrailService.evaluate(payload);

    if (evaluation.isToxic) {
      throw new BadRequestException({
        statusCode: 400,
        message: 'Prompt bloqueado por violar diretrizes de moderação.',
        blockedCategories: evaluation.categories,
      });
    }

    return true;
  }
}
