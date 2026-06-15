// @ts-nocheck
/**
 * OpenRouter API 提供商实现
 * 使用 OpenAI 兼容格式
 * 参考: https://openrouter.ai/docs
 */

import { LLMProvider, GenerateImageOptions, GenerateContentOptions } from './baseProvider';
import { LLMProviderType } from '../../types';
import { logAPICall } from '../apiLogger';

export class OpenRouterProvider implements LLMProvider {
  getType(): LLMProviderType {
    return 'openrouter';
  }

  getName(): string {
    return 'OpenRouter API';
  }

  /**
   * 获取 API Key
   */
  private getApiKey(): string | null {
    const userApiKey = localStorage.getItem('OPENROUTER_API_KEY');
    if (userApiKey && userApiKey.trim()) {
      return userApiKey.trim();
    }
    // 兼容旧的 CUSTOM_API_KEY
    const fallbackApiKey = localStorage.getItem('CUSTOM_API_KEY');
    if (fallbackApiKey && fallbackApiKey.trim()) {
      return fallbackApiKey.trim();
    }
    return null;
  }

  /**
   * 获取客户端实例
   * OpenRouter 使用 REST API，不需要客户端
   */
  getClient(): any {
    return null;
  }

  /**
   * 重置客户端
   */
  resetClient(): void {
    // No client to reset
  }

  /**
   * 生成文本内容
   */
  async generateContent(
    prompt: string,
    model: string,
    options?: GenerateContentOptions
  ): Promise<string> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error('OPENROUTER_API_KEY_NOT_CONFIGURED');
    }

    const url = '/api/aiyou/openrouter/chat/completions';

    const requestBody: any = {
      model,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    };

    if (options?.systemInstruction) {
      requestBody.messages.unshift({
        role: 'system',
        content: options.systemInstruction
      });
    }

    return logAPICall(
      'openrouterGenerateContent',
      async () => {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': apiKey
          },
          body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error?.message || error.message || 'OpenRouter 内容生成失败');
        }

        const data = await response.json();
        return data.choices?.[0]?.message?.content || '';
      },
      {
        model,
        prompt: prompt.substring(0, 200) + (prompt.length > 200 ? '...' : '')
      },
      { platform: 'OpenRouter', logType: 'submission' }
    );
  }

  /**
   * 生成图片（支持 Seedream 4.5 等图像模型）
   */
  async generateImages(
    prompt: string,
    model: string,
    referenceImages?: string[],
    options?: GenerateImageOptions
  ): Promise<string[]> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error('OPENROUTER_API_KEY_NOT_CONFIGURED');
    }

    const url = '/api/aiyou/openrouter/images/generations';

    const requestBody: any = {
      model,
      prompt,
      n: options?.count || 1
    };

    // 添加宽高比配置
    if (options?.aspectRatio) {
      requestBody.aspect_ratio = options.aspectRatio;
    }

    if (options?.resolution) {
      requestBody.size = options.resolution;
    }

    return logAPICall(
      'openrouterGenerateImages',
      async () => {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': apiKey
          },
          body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error?.message || error.message || 'OpenRouter 图片生成失败');
        }

        const data = await response.json();
        const images: string[] = [];

        // 提取图片 URL 或 base64
        if (data.data && Array.isArray(data.data)) {
          for (const item of data.data) {
            if (item.url) {
              images.push(item.url);
            } else if (item.b64_json) {
              images.push(`data:image/png;base64,${item.b64_json}`);
            }
          }
        }

        if (images.length === 0) {
          throw new Error('No images generated');
        }

        return images;
      },
      {
        model,
        prompt: prompt.substring(0, 200) + (prompt.length > 200 ? '...' : ''),
        generationConfig: {
          aspectRatio: options?.aspectRatio,
          resolution: options?.resolution,
          count: options?.count
        }
      },
      { platform: 'OpenRouter', logType: 'submission' }
    );
  }

  /**
   * 验证 API Key
   */
  async validateApiKey(apiKey: string): Promise<boolean> {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/auth/key', {
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      });
      return response.ok;
    } catch (error) {
      console.error('Failed to validate OpenRouter API key:', error);
      return false;
    }
  }
}
