// Check if site is offline (admin control)
async function checkSiteStatus() {
    try {
        const { data, error } = await supabaseClient
            .from('admin_settings')
            .select('site_offline')
            .limit(1)
            .maybeSingle();
        
        if (!error && data && data.site_offline === true) {
            // Redirect to 404 page (relative path for static hosting)
            window.location.href = '404.html';
        }
    } catch (err) {
        // If error, allow normal operation
        console.log('Status check:', err);
    }
}

// Run status check on page load
checkSiteStatus();

function showCodeEntry() {
    document.getElementById('mainCard').style.display = 'none';
    document.getElementById('codeEntryCard').style.display = 'block';
}

function goBack() {
    document.getElementById('mainCard').style.display = 'block';
    document.getElementById('codeEntryCard').style.display = 'none';
    document.getElementById('codeInput').value = ''; // Clear input
}

function showCodeEditor() {
    document.getElementById('mainCard').style.display = 'none';
    document.getElementById('codeEditorCard').style.display = 'block';
    document.getElementById('codeEditor').focus();
    updateLineNumbers();
    highlightCode();
    // Hide any previous share banner
    const banner = document.getElementById('shareBanner');
    if (banner) banner.style.display = 'none';
}

function goBackToMain() {
    document.getElementById('mainCard').style.display = 'block';
    document.getElementById('codeEditorCard').style.display = 'none';
    document.getElementById('codeEditor').value = ''; // Clear code editor
    document.getElementById('lineNumbers').innerHTML = ''; // Clear line numbers
    const banner = document.getElementById('shareBanner');
    if (banner) banner.style.display = 'none';
}

function updateLineNumbers() {
    const codeEditor = document.getElementById('codeEditor');
    const lineNumbers = document.getElementById('lineNumbers');
    const lines = codeEditor.value.split('\n').length;

    let lineNumbersHTML = '';
    for (let i = 1; i <= lines; i++) {
        lineNumbersHTML += i + '\n';
    }

    lineNumbers.textContent = lineNumbersHTML;
}

function syncScroll() {
    const codeEditor = document.getElementById('codeEditor');
    const lineNumbers = document.getElementById('lineNumbers');
    const codeHighlight = document.getElementById('codeHighlight');
    lineNumbers.scrollTop = codeEditor.scrollTop;
    if (codeHighlight) {
        codeHighlight.scrollTop = codeEditor.scrollTop;
        codeHighlight.scrollLeft = codeEditor.scrollLeft;
    }
}

function updateViewerLineNumbers() {
    const codeViewer = document.getElementById('codeViewer');
    const lineNumbers = document.getElementById('viewerLineNumbers');
    const lines = codeViewer.value.split('\n').length;

    let lineNumbersHTML = '';
    for (let i = 1; i <= lines; i++) {
        lineNumbersHTML += i + '\n';
    }

    lineNumbers.textContent = lineNumbersHTML;
}

function syncViewerScroll() {
    const codeViewer = document.getElementById('codeViewer');
    const lineNumbers = document.getElementById('viewerLineNumbers');
    lineNumbers.scrollTop = codeViewer.scrollTop;
}

function goBackFromViewer() {
    document.getElementById('mainCard').style.display = 'block';
    document.getElementById('codeViewerCard').style.display = 'none';
    document.getElementById('codeViewer').value = '';
    document.getElementById('codeInput').value = '';
}

function handleCodeInput() {
    const input = document.getElementById('codeInput');
    const errorDiv = document.getElementById('codeError');
    
    // Only allow numbers
    input.value = input.value.replace(/[^0-9]/g, '');
    
    // Hide error when user types
    if (errorDiv) {
        errorDiv.style.display = 'none';
    }
}

