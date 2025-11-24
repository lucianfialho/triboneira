import {
  ContentItem,
  ContentTemplate,
  ContentTrigger,
  ContentPriority,
  Platform,
  ContentFormat,
  GeneratedContent,
} from './types';
import { matchResultTemplates } from './templates/match-result';
import { upsetTemplates } from './templates/upset';
import { getVisualGenerator, VisualGenerator } from './visual-generator';

/**
 * Content Generator Service
 * Generates social media content based on triggers and templates
 */
export class ContentGenerator {
  private templates: Map<string, ContentTemplate>;
  private visualGenerator: VisualGenerator | null = null;
  private generateVisuals: boolean;

  constructor(options?: { generateVisuals?: boolean }) {
    this.templates = new Map();
    this.generateVisuals = options?.generateVisuals ?? false;
    this.registerDefaultTemplates();

    if (this.generateVisuals) {
      this.visualGenerator = getVisualGenerator();
    }
  }

  /**
   * Register default templates
   */
  private registerDefaultTemplates(): void {
    // Match result templates
    matchResultTemplates.forEach(template => {
      this.templates.set(template.id, template);
    });

    // Upset templates
    upsetTemplates.forEach(template => {
      this.templates.set(template.id, template);
    });
  }

  /**
   * Register a custom template
   */
  registerTemplate(template: ContentTemplate): void {
    this.templates.set(template.id, template);
  }

  /**
   * Get template by ID
   */
  getTemplate(id: string): ContentTemplate | undefined {
    return this.templates.get(id);
  }

  /**
   * Find templates by criteria
   */
  findTemplates(criteria: {
    platform?: Platform;
    format?: ContentFormat;
    category?: string;
  }): ContentTemplate[] {
    const results: ContentTemplate[] = [];

    this.templates.forEach(template => {
      let matches = true;

      if (criteria.platform && template.platform !== criteria.platform) {
        matches = false;
      }

      if (criteria.format && template.format !== criteria.format) {
        matches = false;
      }

      if (criteria.category && template.category !== criteria.category) {
        matches = false;
      }

      if (matches) {
        results.push(template);
      }
    });

    return results;
  }

  /**
   * Generate content from a trigger
   */
  async generateFromTrigger(trigger: ContentTrigger): Promise<ContentItem[]> {
    const items: ContentItem[] = [];

    // Map trigger events to template categories
    const categoryMap: Record<string, string> = {
      'match.finished': 'match-result',
      'upset.detected': 'upset',
      'overtime.detected': 'overtime',
      'epic-series.detected': 'epic-series',
      'player.performance': 'player-highlight',
      'daily.recap': 'daily-recap',
      'event.starting': 'event-announcement',
      'swiss.match-decisive': 'swiss-bracket',
      'team.achievement': 'team-achievement',
      'news.published': 'news',
    };

    const category = categoryMap[trigger.event];
    if (!category) {
      console.warn(`No category mapping for event: ${trigger.event}`);
      return items;
    }

    // Find relevant templates
    const templates = this.findTemplates({ category });

    // Generate content for each template
    for (const template of templates) {
      try {
        const generated = await this.generate(template.id, trigger.data);
        if (generated) {
          items.push(generated);
        }
      } catch (error) {
        console.error(`Error generating content with template ${template.id}:`, error);
      }
    }

    return items;
  }

