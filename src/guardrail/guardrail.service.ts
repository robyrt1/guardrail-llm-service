import { Injectable, OnModuleInit } from '@nestjs/common';
import * as toxicity from '@tensorflow-models/toxicity';

export interface ToxicityVerdict {
  isToxic: boolean;
  categories: string[];
}

@Injectable()
export class GuardrailService implements OnModuleInit {
  private model!: toxicity.ToxicityClassifier;
  private readonly threshold = 0.8;

  async onModuleInit(): Promise<void> {
    this.model = await toxicity.load(this.threshold, []);
  }

  async evaluate(text: string): Promise<ToxicityVerdict> {
    const predictions = await this.model.classify([text]);
    const categories: string[] = [];

    for (const prediction of predictions) {
      if (prediction.results[0]?.match === true) {
        categories.push(prediction.label);
      }
    }

    return {
      isToxic: categories.length > 0,
      categories,
    };
  }
}
