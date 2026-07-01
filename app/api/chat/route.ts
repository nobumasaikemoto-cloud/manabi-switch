import { streamText, convertToModelMessages, type UIMessage } from "ai";
import { google } from "@ai-sdk/google";

export async function POST(req: Request) {
  const body = await req.json();
  const {
    messages,
    entryTitle,
    entryBody,
    entryActions,
  }: {
    messages: UIMessage[];
    entryTitle: string;
    entryBody: string;
    entryActions: string[];
  } = body;

  const systemPrompt = `あなたは学習コーチです。ユーザーが以下のメモを振り返っており、そのメモについて「壁打ち」（対話的な思考整理）をサポートしています。

【メモのタイトル】
${entryTitle}

【学び・内容】
${entryBody}

【アクション】
${entryActions.map((a, i) => `${i + 1}. ${a}`).join("\n")}

このメモの内容を踏まえて、ユーザーの質問に答えたり、思考を深める助けをしてください。
- 具体的で実践的なアドバイスを心がけてください
- 必要に応じて問いかけも行ってください
- メモの内容と関連付けた具体例を出してください
- 回答は必ず日本語で、簡潔かつ温かみのある口調で答えてください`;

  const result = streamText({
    model: google("gemini-1.5-flash"),
    system: systemPrompt,
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
