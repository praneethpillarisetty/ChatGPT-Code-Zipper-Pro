// ChatGPT Code Zipper Pro - Popup Script

class PopupManager {
    constructor() {
        this.currentDownloads = 0;
        this.monthlyLimit = 10;
        this.init();
    }

    init() {
        this.loadUsageStats();
        this.loadSettings();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Settings save button
        document.getElementById('save-settings').addEventListener('click', () => {
            this.saveSettings();
        });

        // Upgrade button (placeholder)
        document.getElementById('upgrade-btn').addEventListener('click', () => {
            this.showUpgradeInfo();
        });

        // Enter key in settings input
        document.getElementById('monthly-limit').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.saveSettings();
            }
        });
    }

    async loadUsageStats() {
        const currentMonth = new Date().toISOString().slice(0, 7);
        const storageKey = `downloads_${currentMonth}`;
        
        try {
            const result = await chrome.storage.local.get([storageKey, 'monthlyLimit']);
            this.currentDownloads = result[storageKey] || 0;
            this.monthlyLimit = result.monthlyLimit || 10;
            
            this.updateUsageDisplay();
        } catch (error) {
            console.error('Error loading usage stats:', error);
            this.updateUsageDisplay();
        }
    }

    async loadSettings() {
        try {
            const result = await chrome.storage.local.get(['monthlyLimit']);
            this.monthlyLimit = result.monthlyLimit || 10;
            
            document.getElementById('monthly-limit').value = this.monthlyLimit;
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    }

    updateUsageDisplay() {
        const currentDownloadsEl = document.getElementById('current-downloads');
        const remainingDownloadsEl = document.getElementById('remaining-downloads');
        const usageFillEl = document.getElementById('usage-fill');
        
        const remaining = Math.max(0, this.monthlyLimit - this.currentDownloads);
        const percentage = Math.min(100, (this.currentDownloads / this.monthlyLimit) * 100);
        
        currentDownloadsEl.textContent = this.currentDownloads;
        remainingDownloadsEl.textContent = remaining;
        
        usageFillEl.style.width = `${percentage}%`;
        
        // Update color based on usage
        usageFillEl.className = 'usage-fill';
        if (percentage >= 90) {
            usageFillEl.classList.add('danger');
        } else if (percentage >= 70) {
            usageFillEl.classList.add('warning');
        }
        
        // Update remaining downloads color
        if (remaining <= 2) {
            remainingDownloadsEl.style.color = '#ef4444';
        } else if (remaining <= 5) {
            remainingDownloadsEl.style.color = '#f59e0b';
        } else {
            remainingDownloadsEl.style.color = '#10b981';
        }
    }

    async saveSettings() {
        const newLimit = parseInt(document.getElementById('monthly-limit').value);
        
        if (newLimit < 1 || newLimit > 100) {
            this.showNotification('Please enter a limit between 1 and 100', 'error');
            return;
        }
        
        try {
            await chrome.storage.local.set({
                monthlyLimit: newLimit
            });
            
            this.monthlyLimit = newLimit;
            this.updateUsageDisplay();
            this.showNotification('Settings saved successfully!', 'success');
        } catch (error) {
            console.error('Error saving settings:', error);
            this.showNotification('Error saving settings. Please try again.', 'error');
        }
    }

    showUpgradeInfo() {
        // Placeholder for future Stripe integration
        this.showNotification('Upgrade feature coming soon! Stay tuned for unlimited downloads.', 'info');
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 16px;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 500;
            z-index: 1000;
            animation: slideIn 0.3s ease-out;
            max-width: 300px;
        `;
        
        // Set color based on type
        switch (type) {
            case 'success':
                notification.style.backgroundColor = '#10b981';
                notification.style.color = 'white';
                break;
            case 'error':
                notification.style.backgroundColor = '#ef4444';
                notification.style.color = 'white';
                break;
            case 'warning':
                notification.style.backgroundColor = '#f59e0b';
                notification.style.color = 'white';
                break;
            default:
                notification.style.backgroundColor = '#3b82f6';
                notification.style.color = 'white';
        }
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.style.animation = 'slideOut 0.3s ease-out';
                setTimeout(() => {
                    notification.remove();
                }, 300);
            }
        }, 3000);
    }

    // Method to refresh stats (can be called from content script)
    async refreshStats() {
        await this.loadUsageStats();
    }
}

// Initialize popup manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new PopupManager();
});

// Listen for storage changes to update UI in real-time
chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local') {
        const currentMonth = new Date().toISOString().slice(0, 7);
        const storageKey = `downloads_${currentMonth}`;
        
        if (changes[storageKey] || changes.monthlyLimit) {
            // Refresh the popup stats
            const popup = new PopupManager();
            popup.loadUsageStats();
        }
    }
});

// Add CSS for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);