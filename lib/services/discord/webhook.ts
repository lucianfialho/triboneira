/**
 * Discord Webhook Service
 * Sends notifications and reports to Discord
 */

interface DiscordEmbed {
  title?: string;
  description?: string;
  color?: number;
  fields?: Array<{
    name: string;
    value: string;
    inline?: boolean;
  }>;
  footer?: {
    text: string;
  };
  timestamp?: string;
}

interface DiscordMessage {
  content?: string;
  embeds?: DiscordEmbed[];
}

export class DiscordWebhook {
  private webhookUrl: string;

  constructor(webhookUrl?: string) {
    this.webhookUrl = webhookUrl || process.env.DISCORD_WEBHOOK_URL || '';
  }

  /**
   * Send a message to Discord
   */
  async send(message: DiscordMessage): Promise<void> {
    if (!this.webhookUrl) {
      console.warn('Discord webhook URL not configured, skipping notification');
      return;
    }

    try {
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });

      if (!response.ok) {
        console.error(`Discord webhook failed: ${response.status} ${response.statusText}`);
      }
    } catch (error: any) {
      console.error('Failed to send Discord webhook:', error.message);
    }
  }

  /**
   * Send a success notification
   */
  async sendSuccess(title: string, description: string, fields?: Array<{ name: string; value: string; inline?: boolean }>): Promise<void> {
    await this.send({
      embeds: [{
        title: `✅ ${title}`,
        description,
        color: 0x00ff00, // Green
        fields,
        footer: { text: 'HLTV Data Pipeline' },
        timestamp: new Date().toISOString(),
      }],
    });
  }

  /**
   * Send an error notification
   */
  async sendError(title: string, description: string, error?: string): Promise<void> {
    const fields = error ? [{ name: 'Error', value: error.substring(0, 1024), inline: false }] : undefined;

    await this.send({
      embeds: [{
        title: `❌ ${title}`,
        description,
        color: 0xff0000, // Red
        fields,
        footer: { text: 'HLTV Data Pipeline' },
        timestamp: new Date().toISOString(),
      }],
    });
  }

  /**
   * Send a warning notification
   */
  async sendWarning(title: string, description: string): Promise<void> {
    await this.send({
      embeds: [{
        title: `⚠️ ${title}`,
        description,
        color: 0xffa500, // Orange
        footer: { text: 'HLTV Data Pipeline' },
        timestamp: new Date().toISOString(),
      }],
    });
  }

  /**
   * Send an info notification
   */
  async sendInfo(title: string, description: string, fields?: Array<{ name: string; value: string; inline?: boolean }>): Promise<void> {
    await this.send({
      embeds: [{
        title: `ℹ️ ${title}`,
        description,
        color: 0x0099ff, // Blue
        fields,
        footer: { text: 'HLTV Data Pipeline' },
        timestamp: new Date().toISOString(),
      }],
    });
  }

  /**
   * Send a report with multiple embeds
   */
  async sendReport(title: string, embeds: DiscordEmbed[]): Promise<void> {
    await this.send({
      content: `**${title}**`,
      embeds,
    });
  }
}

/**
 * Global Discord webhook instance
 */
export function getDiscordWebhook(): DiscordWebhook {
  return new DiscordWebhook();
}
