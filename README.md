# ChatGPT Code Zipper Pro

A powerful Chrome extension that automatically extracts and downloads code blocks from ChatGPT conversations as organized zip files.

## Features

- **Automatic Code Detection**: Scans ChatGPT conversations and detects code blocks
- **Smart Filename Recognition**: Extracts filenames from markdown headers or code comments
- **Auto-naming**: Generates intelligent filenames based on code language and content
- **One-Click Download**: Simple floating action button for instant code extraction
- **Monthly Usage Tracking**: Built-in usage limits with visual progress indicators
- **Client-side Processing**: All code processing happens in your browser - no server required
- **Privacy-first**: No data is sent to external servers

## Installation

1. Download the extension files
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension folder
5. The extension will appear in your Chrome toolbar

## Usage

1. **Visit ChatGPT**: Navigate to [chat.openai.com](https://chat.openai.com)
2. **Open a Conversation**: Go to any conversation containing code blocks
3. **Click the Zip Button**: A floating action button will appear when code is detected
4. **Download**: Code blocks are automatically extracted and downloaded as a zip file

## Supported Filename Formats

The extension recognizes several filename patterns:

### In Code Comments
```python
# filename: my_script.py
def hello_world():
    print("Hello, World!")
```

```javascript
// filename: app.js
function greet() {
    console.log("Hello!");
}
```

```html
<!-- filename: index.html -->
<!DOCTYPE html>
<html>...</html>
```

### In Markdown Headers
Code blocks preceded by filenames like:
```
**main.py**
```python
print("Hello World")
```

## File Naming Logic

1. **Explicit Filenames**: Uses filenames found in comments or headers
2. **Language Detection**: Automatically detects programming language
3. **Auto-naming**: Generates names like `file1.py`, `file2.js`, etc.
4. **Zip Naming**: `{conversation-title}_{YYYYMMDD}_{HHMM}.zip`

## Monthly Usage Limits

- **Free Tier**: 10 downloads per month
- **Usage Tracking**: Visual progress bar in popup
- **Limit Reset**: Automatically resets each calendar month
- **Customizable**: Adjust limits in settings (1-100 downloads)

## Future Features

- **Unlimited Downloads**: Premium upgrade coming soon
- **Stripe Integration**: Seamless payment processing
- **Advanced Filtering**: Include/exclude specific file types
- **Project Organization**: Group related code blocks

## Privacy & Security

- **No Data Collection**: All processing happens locally
- **No External Servers**: Code never leaves your browser
- **Open Source**: Transparent and auditable codebase
- **Minimal Permissions**: Only accesses chat.openai.com

## Technical Details

- **Manifest Version**: 3 (latest Chrome extension standard)
- **JavaScript Library**: JSZip for client-side compression
- **Storage**: Chrome's local storage for usage tracking
- **Permissions**: 
  - `storage` - For usage tracking
  - `activeTab` - For accessing ChatGPT pages
  - `host_permissions` - Limited to chat.openai.com

## Settings

Access settings via the extension popup:

- **Monthly Limit**: Set your desired download limit (1-100)
- **Usage Statistics**: View current month's usage
- **Support Contact**: Direct link to support email

## Troubleshooting

### Extension Not Working
- Ensure you're on chat.openai.com
- Check that the conversation contains code blocks
- Verify extension is enabled in Chrome

### No Floating Button
- Refresh the ChatGPT page
- Check that code blocks are present and visible
- Ensure you're viewing a conversation (not the main page)

### Download Issues
- Check if monthly limit has been reached
- Verify browser allows downloads from chrome-extension://
- Clear browser cache and try again

## Support

For issues, questions, or feature requests:
- **Email**: support@codezipperpro.com
- **GitHub Issues**: [Coming Soon]
- **Version**: 1.0.0

## License

This extension is provided as-is for educational and productivity purposes. Please respect OpenAI's terms of service when using with ChatGPT.

## Changelog

### Version 1.0.0
- Initial release
- Basic code extraction functionality
- Monthly usage tracking
- Floating action button UI
- Support for Python, JavaScript, HTML, SQL, and more
- Automatic filename detection
- Client-side zip generation

---

**Made with ❤️ for developers who want to quickly extract and organize code from ChatGPT conversations.**
