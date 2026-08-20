import { NextResponse } from 'next/server';
import { getAIDecisionGateway, getAIProviderStatus } from '@/lib/services/ai/provider';

export const dynamic = 'force-dynamic';

const healthSchema = {
  type: 'object',
  additionalProperties: false,
  properties: { ok: { type: 'boolean' } },
  required: ['ok'],
};

export async function GET() {
  const providers = getAIProviderStatus();
  const gateway = getAIDecisionGateway();
  if (!gateway) return NextResponse.json({ ai: false, status: 'not_configured', providers });

  try {
    const result = await gateway.generateStructuredOutputWithMeta<{ ok: boolean }>({
      system: 'Return only the requested JSON object.',
      user: 'Reply with {"ok":true}.',
      schema: healthSchema,
    });
    return NextResponse.json({ ai: true, status: 'ok', provider: result.provider, model: result.model, providers });
  } catch (error) {
    return NextResponse.json({ ai: false, status: 'failed', error: error instanceof Error ? error.message.slice(0, 500) : 'AI request failed', providers }, { status: 503 });
  }
}
