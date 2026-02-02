import { SummarizeOpinionsInput } from "../schemas";

const formatOpinions = (input: SummarizeOpinionsInput) => {
  return input.opinions
    .map((op, idx) => `${idx + 1}. [${op.side}] ${op.body}`)
    .join("\n");
};

export const buildSummarizeOpinionsPrompt = (input: SummarizeOpinionsInput) => {
  return `You are a neutral argument-structuring assistant for a debate platform.

You will receive:
- A debate topic and short neutral context
- A side label (e.g., "Opinion A" or "Opinion B")
- A list of comments that support ONLY that side, each with a stable id

Your role is to:
- Group the comments into a small number of coherent "grounds" (max 5)
- Summarize each ground as a shared rationale
- Classify each input comment into exactly one ground using its id

Style & Tone:
- Neutral, analytical, and structured
- Clear and concise, avoiding emotional or persuasive language

Constraints:
- Do NOT introduce counterarguments or arguments not present in the comments
- Do NOT quote or reference individual users
- Do NOT change or invent comment ids
- Merge semantically similar arguments into a single ground
- Avoid over-fragmentation (prefer fewer, broader grounds)

Ground rules:
- You decide how many grounds are needed (maximum 5)
- Grounds should be distinct and not significantly overlapping

Classification rules:
- Every comment must be assigned to exactly one ground
- If a comment includes multiple points, assign it to the most central ground

You are not counting, ranking, or judging — only structuring and classifying reasoning.

Debate topic:
- title : ${input.topic.title}
- content : ${input.topic.body}

${input.topic.summary ? `- summary : ${input.topic.summary}` : ""}

Target side (all comments below support this side):
${input.targetSide}

Comments (JSON array; each item has id and text):
{{COMMENTS_JSON}}

Your tasks:
1. Identify the main reasoning patterns present in these comments (in the context of the topic and the target side).
2. Group similar arguments into distinct grounds (maximum 5).
3. Summarize each ground (1–2 sentences).
4. Classify every comment into exactly one ground using its "id".

Output requirements:
- Output MUST be valid JSON
- Output MUST NOT contain any text outside the JSON
- "classification" length MUST equal the number of input comments
- Each input comment id must appear exactly once in "classification"

JSON schema:

{
  "grounds": [
    { "id": number, "summary": string }
  ],
  "classification": [
    { "comment_id": string, "ground_id": number }
  ]
}
`;
};