async function viewCode() {
    const shareCode = document.getElementById('codeInput').value.trim();
    const errorDiv = document.getElementById('codeError');
    
    if (shareCode.length !== 4) {
        errorDiv.textContent = 'Please enter a 4-digit code.';
        errorDiv.style.display = 'block';
        errorDiv.classList.add('shake');
        setTimeout(() => errorDiv.classList.remove('shake'), 300);
        return;
    }
    
    try {
        const { data, error } = await supabaseClient
            .from('code_snippets')
            .select('*')
            .eq('share_code', shareCode)
            .maybeSingle();
        
        if (error) throw error;
        
        if (!data) {
            errorDiv.textContent = 'Code not found. Please check the 4-digit code.';
            errorDiv.style.display = 'block';
            errorDiv.classList.add('shake');
            setTimeout(() => errorDiv.classList.remove('shake'), 300);
            return;
        }
        
        // Display the code
        document.getElementById('codeEntryCard').style.display = 'none';
        document.getElementById('codeViewerCard').style.display = 'block';
        document.getElementById('displayShareCode').textContent = shareCode;
        document.getElementById('codeViewer').value = data.code_content;
        updateViewerLineNumbers();

        // Populate meta info: datetime, tokens, lines
        try {
            const metaEl = document.getElementById('viewerMeta');
            const dtEl = document.getElementById('viewerDatetime');
            const tokensEl = document.getElementById('viewerTokens');
            const linesEl = document.getElementById('viewerLinesMeta');

            const codeText = data.code_content || '';
            const linesCount = codeText.split('\n').length;
            const tokensCount = countTokens(codeText);

            // Use user's local time
            const now = new Date();
            dtEl.textContent = now.toLocaleString();
            tokensEl.textContent = `${tokensCount} token${tokensCount===1?'':'s'}`;
            linesEl.textContent = `${linesCount} line${linesCount===1?'':'s'}`;
            metaEl.style.display = 'flex';
        } catch (_) { /* noop */ }
        
    } catch (err) {
        console.error('Error fetching code:', err);
        errorDiv.textContent = 'An error occurred. Please try again.';
        errorDiv.style.display = 'block';
    }
}

function countTokens(text) {
    const t = (text || '').trim();
    if (!t) return 0;
    return t.split(/\s+/).length;
}

async function copyToClipboard() {
    const codeViewer = document.getElementById('codeViewer');
    try {
        await navigator.clipboard.writeText(codeViewer.value);
        alert('Code copied to clipboard!');
    } catch (err) {
        // Fallback for older browsers / environments
        try {
            codeViewer.removeAttribute('readonly');
            codeViewer.select();
            document.execCommand('copy');
            codeViewer.setAttribute('readonly', '');
            alert('Code copied to clipboard!');
        } catch (e) {
            console.error('Copy failed:', e);
        }
    }
}

// Share banner helpers
function showShareBanner(code) {
    const banner = document.getElementById('shareBanner');
    const badge = document.getElementById('shareCodeBadge');
    badge.textContent = code;
    banner.style.display = 'flex';
    // trigger minimal entrance animation
    requestAnimationFrame(() => banner.classList.add('show'));
}

// Modal helpers
function showShareModal(code) {
    const m = document.getElementById('shareModal');
    const big = document.getElementById('bigShareCode');
    if (big) big.textContent = code;
    m.style.display = 'block';
    // ensure reflow before adding class for animation
    void m.offsetWidth;
    m.classList.add('open');
    m.setAttribute('aria-hidden', 'false');
}

function dismissShareModal(viaBackdrop) {
    const m = document.getElementById('shareModal');
    m.classList.remove('open');
    m.setAttribute('aria-hidden', 'true');
    // small delay to allow animation to finish
    setTimeout(() => { m.style.display = 'none'; goBackToMain(); }, 150);
}

async function copyShareCode() {
    const code = document.getElementById('shareCodeBadge').textContent;
    try { await navigator.clipboard.writeText(code); } catch (_) {}
}

function goToCopyFlow() {
    // Hide editor card, show entry card pre-filled with code
    const code = document.getElementById('shareCodeBadge').textContent;
    document.getElementById('codeEditorCard').style.display = 'none';
    document.getElementById('mainCard').style.display = 'none';
    document.getElementById('codeEntryCard').style.display = 'block';
    document.getElementById('codeInput').value = code;
    // auto trigger fetch
    handleCodeInput();
}

function handleTabKey(event) {
    if (event.key === 'Tab') {
        event.preventDefault();
        const codeEditor = document.getElementById('codeEditor');
        const start = codeEditor.selectionStart;
        const end = codeEditor.selectionEnd;

        // Insert 4 spaces instead of tab
        codeEditor.value = codeEditor.value.substring(0, start) + '    ' + codeEditor.value.substring(end);

        // Move cursor to after the inserted spaces
        codeEditor.selectionStart = codeEditor.selectionEnd = start + 4;
    }
}