  /**
   * Generate content item from template
   */
  async generate(templateId: string, data: Record<string, any>): Promise<ContentItem | null> {
    const template = this.getTemplate(templateId);
    if (!template) {
      console.error(`Template not found: ${templateId}`);
      return null;
    }

    // Validate required fields
    const missingFields = template.requiredFields.filter(field => !(field in data));
    if (missingFields.length > 0) {
      console.error(`Missing required fields for template ${templateId}:`, missingFields);
      return null;
    }

    try {
      // Generate content using template
      const generatedContent = template.generate(data);

      // Generate visual if enabled
      if (this.generateVisuals && this.visualGenerator && generatedContent.visual) {
        try {
          const visualFile = await this.visualGenerator.generate(
            templateId,
            generatedContent.visual.data,
            template.platform,
            template.format
          );

          // Add visual file path to generated content
          generatedContent.visual.filePath = visualFile.filePath;
          generatedContent.visual.dimensions = {
            width: visualFile.width,
            height: visualFile.height,
          };
        } catch (visualError) {
          console.error(`Error generating visual for ${templateId}:`, visualError);
          // Continue without visual - text content is still valid
        }
      }

      // Create content item
      const item: ContentItem = {
        id: this.generateId(),
        platform: template.platform,
        format: template.format,
        priority: this.determinePriority(template, data),
        status: 'draft',
        templateId: template.id,
        data: {
          ...data,
          generated: generatedContent,
        },
        generatedAt: new Date(),
        metadata: {
          category: template.category,
          templateName: template.name,
        },
      };

      return item;
    } catch (error) {
      console.error(`Error executing template ${templateId}:`, error);
      return null;
    }
  }

  /**
   * Generate multiple content items for different platforms
   */
  async generateMultiPlatform(
    category: string,
    data: Record<string, any>,
    platforms: Platform[] = ['instagram', 'twitter']
  ): Promise<ContentItem[]> {
    const items: ContentItem[] = [];

    for (const platform of platforms) {
      const templates = this.findTemplates({ platform, category });

      for (const template of templates) {
        const item = await this.generate(template.id, data);
        if (item) {
          items.push(item);
        }
      }
    }

    return items;
  }

  /**
   * Determine content priority based on template and data
   */
  private determinePriority(template: ContentTemplate, data: Record<string, any>): ContentPriority {
    // High priority categories
    const highPriorityCategories = ['upset', 'overtime', 'epic-series'];
    if (highPriorityCategories.includes(template.category)) {
      return 'high';
    }

    // Check data-specific conditions
    if (template.category === 'upset' && data.upsetLevel === 'massive') {
      return 'high';
    }

    if (template.category === 'player-highlight' && data.rating > 1.8) {
      return 'high';
    }

    // Default to medium
    return 'medium';
  }

  /**
   * Generate unique ID for content item
   */
  private generateId(): string {
    return `content_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Validate generated content
   */
  validateContent(item: ContentItem): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!item.data.generated) {
      errors.push('No generated content');
    }

    const generated = item.data.generated as GeneratedContent;

    // Validate text content exists
    if (!generated.text || (!generated.text.caption && !generated.text.headline)) {
      errors.push('Missing text content');
    }

    // Platform-specific validation
    if (item.platform === 'twitter') {
      const captionLength = generated.text.caption?.length || 0;
      if (captionLength > 280) {
        errors.push(`Twitter caption too long: ${captionLength} characters (max 280)`);
      }
    }

    if (item.platform === 'instagram') {
      const captionLength = generated.text.caption?.length || 0;
      if (captionLength > 2200) {
        errors.push(`Instagram caption too long: ${captionLength} characters (max 2200)`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

// Global instance
let globalContentGenerator: ContentGenerator | null = null;

export function getContentGenerator(options?: { generateVisuals?: boolean }): ContentGenerator {
  // If options are provided and generator already exists, reinitialize if settings changed
  if (globalContentGenerator && options?.generateVisuals !== undefined) {
    // Check if we need to reinitialize
    const currentHasVisuals = (globalContentGenerator as any).generateVisuals;
    if (currentHasVisuals !== options.generateVisuals) {
      console.log(`🔄 Reinitializing ContentGenerator with generateVisuals=${options.generateVisuals}`);
      globalContentGenerator = new ContentGenerator(options);
    }
  } else if (!globalContentGenerator) {
    globalContentGenerator = new ContentGenerator(options);
  }
  return globalContentGenerator;
}

// Enable visual generation globally
export function enableVisualGeneration(): void {
  if (globalContentGenerator) {
    console.warn('ContentGenerator already initialized. Create a new instance with generateVisuals enabled.');
  } else {
    globalContentGenerator = new ContentGenerator({ generateVisuals: true });
  }
}
