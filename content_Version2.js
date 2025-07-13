// Track monthly downloads using Chrome storage
let monthlyDownloads = 0;
const MONTHLY_LIMIT = 10;

// Initialize floating action button
function initializeFloatingButton() {
  const button = document.createElement('button');
  button.id = 'code-zipper-fab';
  button.innerHTML = '📁';
  button.title = 'Extract and zip code blocks';
  document.body.appendChild(button);

  button.addEventListener('click', handleButtonClick);
}

// Extract code blocks and create zip
async function handleButtonClick() {
  // Check monthly limit
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  chrome.storage.local.get(['downloads', 'month', 'year'], async (result) => {
    if (result.month !== currentMonth || result.year !== currentYear) {
      // Reset counter for new month
      monthlyDownloads = 0;
    } else {
      monthlyDownloads = result.downloads || 0;
    }

    if (monthlyDownloads >= MONTHLY_LIMIT) {
      alert('Monthly download limit reached. Upgrade for unlimited downloads!');
      return;
    }

    const codeBlocks = extractCodeBlocks();
    if (codeBlocks.length === 0) {
      alert('No code blocks found in the conversation.');
      return;
    }

    await createAndDownloadZip(codeBlocks);
    
    // Update monthly downloads counter
    monthlyDownloads++;
    chrome.storage.local.set({
      downloads: monthlyDownloads,
      month: currentMonth,
      year: currentYear
    });
  });
}

// Extract code blocks from the page
function extractCodeBlocks() {
  const codeBlocks = [];
  const preElements = document.querySelectorAll('.markdown-content pre');
  let defaultFileCounter = 1;

  preElements.forEach((pre) => {
    const code = pre.textContent;
    let filename = '';

    // Check for filename in comment or previous element
    const previousElement = pre.previousElementSibling;
    if (previousElement && previousElement.textContent.includes('filename:')) {
      filename = previousElement.textContent.split('filename:')[1].trim();
    } else if (code.includes('# filename:')) {
      filename = code.split('# filename:')[1].split('\n')[0].trim();
    } else {
      // Auto-generate filename
      const extension = guessFileExtension(code);
      filename = `file${defaultFileCounter}${extension}`;
      defaultFileCounter++;
    }

    codeBlocks.push({ filename, code });
  });

  return codeBlocks;
}

// Guess file extension based on code content
function guessFileExtension(code) {
  if (code.includes('def ') || code.includes('import ')) return '.py';
  if (code.includes('function') || code.includes('const ')) return '.js';
  if (code.includes('<html') || code.includes('</')) return '.html';
  if (code.includes('{') && code.includes('}')) return '.json';
  return '.txt';
}

// Create and download zip file
async function createAndDownloadZip(codeBlocks) {
  const zip = new JSZip();
  
  // Add files to zip
  codeBlocks.forEach(({filename, code}) => {
    zip.file(filename, code);
  });

  // Generate zip filename
  const conversationTitle = document.title.replace('ChatGPT - ', '').replace(/[^a-z0-9]/gi, '_');
  const timestamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0];
  const zipFilename = `${conversationTitle}_${timestamp}.zip`;

  // Generate and download zip
  const content = await zip.generateAsync({type: 'blob'});
  const url = window.URL.createObjectURL(content);
  const a = document.createElement('a');
  a.href = url;
  a.download = zipFilename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', initializeFloatingButton);