// ChatGPT Code Zipper Pro - Content Script
class ChatGPTCodeZipper {
  constructor() {
    this.floatingButton = null;
    this.jsZipLoaded = false;
    this.init();
  }

  init() {
    this.loadJSZip();
    this.createFloatingButton();
    this.observePageChanges();
  }

  loadJSZip() {
    if (window.JSZip) {
      this.jsZipLoaded = true;
      return;
    }

    const script = document.createElement('script');
    script.src = chrome.runtime.getURL('jszip.min.js');
    script.onload = () => {
      this.jsZipLoaded = true;
    };
    document.head.appendChild(script);
  }

  createFloatingButton() {
    if (this.floatingButton) return;

    this.floatingButton = document.createElement('div');
    this.floatingButton.id = 'chatgpt-code-zipper-btn';
    this.floatingButton.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M14 2H6C4.89 2 4 2.89 4 4V20C4 21.11 4.89 22 6 22H18C19.11 22 20 21.11 20 20V8L14 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M14 2V8H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M16 13H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M16 17H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M10 9H9H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;
    this.floatingButton.title = 'Extract Code Blocks';
    this.floatingButton.onclick = () => this.extractAndZipCode();
    
    document.body.appendChild(this.floatingButton);
    this.updateButtonVisibility();
  }

