// @ts-nocheck
/**
 * AI Adapter - 提供统一的AI生成接口
 * 作为 llmProviderManager 的适配层，保持向后兼容
 */

import { llmProviderManager } from './llmProviders';
import { getUserDefaultModel, IMAGE_MODELS } from './modelConfig';

export interface GenerateImageOptions {
    count?: number;
    aspectRatio?: string;
    style?: string;
}

/**
 * 检查模型是否支持图片生成
 * @param modelId 模型 ID
 * @returns 是否支持图片生成
 */
const isImageModel = (modelId: string): boolean => {
    // 首先检查是否在 IMAGE_MODELS 列表中
    if (IMAGE_MODELS.some(m => m.id === modelId)) {
        return true;
    }

    // 检查模型 ID 或名称是否包含常见的图片生成关键词
    const lowerModelId = modelId.toLowerCase();
    const imageKeywords = [
        'dall-e', 'stable-diffusion', 'sdxl', 'flux', 'seedream', 'image', 
        'midjourney', 't2i', 'text-to-image', 'imagina'
    ];
    
    return imageKeywords.some(keyword => lowerModelId.includes(keyword));
};

/**
 * 使用当前提供商生成图片
 * @param prompt 图片生成提示词
 * @param model 模型名称（可选）
 * @param referenceImages 参考图片数组（可选）
 * @param options 生成选项（可选）
 * @returns 图片URL数组
 */
export const generateImageWithProvider = async (
    prompt: string,
    model?: string,
    referenceImages?: string[],
    options?: GenerateImageOptions
): Promise<string[]> => {
    let effectiveModel = model || getUserDefaultModel('image');

    // 验证模型是否支持图片生成，如果不支持，使用默认的图片模型
    if (!isImageModel(effectiveModel)) {
        console.warn(`[aiAdapter] Model "${effectiveModel}" is not an image generation model. Falling back to default image model.`);
        effectiveModel = getUserDefaultModel('image');
    }

    // 如果设置了 aspectRatio，特别提示
    if (options?.aspectRatio) {
    }

    try {
        const imageUrls = await llmProviderManager.generateImages(
            prompt,
            effectiveModel,
            referenceImages,
            options
        );


        return imageUrls;
    } catch (error) {
        console.error('[aiAdapter] Image generation failed:', error);
        throw error;
    }
};

/**
 * 获取当前图片生成提供商名称
 */
export const getCurrentImageProvider = (): string => {
    return llmProviderManager.getCurrentProvider().getName();
};

/**
 * 检查当前提供商是否支持图片生成
 */
export const isImageGenerationSupported = (): boolean => {
    const provider = llmProviderManager.getCurrentProvider();
    return provider.getType() === 'gemini' || provider.getType() === 'yunwu';
};
