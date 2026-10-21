import { Injectable } from '@nestjs/common';
import { ChatOllama } from '@langchain/ollama';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { Runnable, RunnableSequence } from '@langchain/core/runnables';

@Injectable()
export class LlmService {
  private chain: Runnable<{ input: string }, string>;

  constructor() {
    const model = new ChatOllama({
      model: 'qwen2.5:7b',
      baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
      temperature: 0.2,
    });

    const promptTemplate = ChatPromptTemplate.fromMessages([
      ['system', 'Você é um assistente técnico direto e conciso.'],
      ['human', '{input}'],
    ]);

    this.chain = RunnableSequence.from([
      promptTemplate,
      model,
      new StringOutputParser(),
    ]);
  }

  async generateResponse(input: string): Promise<string> {
    return this.chain.invoke({ input });
  }
}
