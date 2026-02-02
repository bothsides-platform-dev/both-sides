import { CompleteInput, GenerateInput, GenerateOutput, SummarizeInput, SummarizeOutput } from "./schemas";

export type CallOpts = {
  timeoutMs: number;
};

export interface LlmProvider {
  summarize(input: SummarizeInput, opts: CallOpts): Promise<SummarizeOutput>;
  generate(input: GenerateInput, opts: CallOpts): Promise<GenerateOutput>;
  complete(input: CompleteInput, opts: CallOpts): Promise<GenerateOutput>;
}
