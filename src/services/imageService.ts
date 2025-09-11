import OpenAI from 'openai';
import { OPENAI_CONFIG } from '@/config/openai';

const openai = new OpenAI({
  apiKey: OPENAI_CONFIG.apiKey,
  dangerouslyAllowBrowser: true,
});

export interface ImageGenerationRequest {
  prompt: string;
  style?: 'realistic' | 'illustration' | 'minimalist' | 'vibrant';
  aspectRatio?: '1:1' | '16:9' | '9:16';
  quality?: 'standard' | 'hd';
}

export interface ImageGenerationResponse {
  id: string;
  url: string;
  prompt: string;
  style: string;
  createdAt: Date;
}

export interface CarouselImageGeneration {
  slideNumber: number;
  description: string;
  imageUrl?: string;
  imagePrompt: string;
  status: 'pending' | 'generating' | 'completed' | 'failed';
}

export class ImageService {
  // Gerar uma única imagem
  static async generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    try {
      const enhancedPrompt = this.enhancePrompt(request.prompt, request.style);
      
      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: enhancedPrompt,
        n: 1,
        size: this.getImageSize(request.aspectRatio),
        quality: request.quality || 'standard',
        style: request.style === 'realistic' ? 'natural' : 'vivid',
      });

      const imageUrl = response.data?.[0]?.url;
      if (!imageUrl) {
        throw new Error('Falha ao gerar imagem');
      }

      return {
        id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        url: imageUrl,
        prompt: request.prompt,
        style: request.style || 'realistic',
        createdAt: new Date(),
      };
    } catch (error) {
      console.error('Erro ao gerar imagem:', error);
      throw new Error('Falha ao gerar imagem. Tente novamente.');
    }
  }

  // Gerar imagens para carrossel
  static async generateCarouselImages(
    slides: Array<{ text: string; description: string }>,
    style: 'realistic' | 'illustration' | 'minimalist' | 'vibrant' = 'vibrant'
  ): Promise<CarouselImageGeneration[]> {
    const carouselImages: CarouselImageGeneration[] = [];
    
    for (let i = 0; i < slides.length; i++) {
      const slide = slides[i];
      const imagePrompt = this.createCarouselImagePrompt(slide.text, slide.description, i + 1);
      
      carouselImages.push({
        slideNumber: i + 1,
        description: slide.description,
        imagePrompt,
        status: 'pending',
      });
    }

    // Gerar imagens em paralelo (máximo 3 por vez para evitar rate limits)
    const batchSize = 3;
    for (let i = 0; i < carouselImages.length; i += batchSize) {
      const batch = carouselImages.slice(i, i + batchSize);
      
      const promises = batch.map(async (carouselImage) => {
        try {
          carouselImage.status = 'generating';
          
          const imageResponse = await this.generateImage({
            prompt: carouselImage.imagePrompt,
            style,
            aspectRatio: '1:1', // Instagram carousel é quadrado
            quality: 'standard', // Qualidade média para otimizar tamanho
          });
          
          carouselImage.imageUrl = imageResponse.url;
          carouselImage.status = 'completed';
          
          return carouselImage;
        } catch (error) {
          console.error(`Erro ao gerar imagem para slide ${carouselImage.slideNumber}:`, error);
          carouselImage.status = 'failed';
          return carouselImage;
        }
      });
      
      await Promise.all(promises);
      
      // Pequena pausa entre batches para evitar rate limits
      if (i + batchSize < carouselImages.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    return carouselImages;
  }

  // Criar prompt otimizado para imagens de carrossel
  private static createCarouselImagePrompt(
    slideText: string, 
    description: string, 
    slideNumber: number
  ): string {
    const basePrompt = `Create a vibrant, engaging Instagram carousel slide image for slide ${slideNumber}. 
    
    Slide content: "${slideText}"
    Visual description: "${description}"
    
    Style requirements:
    - Modern, clean design suitable for Instagram
    - High contrast and vibrant colors
    - Text-friendly layout (space for overlay text)
    - Professional but engaging aesthetic
    - No text overlay in the image itself
    - Square format (1:1 aspect ratio)
    - High quality, sharp details
    
    The image should visually represent the content and be suitable for social media engagement.`;

    return basePrompt;
  }

  // Melhorar prompt baseado no estilo
  private static enhancePrompt(prompt: string, style?: string): string {
    const styleEnhancements: Record<string, string> = {
      realistic: 'photorealistic, high quality, detailed, professional photography style',
      illustration: 'illustration style, artistic, creative, hand-drawn aesthetic',
      minimalist: 'minimalist design, clean, simple, modern, lots of white space',
      vibrant: 'vibrant colors, energetic, dynamic, eye-catching, modern design'
    };

    const enhancement = style ? styleEnhancements[style] || styleEnhancements.vibrant : styleEnhancements.vibrant;
    
    return `${prompt}. ${enhancement}. High quality, professional, suitable for social media.`;
  }

  // Obter tamanho da imagem baseado no aspect ratio
  private static getImageSize(aspectRatio?: string): "1024x1024" | "1792x1024" | "1024x1792" {
    switch (aspectRatio) {
      case '16:9':
        return '1792x1024';
      case '9:16':
        return '1024x1792';
      case '1:1':
      default:
        return '1024x1024';
    }
  }

  // Validar se o prompt é adequado para geração de imagem
  static validateImagePrompt(prompt: string): { isValid: boolean; error?: string } {
    if (!prompt || prompt.trim().length < 10) {
      return { isValid: false, error: 'Prompt deve ter pelo menos 10 caracteres' };
    }
    
    if (prompt.length > 1000) {
      return { isValid: false, error: 'Prompt muito longo (máximo 1000 caracteres)' };
    }
    
    // Verificar se contém conteúdo inapropriado (básico)
    const inappropriateWords = ['nude', 'naked', 'violence', 'hate', 'discrimination'];
    const lowerPrompt = prompt.toLowerCase();
    
    for (const word of inappropriateWords) {
      if (lowerPrompt.includes(word)) {
        return { isValid: false, error: 'Prompt contém conteúdo inapropriado' };
      }
    }
    
    return { isValid: true };
  }

  // Gerar prompt de imagem baseado no conteúdo do slide
  static generateImagePromptFromContent(content: string, description: string): string {
    // Extrair palavras-chave do conteúdo
    const keywords = content.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(' ')
      .filter(word => word.length > 3)
      .slice(0, 5);
    
    const keywordString = keywords.join(', ');
    
    return `Create an engaging Instagram carousel image featuring ${keywordString}. 
    Visual concept: ${description}
    Style: Modern, vibrant, social media optimized, square format, high quality, professional design.`;
  }
}