// Syntax highlighting function
function highlightCode() {
    const codeEditor = document.getElementById('codeEditor');
    const codeHighlight = document.getElementById('codeHighlight');
    const code = codeEditor.value;

    if (!code) {
        codeHighlight.innerHTML = '';
        return;
    }

    let highlighted = escapeHtml(code);

    // Keywords
    const keywords = /\b(function|const|let|var|if|else|for|while|return|class|import|export|from|async|await|try|catch|throw|new|this|super|extends|static|get|set|typeof|instanceof|delete|void|yield|in|of|do|switch|case|break|continue|default|with|debugger|true|false|null|undefined)\b/g;
    highlighted = highlighted.replace(keywords, '<span class="token keyword">$1</span>');

    // Strings (including template literals)
    const strings = /(`(?:\\.|[^`\\])*`|"([^"\\]|\\.)*"|'([^'\\]|\\.)*')/g;
    highlighted = highlighted.replace(strings, '<span class="token string">$1</span>');

    // Comments (both single line and multi-line)
    const comments = /(\/\/.*$|\/\*[\s\S]*?\*\/) /gm;
    highlighted = highlighted.replace(comments, '<span class="token comment">$1</span>');

    // Numbers (including decimals, hex, binary, octal)
    const numbers = /\b(?:0[xX][0-9a-fA-F]+|0[bB][01]+|0[oO][0-7]+|\d+\.?\d*(?:[eE][+-]?\d+)?)\b/g;
    highlighted = highlighted.replace(numbers, '<span class="token number">$1</span>');

    // Functions (including method definitions)
    const functions = /\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*(?=\()/g;
    highlighted = highlighted.replace(functions, '<span class="token function">$1</span>');

    // Properties/Methods (dot notation)
    const properties = /(\.)\s*([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
    highlighted = highlighted.replace(properties, '$1<span class="token property">$2</span>');

    // Variables (const/let/var declarations)
    const variables = /\b(?:const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\b/g;
    highlighted = highlighted.replace(variables, '<span class="token keyword">$1</span> <span class="token variable">$2</span>');

    // Class names
    const classes = /\bclass\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\b/g;
    highlighted = highlighted.replace(classes, '<span class="token keyword">class</span> <span class="token class-name">$1</span>');

    // Constants (uppercase identifiers)
    const constants = /\b([A-Z][A-Z0-9_]*)\b/g;
    highlighted = highlighted.replace(constants, '<span class="token constant">$1</span>');

    // Operators
    const operators = /(\+|\-|\*|\/|%|=|==|===|!=|!==|>|>=|<|<=|&&|\|\||!|\?|:|\.\.\.|\.|\[|\]|\(|\)|\{|\}|\||&|~|\^)/g;
    highlighted = highlighted.replace(operators, '<span class="token operator">$1</span>');

    // Punctuation
    const punctuation = /(,|;)/g;
    highlighted = highlighted.replace(punctuation, '<span class="token punctuation">$1</span>');

    codeHighlight.innerHTML = '<code>' + highlighted + '</code>';
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

async function sendCode() {
    const code = document.getElementById('codeEditor').value.trim();
    if (!code) {
        alert('Please enter some code before sending.');
        return;
    }
    
    const sendBtn = document.getElementById('sendBtn');
    sendBtn.disabled = true;
    sendBtn.textContent = 'Sending...';
    
    try {
        // Generate a unique 4-digit code
        let shareCode;
        let isUnique = false;
        
        while (!isUnique) {
            shareCode = String(Math.floor(1000 + Math.random() * 9000));
            
            const { data: existing } = await supabaseClient
                .from('code_snippets')
                .select('share_code')
                .eq('share_code', shareCode)
                .maybeSingle();
            
            if (!existing) {
                isUnique = true;
            }
        }
        
        // Insert the code into database
        const { error } = await supabaseClient
            .from('code_snippets')
            .insert([{
                share_code: shareCode,
                code_content: code
            }]);
        
        if (error) throw error;
        
        // Show success and share code
        showShareModal(shareCode);
        
    } catch (err) {
        console.error('Error sending code:', err);
        alert('Failed to send code. Please try again.');
    } finally {
        sendBtn.disabled = false;
        sendBtn.textContent = 'Send Code';
    }
}
