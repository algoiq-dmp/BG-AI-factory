/**
 * @file AI Model Router
 * @description Multi-provider AI model routing layer. Routes requests to DeepSeek or Ollama
 *              based on the selected model. Designed for easy extension to Claude, GPT-4, etc.
 * @module lib/ai/router
 */

import { defaultFailoverChain } from './failover';

/** Supported AI model providers */
export type AIModel = 'deepseek' | 'ollama' | 'claude' | 'gpt4' | 'gemini' | 'kimi';

/** Options for routing an AI request */
export interface RouterOptions {
  /** Target AI model provider */
  model: AIModel;
  /** User prompt / input text */
  prompt: string;
  /** Optional system prompt for context/persona */
  systemPrompt?: string;
  /** Temperature (0.0 = deterministic, 1.0 = creative). Default: 0.2 */
  temperature?: number;
  /** API key — required for DeepSeek/Claude/GPT, optional for Ollama */
  apiKey?: string;
  /** Optional variant of the model (e.g. 'deepseek-coder' instead of 'deepseek-chat') */
  modelVariant?: string;
}

/**
 * Routes AI requests to the appropriate provider.
 * Currently supports DeepSeek (cloud) and Ollama (local).
 *
 * @example
 * ```ts
 * const result = await AIModelRouter.execute({
 *   model: 'deepseek',
 *   prompt: 'Generate a REST API for a todo app',
 *   systemPrompt: 'You are a backend architect.',
 *   apiKey: process.env.DEEPSEEK_API_KEY,
 * });
 * ```
 */
export class AIModelRouter {
  
  /** Execute an AI request via the configured model provider */
  static async execute(options: RouterOptions): Promise<string> {
    const { model, prompt, systemPrompt, temperature = 0.2, apiKey, modelVariant } = options;

    console.log(`[AI Router] Routing request to: ${model} ${modelVariant ? `(${modelVariant})` : ''}`);

    try {
      switch (model) {
        case 'deepseek':
          return await this.callDeepSeek(prompt, systemPrompt, temperature, apiKey, modelVariant);
        case 'ollama':
          return await this.callOllama(prompt, systemPrompt, temperature);
        default:
          throw new Error(`Model ${model} is not yet implemented in the router.`);
      }
    } catch (error: any) {
      console.error(`[AI Router] Error executing ${model}:`, error.message);
      console.log(`[AI Router] Primary model '${model}' failed. Attempting failover chain...`);

      // Failover: attempt the request through the chain (DeepSeek → Ollama)
      const failoverResult = await defaultFailoverChain.execute(async (provider) => {
        return this.callProvider(provider, prompt, systemPrompt, temperature, apiKey);
      });

      if (failoverResult.data) {
        console.log(`[AI Router] Failover succeeded via '${failoverResult.provider}' in ${failoverResult.latencyMs}ms`);
        return failoverResult.data;
      }

      // All providers in the failover chain also failed
      console.error(`[AI Router] Failover chain exhausted: ${failoverResult.error}`);
      throw new Error(failoverResult.error ?? error.message);
    }
  }

  /** Route a call to the appropriate provider method */
  private static async callProvider(model: AIModel, prompt: string, systemPrompt?: string, temperature?: number, apiKey?: string, modelVariant?: string): Promise<string> {
    switch (model) {
      case 'deepseek':
        return this.callDeepSeek(prompt, systemPrompt, temperature, apiKey, modelVariant);
      case 'ollama':
        return this.callOllama(prompt, systemPrompt, temperature);
      case 'gpt4':
        return this.callGPT4(prompt, systemPrompt, temperature, apiKey);
      case 'claude':
        return this.callClaude(prompt, systemPrompt, temperature, apiKey);
      case 'gemini':
        return this.callGemini(prompt, systemPrompt, temperature, apiKey);
      case 'kimi':
        return this.callKimi(prompt, systemPrompt, temperature, apiKey);
      default:
        throw new Error(`Model ${model} is not yet implemented in the router.`);
    }
  }

  private static async callDeepSeek(prompt: string, systemPrompt?: string, temperature?: number, apiKey?: string, modelVariant?: string): Promise<string> {
    if (!apiKey) {
      throw new Error('DeepSeek API Key is missing. Please configure it in Platform Settings.');
    }

    const messages = [];
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }
    messages.push({ role: 'user', content: prompt });

    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: modelVariant || 'deepseek-chat',
        messages,
        temperature
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`DeepSeek API Error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  private static async callOllama(prompt: string, systemPrompt?: string, temperature?: number): Promise<string> {
    // Assuming Ollama is running locally on default port 11434
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama3', // Default local model, can be made configurable
        prompt: systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt,
        stream: false,
        temperature
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama API Error: ${response.status}. Make sure Ollama is running locally.`);
    }

    const data = await response.json();
    return data.response;
  }

  private static async callGPT4(prompt: string, systemPrompt?: string, temperature?: number, apiKey?: string): Promise<string> {
    if (!apiKey) throw new Error('GPT-4 API Key is missing.');
    // Mock implementation for GPT-4 API structure
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []), { role: 'user', content: prompt }],
        temperature
      })
    });
    if (!response.ok) throw new Error(`GPT-4 Error: ${response.status}`);
    const data = await response.json();
    return data.choices[0].message.content;
  }

  private static async callClaude(prompt: string, systemPrompt?: string, temperature?: number, apiKey?: string): Promise<string> {
    if (!apiKey) throw new Error('Claude API Key is missing.');
    // Mock implementation for Anthropic API structure
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20240620',
        system: systemPrompt || undefined,
        messages: [{ role: 'user', content: prompt }],
        temperature,
        max_tokens: 4096
      })
    });
    if (!response.ok) throw new Error(`Claude Error: ${response.status}`);
    const data = await response.json();
    return data.content[0].text;
  }

  private static async callGemini(prompt: string, systemPrompt?: string, temperature?: number, apiKey?: string): Promise<string> {
    if (!apiKey) throw new Error('Gemini API Key is missing.');
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: systemPrompt ? { parts: [{ text: systemPrompt }] } : undefined,
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature }
      })
    });
    if (!response.ok) throw new Error(`Gemini Error: ${response.status}`);
    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  }

  private static async callKimi(prompt: string, systemPrompt?: string, temperature?: number, apiKey?: string): Promise<string> {
    if (!apiKey) throw new Error('Kimi API Key is missing.');
    const response = await fetch('https://api.moonshot.cn/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'moonshot-v1-8k',
        messages: [...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []), { role: 'user', content: prompt }],
        temperature
      })
    });
    if (!response.ok) throw new Error(`Kimi Error: ${response.status}`);
    const data = await response.json();
    return data.choices[0].message.content;
  }
}