  observePageChanges() {
    const observer = new MutationObserver(() => {
      this.updateButtonVisibility();
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  updateButtonVisibility() {
    if (!this.floatingButton) return;
    
    const isConversationPage = window.location.pathname.startsWith('/c/');
    const hasCodeBlocks = document.querySelector('pre code, .highlight') !== null;
    
    if (isConversationPage && hasCodeBlocks) {
      this.floatingButton.style.display = 'flex';
    } else {
      this.floatingButton.style.display = 'none';
    }
  }

  extractFilenameFromContent(content) {
    // Check for various filename patterns in the first few lines
    const lines = content.split('\n').slice(0, 5);
    
    for (const line of lines) {
      // Pattern: # filename: example.py
      const filenameMatch = line.match(/^#\s*filename:\s*(.+)$/i);
      if (filenameMatch) {
        return filenameMatch[1].trim();
      }
      
      // Pattern: // filename: example.js
      const jsFilenameMatch = line.match(/^\/\/\s*filename:\s*(.+)$/i);
      if (jsFilenameMatch) {
        return jsFilenameMatch[1].trim();
      }
      
      // Pattern: <!-- filename: example.html -->
      const htmlFilenameMatch = line.match(/^<!--\s*filename:\s*(.+)\s*-->$/i);
      if (htmlFilenameMatch) {
        return htmlFilenameMatch[1].trim();
      }
    }
    
    return null;
  }

  detectFileExtension(content) {
    const lines = content.split('\n').slice(0, 10);
    const firstLine = lines[0] || '';
    
    // Check for shebangs
    if (firstLine.startsWith('#!/usr/bin/env python') || firstLine.startsWith('#!/usr/bin/python')) {
      return 'py';
    }
    if (firstLine.startsWith('#!/bin/bash') || firstLine.startsWith('#!/bin/sh')) {
      return 'sh';
    }
    if (firstLine.startsWith('#!/usr/bin/env node')) {
      return 'js';
    }
    
    // Check for common patterns
    if (content.includes('def ') || content.includes('import ') || content.includes('from ')) {
      return 'py';
    }
    if (content.includes('function ') || content.includes('const ') || content.includes('let ') || content.includes('var ')) {
      return 'js';
    }
    if (content.includes('<html') || content.includes('<!DOCTYPE')) {
      return 'html';
    }
    if (content.includes('SELECT ') || content.includes('FROM ') || content.includes('WHERE ')) {
      return 'sql';
    }
    if (content.includes('#include') || content.includes('int main(')) {
      return 'cpp';
    }
    
    return 'txt';
  }

  extractCodeBlocks() {
    const codeBlocks = [];
    let fileCounter = 1;
    
    // Find all code blocks in ChatGPT responses
    const messageElements = document.querySelectorAll('[data-message-author-role="assistant"]');
    
    messageElements.forEach(messageEl => {
      const codeElements = messageEl.querySelectorAll('pre code, .highlight');
      
      codeElements.forEach(codeEl => {
        const content = codeEl.textContent || codeEl.innerText;
        if (!content.trim()) return;
        
        let filename = null;
        
        // Check for filename in preceding text
        const preElement = codeEl.closest('pre');
        if (preElement && preElement.previousElementSibling) {
          const prevText = preElement.previousElementSibling.textContent || '';
          const filenameMatch = prevText.match(/([^\s]+\.[a-zA-Z0-9]+)\s*$/);
          if (filenameMatch) {
            filename = filenameMatch[1];
          }
        }
        
        // Check for filename in code content
        if (!filename) {
          filename = this.extractFilenameFromContent(content);
        }
        
        // Auto-generate filename if not found
        if (!filename) {
          const extension = this.detectFileExtension(content);
          filename = `file${fileCounter}.${extension}`;
          fileCounter++;
        }
        
        codeBlocks.push({
          filename: filename,
          content: content
        });
      });
    });
    
    return codeBlocks;
  }

  getConversationTitle() {
    // Try to get conversation title from the page
    const titleElements = [
      'h1',
      '[data-testid="conversation-title"]',
      '.text-lg.font-semibold',
      'title'
    ];
    
    for (const selector of titleElements) {
      const element = document.querySelector(selector);
      if (element && element.textContent.trim()) {
        return element.textContent.trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '_');
      }
    }
    
    return 'chatgpt_conversation';
  }

  generateZipFilename() {
    const title = this.getConversationTitle();
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const timeStr = now.toTimeString().slice(0, 5).replace(':', '');
    
    return `${title}_${dateStr}_${timeStr}.zip`;
  }

  async extractAndZipCode() {
    if (!this.jsZipLoaded) {
      alert('JSZip is still loading. Please try again in a moment.');
      return;
    }
    
    const codeBlocks = this.extractCodeBlocks();
    
    if (codeBlocks.length === 0) {
      alert('No code blocks found in this conversation.');
      return;
    }
    
    // Check monthly limit
    const canDownload = await this.checkMonthlyLimit();
    if (!canDownload) {
      this.showUpgradeMessage();
      return;
    }
    
    // Create zip file
    const zip = new JSZip();
    
    codeBlocks.forEach(block => {
      zip.file(block.filename, block.content);
    });
    
    // Generate and download zip
    try {
      const content = await zip.generateAsync({type: 'blob'});
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = this.generateZipFilename();
      a.click();
      URL.revokeObjectURL(url);
      
      // Update download count
      await this.incrementDownloadCount();
      
      // Show success message
      this.showSuccessMessage(codeBlocks.length);
      
    } catch (error) {
      console.error('Error creating zip:', error);
      alert('Error creating zip file. Please try again.');
    }
  }

  async checkMonthlyLimit() {
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    const storageKey = `downloads_${currentMonth}`;
    
    return new Promise((resolve) => {
      chrome.storage.local.get([storageKey, 'monthlyLimit'], (result) => {
        const monthlyLimit = result.monthlyLimit || 10;
        const currentDownloads = result[storageKey] || 0;
        resolve(currentDownloads < monthlyLimit);
      });
    });
  }

  async incrementDownloadCount() {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const storageKey = `downloads_${currentMonth}`;
    
    return new Promise((resolve) => {
      chrome.storage.local.get([storageKey], (result) => {
        const currentDownloads = result[storageKey] || 0;
        chrome.storage.local.set({
          [storageKey]: currentDownloads + 1
        }, resolve);
      });
    });
  }

  showUpgradeMessage() {
    const message = document.createElement('div');
    message.id = 'chatgpt-zipper-upgrade-message';
    message.innerHTML = `
      <div class="upgrade-content">
        <h3>Monthly Limit Reached</h3>
        <p>You've reached your monthly download limit of 10 zips.</p>
        <p><strong>Upgrade for unlimited downloads—coming soon!</strong></p>
        <button onclick="this.parentElement.parentElement.remove()">Close</button>
      </div>
    `;
    document.body.appendChild(message);
    
    setTimeout(() => {
      if (message.parentElement) {
        message.remove();
      }
    }, 5000);
  }

  showSuccessMessage(blockCount) {
    const message = document.createElement('div');
    message.id = 'chatgpt-zipper-success-message';
    message.innerHTML = `
      <div class="success-content">
        <h3>✓ Code Extracted Successfully!</h3>
        <p>Downloaded ${blockCount} code blocks as a zip file.</p>
      </div>
    `;
    document.body.appendChild(message);
    
    setTimeout(() => {
      if (message.parentElement) {
        message.remove();
      }
    }, 3000);
  }
}

// Initialize the extension
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new ChatGPTCodeZipper();
  });
} else {
  new ChatGPTCodeZipper();
}