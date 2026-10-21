import { SetMetadata } from '@nestjs/common';

export const TOXICITY_FIELD_KEY = 'toxicity_target_field';

export const GuardToxicity = (
  fieldName: string = 'prompt',
): MethodDecorator & ClassDecorator =>
  SetMetadata(TOXICITY_FIELD_KEY, fieldName);
