import { createCanvas } from 'canvas';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Twitter Image Generator
 * Creates eye-catching images for tweets using Canvas
 */

const TWITTER_IMAGE_WIDTH = 1200;
const TWITTER_IMAGE_HEIGHT = 675;

// Color palette
const COLORS = {
  background: '#0f1419',
  primary: '#1d9bf0',
  accent: '#f91880',
  text: '#ffffff',
  textSecondary: '#8b98a5',
  success: '#00ba7c',
  warning: '#ffb700',
  upset: '#ff4757',
};

export interface MatchImageData {
  team1Name: string;
  team2Name: string;
  score: string;
  eventName: string;
  mvpName?: string;
  mvpStats?: string;
  isUpset?: boolean;
}

/**
 * Generate match result image
 */
export async function generateMatchImage(data: MatchImageData): Promise<Buffer> {
  const canvas = createCanvas(TWITTER_IMAGE_WIDTH, TWITTER_IMAGE_HEIGHT);
  const ctx = canvas.getContext('2d');

  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, 0, TWITTER_IMAGE_HEIGHT);
  gradient.addColorStop(0, COLORS.background);
  gradient.addColorStop(1, '#1a1f2e');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, TWITTER_IMAGE_WIDTH, TWITTER_IMAGE_HEIGHT);

  // Upset banner if applicable
  if (data.isUpset) {
    ctx.fillStyle = COLORS.upset;
    ctx.fillRect(0, 0, TWITTER_IMAGE_WIDTH, 80);

    ctx.fillStyle = COLORS.text;
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🚨 UPSET! 🚨', TWITTER_IMAGE_WIDTH / 2, 55);
  }

  const yOffset = data.isUpset ? 120 : 60;

  // Event name
  ctx.fillStyle = COLORS.textSecondary;
  ctx.font = '28px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(data.eventName.toUpperCase(), TWITTER_IMAGE_WIDTH / 2, yOffset);

  // Team names and score
  const centerY = TWITTER_IMAGE_HEIGHT / 2 + (data.isUpset ? 20 : 0);

  // Team 1
  ctx.fillStyle = COLORS.text;
  ctx.font = 'bold 56px Arial';
  ctx.textAlign = 'right';
  ctx.fillText(data.team1Name, TWITTER_IMAGE_WIDTH / 2 - 120, centerY);

  // Score
  ctx.fillStyle = COLORS.primary;
  ctx.font = 'bold 72px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(data.score, TWITTER_IMAGE_WIDTH / 2, centerY + 10);

  // Team 2
  ctx.fillStyle = COLORS.text;
  ctx.font = 'bold 56px Arial';
  ctx.textAlign = 'left';
  ctx.fillText(data.team2Name, TWITTER_IMAGE_WIDTH / 2 + 120, centerY);

  // MVP info
  if (data.mvpName && data.mvpStats) {
    const mvpY = centerY + 120;

    // MVP label
    ctx.fillStyle = COLORS.accent;
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('⭐ MVP', TWITTER_IMAGE_WIDTH / 2, mvpY);

    // MVP name and stats
    ctx.fillStyle = COLORS.text;
    ctx.font = '36px Arial';
    ctx.fillText(data.mvpName, TWITTER_IMAGE_WIDTH / 2, mvpY + 45);

    ctx.fillStyle = COLORS.textSecondary;
    ctx.font = '28px Arial';
    ctx.fillText(data.mvpStats, TWITTER_IMAGE_WIDTH / 2, mvpY + 80);
  }

  // Footer - Website
  ctx.fillStyle = COLORS.primary;
  ctx.font = 'bold 28px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('📺 entreganewba.com.br', TWITTER_IMAGE_WIDTH / 2, TWITTER_IMAGE_HEIGHT - 40);

  return canvas.toBuffer('image/png');
}

/**
 * Save image to temp directory and return path
 */
export async function saveImageTemp(buffer: Buffer, filename: string): Promise<string> {
  const tmpDir = '/tmp/twitter-images';

  // Create dir if doesn't exist
  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir, { recursive: true });
  }

  const filepath = path.join(tmpDir, filename);
  fs.writeFileSync(filepath, buffer);

  return filepath;
}

/**
 * Delete temp image file
 */
export async function deleteTempImage(filepath: string): Promise<void> {
  if (fs.existsSync(filepath)) {
    fs.unlinkSync(filepath);
  }
}
