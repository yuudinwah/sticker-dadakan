/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {GoogleGenAI, Modality} from '@google/genai';

const ai = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY});

interface StickerOptions {
  style: string;
  mood: string;
  color: string;
}

interface GeneratedSticker {
  id: string;
  prompt: string;
  imageData: string;
  timestamp: number;
  options: StickerOptions;
}

interface DailyUsage {
  date: string;
  count: number;
}

class StickerMaker {
  private chat: any;
  private gallery: GeneratedSticker[] = [];
  private dailyUsage: DailyUsage | null = null;
  private readonly MAX_DAILY_GENERATIONS = 10;
  
  constructor() {
    this.chat = ai.chats.create({
      model: 'gemini-2.0-flash-preview-image-generation',
      config: {
        responseModalities: [Modality.TEXT, Modality.IMAGE],
      },
      history: [],
    });
    
    this.loadGallery();
    this.loadDailyUsage();
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        this.initializeEventListeners();
        this.updateGenerateButton();
      });
    } else {
      this.initializeEventListeners();
      this.updateGenerateButton();
    }
  }
  
  private buildStickerPrompt(userPrompt: string, options: StickerOptions): string {
    const stylePrompts = {
      kawaii: "kawaii style, cute big eyes, soft rounded features, pastel colors",
      cartoon: "cartoon style, bold outlines, expressive features, bright colors",
      minimalist: "minimalist style, clean lines, simple shapes, limited color palette",
      chibi: "chibi style, super deformed, oversized head, tiny body, adorable",
      pixel: "pixel art style, 8-bit aesthetic, crisp pixels, retro gaming vibes",
      emoji: "emoji style, circular background, simple iconic design, mobile-friendly"
    };
    
    const moodPrompts = {
      happy: "cheerful expression, bright smile, positive energy",
      cool: "confident pose, stylish look, sunglasses or cool accessories",
      funny: "silly expression, comedic pose, humorous elements",
      cute: "adorable features, innocent look, sweet expression",
      serious: "focused expression, determined look, professional appearance",
      silly: "goofy face, playful pose, whimsical elements"
    };
    
    const colorPrompts = {
      vibrant: "vibrant saturated colors, high contrast, eye-catching palette",
      pastel: "soft pastel colors, gentle tones, dreamy aesthetic",
      monochrome: "black and white or single color scheme, high contrast",
      neon: "bright neon colors, glowing effects, cyberpunk vibes",
      earth: "natural earth tones, browns, greens, warm colors"
    };
    
    const basePrompt = `Create a single sticker design: ${userPrompt}`;
    const styleInstruction = stylePrompts[options.style] || stylePrompts.kawaii;
    const moodInstruction = moodPrompts[options.mood] || moodPrompts.happy;
    const colorInstruction = colorPrompts[options.color] || colorPrompts.vibrant;
    
    return `${basePrompt}

Style: ${styleInstruction}
Mood: ${moodInstruction}
Colors: ${colorInstruction}

IMPORTANT REQUIREMENTS:
- Single sticker design, not multiple stickers
- Perfect for messaging apps and social media
- Clean background (preferably transparent or white)
- High contrast and clear visibility
- Optimal size for sticker use (square or circular composition)
- No text or words in the image
- Focus on the main subject, avoid clutter
- Bold, recognizable design that works at small sizes
- Suitable for digital sticker packs`;
  }
  
  private async generateSticker(prompt: string, options: StickerOptions): Promise<string> {
    const optimizedPrompt = this.buildStickerPrompt(prompt, options);
    
    try {
      const result = await this.chat.sendMessage({
        message: optimizedPrompt,
      });
      
      // Look for image data in the response
      for (const candidate of result.candidates) {
        for (const part of candidate.content.parts ?? []) {
          if (part.inlineData?.data) {
            return part.inlineData.data;
          }
        }
      }
      
      throw new Error('No image generated in response');
    } catch (error) {
      console.error('Generation error:', error);
      
      // Parse error message for better user feedback
      if (error.message && error.message.includes('status: 400')) {
        throw new Error('Invalid request. Please check your API key and try again.');
      } else if (error.message && error.message.includes('status: 401')) {
        throw new Error('Authentication failed. Please check your API key.');
      } else if (error.message && error.message.includes('status: 429')) {
        throw new Error('Rate limit exceeded. Please try again in a moment.');
      } else {
        throw new Error('Failed to generate sticker. Please try again.');
      }
    }
  }
  
  private showToast(message: string, type: 'success' | 'error' | 'warning' = 'error'): void {
    const toast = document.getElementById('toast')!;
    const toastMessage = toast.querySelector('.toast-message')!;
    const toastIcon = toast.querySelector('.toast-icon')!;
    
    // Update icon based on type
    if (type === 'success') {
      toastIcon.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <circle cx="10" cy="10" r="8" stroke="currentColor" stroke-width="2"/>
          <path d="M6 10L8.5 12.5L14 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      `;
      toastIcon.style.color = 'var(--success-500)';
    } else if (type === 'warning') {
      toastIcon.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <circle cx="10" cy="10" r="8" stroke="currentColor" stroke-width="2"/>
          <path d="M10 6V10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          <circle cx="10" cy="14" r="1" fill="currentColor"/>
        </svg>
      `;
      toastIcon.style.color = 'var(--warning-500)';
    } else {
      toastIcon.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <circle cx="10" cy="10" r="8" stroke="currentColor" stroke-width="2"/>
          <path d="M6 6L14 14M6 14L14 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      `;
      toastIcon.style.color = 'var(--error-500)';
    }
    
    toastMessage.textContent = message;
    toast.style.display = 'block';
    
    setTimeout(() => {
      toast.style.display = 'none';
    }, 5000);
  }
  
  private showLoading(isLoading: boolean): void {
    const btn = document.getElementById('generate-btn')!;
    const btnText = btn.querySelector('.btn-text')!;
    const btnLoader = btn.querySelector('.btn-loader')!;
    
    if (isLoading) {
      (btnText as HTMLElement).style.display = 'none';
      (btnLoader as HTMLElement).style.display = 'flex';
      btn.setAttribute('disabled', '');
    } else {
      (btnText as HTMLElement).style.display = 'block';
      (btnLoader as HTMLElement).style.display = 'none';
      btn.removeAttribute('disabled');
    }
  }
  
  private displaySticker(imageData: string, prompt: string, options: StickerOptions): void {
    const placeholder = document.querySelector('.preview-placeholder')!;
    const result = document.getElementById('preview-result')!;
    const stickerImage = document.getElementById('sticker-image') as HTMLImageElement;
    const resultActions = document.getElementById('result-actions')!;
    
    (placeholder as HTMLElement).style.display = 'none';
    stickerImage.src = `data:image/png;base64,${imageData}`;
    (result as HTMLElement).style.display = 'block';
    (resultActions as HTMLElement).style.display = 'flex';
    
    // Store current sticker data for download
    (window as any).currentSticker = {
      imageData,
      prompt,
      options,
      timestamp: Date.now()
    };
  }
  
  private downloadSticker(): void {
    const currentSticker = (window as any).currentSticker;
    if (!currentSticker) return;
    
    const link = document.createElement('a');
    link.href = `data:image/png;base64,${currentSticker.imageData}`;
    link.download = `sticker-${Date.now()}.png`;
    link.click();
    
    // Save to gallery
    this.saveToGallery(currentSticker);
  }
  
  private saveToGallery(sticker: any): void {
    const newSticker: GeneratedSticker = {
      id: `sticker-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      prompt: sticker.prompt,
      imageData: sticker.imageData,
      timestamp: sticker.timestamp,
      options: sticker.options
    };
    
    this.gallery.unshift(newSticker);
    
    // Keep only last 20 stickers
    if (this.gallery.length > 20) {
      this.gallery = this.gallery.slice(0, 20);
    }
    
    this.saveGallery();
  }
  
  private loadGallery(): void {
    try {
      const saved = localStorage.getItem('sticker-gallery');
      if (saved) {
        this.gallery = JSON.parse(saved);
      }
    } catch (error) {
      console.error('Failed to load gallery:', error);
      this.gallery = [];
    }
  }
  
  private saveGallery(): void {
    try {
      localStorage.setItem('sticker-gallery', JSON.stringify(this.gallery));
    } catch (error) {
      console.error('Failed to save gallery:', error);
    }
  }
  
  private loadDailyUsage(): void {
    try {
      const today = new Date().toDateString();
      const saved = localStorage.getItem('daily-usage');
      
      if (saved) {
        const usage = JSON.parse(saved) as DailyUsage;
        if (usage.date === today) {
          this.dailyUsage = usage;
        } else {
          // New day, reset count
          this.dailyUsage = { date: today, count: 0 };
          this.saveDailyUsage();
        }
      } else {
        this.dailyUsage = { date: today, count: 0 };
        this.saveDailyUsage();
      }
    } catch (error) {
      console.error('Failed to load daily usage:', error);
      this.dailyUsage = { date: new Date().toDateString(), count: 0 };
    }
  }
  
  private saveDailyUsage(): void {
    try {
      if (this.dailyUsage) {
        localStorage.setItem('daily-usage', JSON.stringify(this.dailyUsage));
      }
    } catch (error) {
      console.error('Failed to save daily usage:', error);
    }
  }
  
  private canGenerateToday(): boolean {
    return this.dailyUsage ? this.dailyUsage.count < this.MAX_DAILY_GENERATIONS : false;
  }
  
  private getRemainingGenerations(): number {
    return this.dailyUsage ? this.MAX_DAILY_GENERATIONS - this.dailyUsage.count : 0;
  }
  
  private incrementDailyUsage(): void {
    if (this.dailyUsage) {
      this.dailyUsage.count++;
      this.saveDailyUsage();
    }
  }
  
  private updateGenerateButton(): void {
    const btn = document.getElementById('generate-btn') as HTMLButtonElement;
    const promptInput = document.getElementById('prompt') as HTMLTextAreaElement;
    
    if (!btn || !promptInput) return;
    
    const prompt = promptInput.value.trim();
    const canGenerate = this.canGenerateToday();
    const hasPrompt = prompt.length > 0;
    
    // Update button state
    if (!hasPrompt) {
      btn.disabled = true;
      btn.title = 'Please enter a description for your sticker';
      btn.style.opacity = '0.5';
      btn.style.cursor = 'not-allowed';
    } else if (!canGenerate) {
      btn.disabled = true;
      btn.title = 'Daily limit reached (10 generations per day)';
      btn.style.opacity = '0.5';
      btn.style.cursor = 'not-allowed';
    } else {
      btn.disabled = false;
      btn.title = '';
      btn.style.opacity = '1';
      btn.style.cursor = 'pointer';
    }
    
    // Update button text (simpler)
    const btnText = btn.querySelector('.btn-text') as HTMLElement;
    if (btnText) {
      if (!canGenerate) {
        btnText.textContent = 'Limit Harian Tercapai';
      } else {
        btnText.textContent = 'Generate Sticker';
      }
    }
    
    // Update remaining count display
    this.updateRemainingDisplay();
  }
  
  private updateRemainingDisplay(): void {
    const remainingElement = document.getElementById('remaining-count');
    if (!remainingElement) return;
    
    const remaining = this.getRemainingGenerations();
    
    if (remaining <= 2 && remaining > 0) {
      remainingElement.textContent = `(sisa ${remaining} hari ini)`;
      remainingElement.style.display = 'inline';
    } else {
      remainingElement.style.display = 'none';
    }
  }
  
  private scrollToPreview(): void {
    const previewSection = document.querySelector('.preview-section') as HTMLElement;
    if (previewSection) {
      previewSection.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }
  }
  
  private showGallery(): void {
    const modal = document.getElementById('gallery-modal')!;
    const grid = document.getElementById('gallery-grid')!;
    
    grid.innerHTML = '';
    
    if (this.gallery.length === 0) {
      grid.innerHTML = '<p class="gallery-empty">No stickers yet. Generate your first sticker!</p>';
    } else {
      this.gallery.forEach(sticker => {
        const item = document.createElement('div');
        item.className = 'gallery-item';
        item.innerHTML = `
          <img src="data:image/png;base64,${sticker.imageData}" alt="${sticker.prompt}">
          <div class="gallery-item-info">
            <p class="gallery-item-prompt">${sticker.prompt}</p>
            <p class="gallery-item-style">${sticker.options.style} • ${sticker.options.mood}</p>
          </div>
        `;
        
        item.addEventListener('click', () => {
          this.displaySticker(sticker.imageData, sticker.prompt, sticker.options);
          (modal as HTMLElement).style.display = 'none';
        });
        
        grid.appendChild(item);
      });
    }
    
    (modal as HTMLElement).style.display = 'flex';
  }
  
  private initializeEventListeners(): void {
    // Ensure initial state is correct
    this.showLoading(false);
    
    // Add touch feedback for mobile
    this.addTouchFeedback();
    
    // Handle mobile keyboard
    this.handleMobileKeyboard();
    
    // Generate button
    document.getElementById('generate-btn')!.addEventListener('click', async () => {
      const promptInput = document.getElementById('prompt') as HTMLTextAreaElement;
      const styleSelect = document.getElementById('style') as HTMLSelectElement;
      const moodSelect = document.getElementById('mood') as HTMLSelectElement;
      const colorSelect = document.getElementById('color') as HTMLSelectElement;
      
      const prompt = promptInput.value.trim();
      
      // Validate prompt
      if (!prompt) {
        this.showToast('Please enter a description for your sticker', 'warning');
        return;
      }
      
      // Check daily limit
      if (!this.canGenerateToday()) {
        this.showToast('Daily limit reached! You can generate 10 stickers per day', 'warning');
        return;
      }
      
      const options: StickerOptions = {
        style: styleSelect.value,
        mood: moodSelect.value,
        color: colorSelect.value
      };
      
      this.showLoading(true);
      
      try {
        const imageData = await this.generateSticker(prompt, options);
        this.displaySticker(imageData, prompt, options);
        
        // Increment daily usage
        this.incrementDailyUsage();
        this.updateGenerateButton();
        
        this.showToast('Sticker generated successfully!', 'success');
        
        // Auto-scroll to preview section
        setTimeout(() => {
          this.scrollToPreview();
        }, 100);
      } catch (error) {
        this.showToast('Failed to generate sticker. Please try again.', 'error');
      } finally {
        this.showLoading(false);
      }
    });
    
    // Download button
    document.getElementById('download-btn')!.addEventListener('click', () => {
      this.downloadSticker();
    });
    
    // Regenerate button
    document.getElementById('regenerate-btn')!.addEventListener('click', () => {
      document.getElementById('generate-btn')!.click();
    });
    
    // Gallery button
    document.getElementById('gallery-btn')!.addEventListener('click', () => {
      this.showGallery();
    });
    
    // Modal close
    document.querySelector('.modal-close')!.addEventListener('click', () => {
      (document.getElementById('gallery-modal')! as HTMLElement).style.display = 'none';
    });
    
    // Click outside modal to close
    document.getElementById('gallery-modal')!.addEventListener('click', (e) => {
      if (e.target === e.currentTarget) {
        (e.target as HTMLElement).style.display = 'none';
      }
    });
    
    // Suggestion tags
    document.querySelectorAll('.suggestion-card').forEach(card => {
      card.addEventListener('click', () => {
        const prompt = card.getAttribute('data-prompt')!;
        (document.getElementById('prompt') as HTMLTextAreaElement).value = prompt;
        this.updateGenerateButton();
      });
    });
    
    // Update button state on prompt input
    document.getElementById('prompt')!.addEventListener('input', () => {
      this.updateGenerateButton();
    });
    
    // Enter key to generate
    document.getElementById('prompt')!.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        const btn = document.getElementById('generate-btn') as HTMLButtonElement;
        if (!btn.disabled) {
          btn.click();
        }
      }
    });
  }
  
  private addTouchFeedback(): void {
    // Add haptic feedback for mobile devices
    const addHapticFeedback = () => {
      if ('vibrate' in navigator) {
        navigator.vibrate(10);
      }
    };
    
    // Add touch feedback to buttons
    document.querySelectorAll('.btn').forEach(btn => {
      btn.addEventListener('touchstart', () => {
        btn.classList.add('btn-pressed');
        addHapticFeedback();
      });
      
      btn.addEventListener('touchend', () => {
        setTimeout(() => {
          btn.classList.remove('btn-pressed');
        }, 100);
      });
    });
    
    // Add touch feedback to tags
    document.querySelectorAll('.tag').forEach(tag => {
      tag.addEventListener('touchstart', () => {
        tag.classList.add('tag-pressed');
        addHapticFeedback();
      });
      
      tag.addEventListener('touchend', () => {
        setTimeout(() => {
          tag.classList.remove('tag-pressed');
        }, 100);
      });
    });
    
    // Prevent double-tap zoom on buttons
    document.querySelectorAll('.btn, .tag').forEach(element => {
      element.addEventListener('touchend', (e) => {
        e.preventDefault();
      });
    });
  }
  
  private handleMobileKeyboard(): void {
    // Handle mobile keyboard appearing/disappearing
    const viewport = document.querySelector('meta[name=viewport]') as HTMLMetaElement;
    
    if (viewport) {
      // Detect if mobile keyboard is open
      const initialHeight = window.innerHeight;
      
      window.addEventListener('resize', () => {
        const currentHeight = window.innerHeight;
        const keyboardHeight = initialHeight - currentHeight;
        
        if (keyboardHeight > 150) { // Keyboard is likely open
          document.body.classList.add('keyboard-open');
          // Adjust viewport for mobile keyboard
          viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
        } else {
          document.body.classList.remove('keyboard-open');
          viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
        }
      });
    }
  }
}

// Initialize the app
new StickerMaker();