export type AIProvider = {
  generateStructuredOutput<T>(input: { system: string; user: string; schema: Record<string, unknown> }): Promise<T>;
  generateEmbedding(input: string): Promise<number[]>;
};

export type AIProviderName = 'gemini' | 'groq' | 'cerebras' | 'openrouter';

const jsonHeaders = { 'content-type': 'application/json' };
const FREE_PROVIDERS: AIProviderName[] = ['gemini', 'groq', 'cerebras', 'openrouter'];
const cooldowns = new Map<AIProviderName, number>();

const keyFor = (name: AIProviderName) => ({
  gemini: process.env.GEMINI_API_KEY,
  groq: process.env.GROQ_API_KEY,
  cerebras: process.env.CEREBRAS_API_KEY,
  openrouter: process.env.OPENROUTER_API_KEY,
}[name]);

const modelFor = (name: AIProviderName) => ({
  gemini: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
  groq: process.env.GROQ_MODEL || 'openai/gpt-oss-20b',
  cerebras: process.env.CEREBRAS_MODEL || 'gpt-oss-120b',
  openrouter: process.env.OPENROUTER_MODEL || 'openrouter/free',
}[name]);

function isAvailable(name: AIProviderName) {
  return Date.now() >= (cooldowns.get(name) || 0);
}

function markCooldown(name: AIProviderName, ms = 60_000) {
  cooldowns.set(name, Date.now() + ms);
}

function orderedProviders() {
  const configured = FREE_PROVIDERS.filter(name => Boolean(keyFor(name)));
  const preferred = (process.env.AI_FREE_PROVIDER_ORDER || '').split(',').map(x => x.trim()).filter(Boolean) as AIProviderName[];
  const order = [...preferred, ...configured].filter((name, index, list) => configured.includes(name) && list.indexOf(name) === index);
  return [...order.filter(isAvailable), ...order.filter(name => !isAvailable(name))];
}

class MultiModelGateway {
  private async request(name: AIProviderName, system: string, user: string, schema: Record<string, unknown>) {
    const key = keyFor(name);
    if (!key) throw new Error(`${name}:missing_key`);
    const model = modelFor(name);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8_000);
    try {
      let url: string;
      let body: unknown;
      const headers: Record<string, string> = { ...jsonHeaders };

      if (name === 'gemini') {
        url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
        body = {
          systemInstruction: { parts: [{ text: system }] },
          contents: [{ parts: [{ text: user }] }],
          generationConfig: { temperature: 0, responseMimeType: 'application/json', responseSchema: schema },
        };
      } else {
        url = name === 'groq' ? 'https://api.groq.com/openai/v1/chat/completions' : name === 'cerebras' ? 'https://api.cerebras.ai/v1/chat/completions' : 'https://openrouter.ai/api/v1/chat/completions';
        headers.authorization = `Bearer ${key}`;
        body = {
          model,
          temperature: 0,
          messages: [{ role: 'system', content: system }, { role: 'user', content: user }],
          response_format: { type: 'json_object' },
        };
      }

      const response = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body), signal: controller.signal, cache: 'no-store' });
      if (!response.ok) {
        if (response.status === 429 || response.status >= 500) markCooldown(name);
        throw new Error(`${name}:http_${response.status}`);
      }
      const data = await response.json() as Record<string, any>;
      const content = name === 'gemini' ? data.candidates?.[0]?.content?.parts?.[0]?.text : data.choices?.[0]?.message?.content;
      if (!content) throw new Error(`${name}:empty_response`);
      return JSON.parse(content) as unknown;
    } finally {
      clearTimeout(timer);
    }
  }

  async generateStructuredOutput<T>({ system, user, schema }: { system: string; user: string; schema: Record<string, unknown> }) {
    const errors: string[] = [];
    for (const name of orderedProviders()) {
      try {
        const result = await this.request(name, system, user, schema);
        return result as T;
      } catch (error) {
        errors.push(error instanceof Error ? error.message : `${name}:failed`);
      }
    }
    throw new Error(`All AI providers failed: ${errors.join(', ')}`);
  }
}

class LegacyOpenAIProvider implements AIProvider {
  private key = process.env.AI_PROVIDER_API_KEY!;
  private base = (process.env.AI_PROVIDER_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, '');
  private model = process.env.AI_PROVIDER_MODEL || 'gpt-5-mini';
  private embeddingModel = process.env.EMBEDDING_MODEL || 'text-embedding-3-small';

  private async request(path: string, body: unknown) {
    const response = await fetch(`${this.base}${path}`, { method: 'POST', headers: { ...jsonHeaders, authorization: `Bearer ${this.key}` }, body: JSON.stringify(body), cache: 'no-store' });
    if (!response.ok) throw new Error(`AI provider request failed: ${response.status}`);
    return response.json() as Promise<Record<string, any>>;
  }

  async generateStructuredOutput<T>({ system, user, schema }: { system: string; user: string; schema: Record<string, unknown> }) {
    const data = await this.request('/chat/completions', { model: this.model, temperature: 0, messages: [{ role: 'system', content: system }, { role: 'user', content: user }], response_format: { type: 'json_schema', json_schema: { name: 'finder_intent', strict: true, schema } } });
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error('AI provider returned no structured output');
    return JSON.parse(content) as T;
  }

  async generateEmbedding(input: string) {
    const data = await this.request('/embeddings', { model: this.embeddingModel, input, dimensions: 1536 });
    const embedding = data.data?.[0]?.embedding;
    if (!Array.isArray(embedding) || embedding.length !== 1536) throw new Error('Embedding dimension mismatch: expected 1536');
    return embedding as number[];
  }
}

export function getAIProvider(): AIProvider | null {
  if (process.env.AI_PROVIDER_API_KEY) return new LegacyOpenAIProvider();
  return null;
}

export function getAIDecisionGateway(): AIProvider | null {
  if (!FREE_PROVIDERS.some(name => keyFor(name))) return null;
  return new MultiModelGateway();
}

export function getAIProviderStatus() {
  return orderedProviders().map(name => ({ name, model: modelFor(name), configured: Boolean(keyFor(name)), available: isAvailable(name) }));
}
