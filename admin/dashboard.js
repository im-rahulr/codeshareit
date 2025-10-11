// Check authentication
if (localStorage.getItem('adminAuthenticated') !== 'true') {
    window.location.href = 'index.html';
}

// Set admin name
const adminUsername = localStorage.getItem('adminUsername') || 'Admin';
document.getElementById('adminName').textContent = adminUsername;
document.getElementById('adminInitial').textContent = adminUsername.charAt(0).toUpperCase();

// Global variables
let allCodes = [];
let siteStatus = false;
let schemaRetryCount = 0;
const SCHEMA_MAX_RETRIES = 3;
const SCHEMA_RETRY_DELAY_MS = 2500;

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    await loadDashboardData();
    await loadSiteStatus();
    await loadAdminSettings();
    document.getElementById('supabaseUrl').textContent = SUPABASE_URL;
});

// View Switching
function switchView(viewName) {
    // Update nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`[data-view="${viewName}"]`).classList.add('active');

    // Update views
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
    });
    document.getElementById(`${viewName}View`).classList.add('active');

    // Load data based on view
    if (viewName === 'codes') {
        loadCodes();
    }
}

// Toggle Sidebar (Mobile)
function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
}

// Logout
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('adminAuthenticated');
        localStorage.removeItem('adminUsername');
        window.location.href = 'index.html';
    }
}

// Dashboard Data
async function loadDashboardData() {
    try {
        // Fetch all code snippets
        const { data, error } = await supabaseClient
            .from('code_snippets')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        allCodes = data || [];

        // Calculate statistics
        const totalCodes = allCodes.length;
        let totalTokens = 0;
        let totalLines = 0;
        let todayActivity = 0;

        const today = new Date().toDateString();

        allCodes.forEach(code => {
            // Count tokens (approximate: split by whitespace)
            const tokens = code.code_content.split(/\s+/).filter(t => t.length > 0).length;
            totalTokens += tokens;

            // Count lines
            const lines = code.code_content.split('\n').length;
            totalLines += lines;

            // Count today's activity
            if (code.created_at && new Date(code.created_at).toDateString() === today) {
                todayActivity++;
            }
        });

        // Update stats
        document.getElementById('totalCodes').textContent = totalCodes;
        document.getElementById('totalTokens').textContent = totalTokens.toLocaleString();
        document.getElementById('totalLines').textContent = totalLines.toLocaleString();
        document.getElementById('recentActivity').textContent = todayActivity;

        // Update activity list
        updateActivityList(allCodes.slice(0, 5));

    } catch (err) {
        console.error('Error loading dashboard data:', err);
    }
}

// Update Activity List
function updateActivityList(codes) {
    const activityList = document.getElementById('activityList');
    
    if (codes.length === 0) {
        activityList.innerHTML = `
            <div class="empty-state">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                </svg>
                <p>No recent activity</p>
            </div>
        `;
        return;
    }

    activityList.innerHTML = codes.map(code => {
        const tokens = code.code_content.split(/\s+/).filter(t => t.length > 0).length;
        const lines = code.code_content.split('\n').length;
        const date = code.created_at ? new Date(code.created_at).toLocaleString() : 'Unknown';

        return `
            <div class="code-item">
                <div class="code-item-header">
                    <div class="code-item-info">
                        <span class="code-badge">${code.share_code}</span>
                        <div class="code-stats">
                            <span>${tokens} tokens</span>
                            <span>·</span>
                            <span>${lines} lines</span>
                            <span>·</span>
                            <span>${date}</span>
                        </div>
                    </div>
                    <div class="code-item-actions">
                        <button class="icon-btn" onclick="viewCodeModal('${code.share_code}')">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                            View
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Load Codes
async function loadCodes() {
    const codeList = document.getElementById('codeList');
    codeList.innerHTML = `
        <div class="loading-state">
            <div class="spinner-large"></div>
            <p>Loading codes...</p>
        </div>
    `;

    try {
        const { data, error } = await supabaseClient
            .from('code_snippets')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        allCodes = data || [];
        displayCodes(allCodes);

    } catch (err) {
        console.error('Error loading codes:', err);
        codeList.innerHTML = `
            <div class="empty-state">
                <p style="color: #ff3b30;">Error loading codes. Please try again.</p>
            </div>
        `;
    }
}

// Display Codes
function displayCodes(codes) {
    const codeList = document.getElementById('codeList');

    if (codes.length === 0) {
        codeList.innerHTML = `
            <div class="empty-state">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <polyline points="16 18 22 12 16 6"></polyline>
                    <polyline points="8 6 2 12 8 18"></polyline>
                </svg>
                <p>No code snippets found</p>
            </div>
        `;
        return;
    }

    codeList.innerHTML = codes.map(code => {
        const tokens = code.code_content.split(/\s+/).filter(t => t.length > 0).length;
        const lines = code.code_content.split('\n').length;
        const date = code.created_at ? new Date(code.created_at).toLocaleString() : 'Unknown';
        const preview = code.code_content.substring(0, 200);

        return `
            <div class="code-item" data-code="${code.share_code}">
                <div class="code-item-header">
                    <div class="code-item-info">
                        <span class="code-badge">${code.share_code}</span>
                        <div class="code-stats">
                            <span>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <line x1="12" y1="2" x2="12" y2="22"></line>
                                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                                </svg>
                                ${tokens} tokens
                            </span>
                            <span>·</span>
                            <span>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                    <polyline points="14 2 14 8 20 8"></polyline>
                                </svg>
                                ${lines} lines
                            </span>
                            <span>·</span>
                            <span>${date}</span>
                        </div>
                    </div>
                    <div class="code-item-actions">
                        <button class="icon-btn" onclick="viewCodeModal('${code.share_code}')">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                            View
                        </button>
                        <button class="icon-btn" onclick="copyCode('${code.share_code}')">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                            </svg>
                            Copy
                        </button>
                        <button class="icon-btn delete-btn" onclick="deleteCode('${code.share_code}')">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                            Delete
                        </button>
                    </div>
                </div>
                <div class="code-preview-snippet">${escapeHtml(preview)}${preview.length < code.code_content.length ? '...' : ''}</div>
            </div>
        `;
    }).join('');
}

// Filter Codes
function filterCodes() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
    
    if (!searchTerm) {
        displayCodes(allCodes);
        return;
    }

    const filtered = allCodes.filter(code => {
        const tokens = code.code_content.split(/\s+/).filter(t => t.length > 0).length;
        return (
            code.share_code.toLowerCase().includes(searchTerm) ||
            code.code_content.toLowerCase().includes(searchTerm) ||
            tokens.toString().includes(searchTerm)
        );
    });

    displayCodes(filtered);
}

// View Code Modal
function viewCodeModal(shareCode) {
    const code = allCodes.find(c => c.share_code === shareCode);
    if (!code) return;

    const tokens = code.code_content.split(/\s+/).filter(t => t.length > 0).length;
    const lines = code.code_content.split('\n').length;

    document.getElementById('modalShareCode').textContent = code.share_code;
    document.getElementById('modalTokens').textContent = tokens;
    document.getElementById('modalLines').textContent = lines;
    document.getElementById('modalCodeContent').textContent = code.code_content;

    // Store current code for copying
    window.currentModalCode = code.code_content;

    document.getElementById('codeModal').style.display = 'block';
}

// Close Code Modal
function closeCodeModal() {
    document.getElementById('codeModal').style.display = 'none';
}

// Copy Modal Code
async function copyModalCode() {
    try {
        await navigator.clipboard.writeText(window.currentModalCode || '');
        alert('Code copied to clipboard!');
    } catch (err) {
        console.error('Copy failed:', err);
    }
}

// Copy Code
async function copyCode(shareCode) {
    const code = allCodes.find(c => c.share_code === shareCode);
    if (!code) return;

    try {
        await navigator.clipboard.writeText(code.code_content);
        alert('Code copied to clipboard!');
    } catch (err) {
        console.error('Copy failed:', err);
    }
}

// Delete Code
async function deleteCode(shareCode) {
    if (!confirm(`Are you sure you want to delete code ${shareCode}? This action cannot be undone.`)) {
        return;
    }

    try {
        const { error } = await supabaseClient
            .from('code_snippets')
            .delete()
            .eq('share_code', shareCode);

        if (error) throw error;

        alert('Code deleted successfully!');
        await loadCodes();
        await loadDashboardData();

    } catch (err) {
        console.error('Error deleting code:', err);
        alert('Failed to delete code. Please try again.');
    }
}

// Site Status Toggle
async function loadSiteStatus() {
    try {
        const { data, error } = await supabaseClient
            .from('admin_settings')
            .select('site_offline')
            .limit(1)
            .maybeSingle();

        if (!error && data) {
            siteStatus = data.site_offline || false;
            document.getElementById('siteStatusToggle').checked = siteStatus;
            document.getElementById('siteStatusToggle').disabled = false;
            updateStatusIndicator();
        } else if (error && (error.code === '42P01' || isSchemaCacheError(error))) {
            // Table doesn't exist - disable toggle and show setup instructions
            disableSiteToggleWithSetup();
        } else {
            siteStatus = false;
            document.getElementById('siteStatusToggle').checked = siteStatus;
            updateStatusIndicator();
        }

    } catch (err) {
        console.error('Error loading site status:', err);
        if (isSchemaCacheError(err) && schemaRetryCount < SCHEMA_MAX_RETRIES) {
            schemaRetryCount++;
            showNotice(`Supabase schema is refreshing… retry ${schemaRetryCount}/${SCHEMA_MAX_RETRIES}.`);
            setTimeout(() => loadSiteStatus(), SCHEMA_RETRY_DELAY_MS);
        } else {
            // After all retries, assume table is missing
            disableSiteToggleWithSetup();
        }
    }
}

function disableSiteToggleWithSetup() {
    const toggle = document.getElementById('siteStatusToggle');
    if (toggle) {
        toggle.disabled = true;
        toggle.checked = false;
    }
    
    const statusText = document.querySelector('.status-text');
    if (statusText) {
        statusText.textContent = 'Setup Required';
    }
    
    const statusDot = document.querySelector('.status-dot');
    if (statusDot) {
        statusDot.className = 'status-dot';
        statusDot.style.background = '#fbbf24';
    }
    
    showNotice(`
        <b>Setup Required:</b> Table <code>admin_settings</code> not found.<br/><br/>
        <b>Fix:</b> Run this SQL in your Supabase SQL Editor, then refresh this page:<br/>
        <button onclick="copySql()" style="margin-top:8px; padding:8px 16px; background:#667eea; color:white; border:none; border-radius:8px; cursor:pointer; font-weight:600;">
            📋 Copy Setup SQL
        </button>
        <button onclick="showSetupModal()" style="margin-top:8px; margin-left:8px; padding:8px 16px; background:#10b981; color:white; border:none; border-radius:8px; cursor:pointer; font-weight:600;">
            📖 View SQL
        </button>
    `);
}

async function toggleSiteStatus() {
    const toggle = document.getElementById('siteStatusToggle');
    siteStatus = toggle.checked;

    try {
        // Fetch existing record (if any)
        const { data: existing, error: readErr } = await supabaseClient
            .from('admin_settings')
            .select('id, username, password')
            .limit(1)
            .maybeSingle();

        if (readErr && readErr.code === '42P01') {
            // Table missing – try to seed with default row via upsert
            const { error: seedErr } = await supabaseClient
                .from('admin_settings')
                .insert([{ username: 'admin', password: 'admin123', site_offline: siteStatus }]);
            if (seedErr) throw seedErr;
        } else {
            // Use upsert so it works whether row exists or not
            const payload = {
                // If we have an id, include it so upsert updates
                ...(existing && existing.id ? { id: existing.id } : {}),
                username: (existing && existing.username) ? existing.username : (adminUsername || 'admin'),
                password: (existing && existing.password) ? existing.password : 'admin123',
                site_offline: siteStatus
            };

            const { error: upsertErr } = await supabaseClient
                .from('admin_settings')
                .upsert([payload])
                .select();

            if (upsertErr) throw upsertErr;
        }

        updateStatusIndicator();

    } catch (err) {
        console.error('Error updating site status:', err);
        toggle.checked = !siteStatus; // Revert toggle
        if (isSchemaCacheError(err) && schemaRetryCount < SCHEMA_MAX_RETRIES) {
            schemaRetryCount++;
            showNotice(`Supabase schema is refreshing… retry ${schemaRetryCount}/${SCHEMA_MAX_RETRIES}.`);
            setTimeout(() => toggleSiteStatus(), SCHEMA_RETRY_DELAY_MS);
        } else {
            const msg = (err && err.message) ? err.message : 'Failed to update site status. Please try again.';
            showNotice(`${msg}<br/><br/>Tips:<br/>- Ensure table <b>admin_settings</b> exists (see admin/README.md)<br/>- Verify RLS policy allows insert/update`);
        }
    }
}

function updateStatusIndicator() {
    const statusDot = document.querySelector('.status-dot');
    const statusText = document.querySelector('.status-text');

    if (siteStatus) {
        statusDot.classList.remove('active');
        statusDot.classList.add('inactive');
        statusText.textContent = 'Site is Offline (404 Mode)';
    } else {
        statusDot.classList.remove('inactive');
        statusDot.classList.add('active');
        statusText.textContent = 'Site is Online';
    }
}

// Inline notice helpers
function showNotice(html) {
    const bar = document.getElementById('noticeBar');
    const msg = document.getElementById('noticeMessage');
    if (!bar || !msg) return;
    msg.innerHTML = html;
    bar.style.display = 'block';
}

function hideNotice() {
    const bar = document.getElementById('noticeBar');
    if (bar) bar.style.display = 'none';
}

function isSchemaCacheError(err) {
    if (!err) return false;
    const txt = (err.message || '').toLowerCase();
    return txt.includes('schema cache') || txt.includes('could not find the table') || txt.includes('42p01');
}

// SQL setup helper
const SETUP_SQL = `-- CodeShareit Admin Setup SQL
-- Run this in Supabase SQL Editor (SQL Editor tab)

-- 1) Enable required extension
create extension if not exists pgcrypto;

-- 2) Create admin_settings table
create table if not exists admin_settings (
  id uuid primary key default gen_random_uuid(),
  username text not null,
  password text not null,
  site_offline boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3) Enable Row Level Security
alter table admin_settings enable row level security;

-- 4) Create permissive policy (for development)
drop policy if exists "Allow all operations on admin_settings" on admin_settings;
create policy "Allow all operations on admin_settings"
on admin_settings for all
using (true)
with check (true);

-- 5) Insert default admin credentials
insert into admin_settings (username, password, site_offline)
values ('admin', 'admin123', false)
on conflict do nothing;

-- 6) Verify code_snippets table exists
create table if not exists code_snippets (
  id uuid primary key default gen_random_uuid(),
  share_code text unique not null,
  code_content text not null,
  created_at timestamptz default now()
);

alter table code_snippets enable row level security;

drop policy if exists "Allow public access to code_snippets" on code_snippets;
create policy "Allow public access to code_snippets"
on code_snippets for all
using (true)
with check (true);

-- Done! Wait 30 seconds, then hard refresh your admin panel.
`;

async function copySql() {
    try {
        await navigator.clipboard.writeText(SETUP_SQL);
        showNotice('✅ SQL copied! Paste in Supabase SQL Editor, run it, wait 30 seconds, then refresh this page.');
    } catch (err) {
        alert('Could not copy. Please use the View SQL button instead.');
    }
}

function showSetupModal() {
    const modal = document.getElementById('codeModal');
    if (!modal) return;
    
    document.getElementById('modalTitle').textContent = 'Database Setup SQL';
    document.getElementById('modalShareCode').textContent = 'SETUP';
    document.getElementById('modalTokens').textContent = 'Required';
    document.getElementById('modalLines').textContent = SETUP_SQL.split('\n').length;
    document.getElementById('modalCodeContent').textContent = SETUP_SQL;
    
    window.currentModalCode = SETUP_SQL;
    modal.style.display = 'block';
}

// Settings
async function loadAdminSettings() {
    try {
        const { data, error } = await supabaseClient
            .from('admin_settings')
            .select('username, password')
            .limit(1)
            .maybeSingle();

        if (!error && data) {
            document.getElementById('newUsername').value = data.username || '';
            document.getElementById('newPassword').value = data.password || '';
            document.getElementById('confirmPassword').value = data.password || '';
        }

    } catch (err) {
        console.error('Error loading settings:', err);
    }
}

async function updateCredentials(event) {
    event.preventDefault();

    const username = document.getElementById('newUsername').value.trim();
    const password = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const messageEl = document.getElementById('settingsMessage');

    // Validation
    if (!username || !password) {
        messageEl.textContent = 'Username and password are required.';
        messageEl.className = 'settings-message error';
        messageEl.style.display = 'block';
        return;
    }

    if (password !== confirmPassword) {
        messageEl.textContent = 'Passwords do not match.';
        messageEl.className = 'settings-message error';
        messageEl.style.display = 'block';
        return;
    }

    if (password.length < 6) {
        messageEl.textContent = 'Password must be at least 6 characters.';
        messageEl.className = 'settings-message error';
        messageEl.style.display = 'block';
        return;
    }

    try {
        // Check if settings exist
        const { data: existing } = await supabaseClient
            .from('admin_settings')
            .select('id')
            .limit(1)
            .maybeSingle();

        if (existing) {
            // Update existing
            const { error } = await supabaseClient
                .from('admin_settings')
                .update({ username, password })
                .eq('id', existing.id);

            if (error) throw error;
        } else {
            // Insert new
            const { error } = await supabaseClient
                .from('admin_settings')
                .insert([{
                    username,
                    password,
                    site_offline: false
                }]);

            if (error) throw error;
        }

        // Update local storage
        localStorage.setItem('adminUsername', username);
        document.getElementById('adminName').textContent = username;
        document.getElementById('adminInitial').textContent = username.charAt(0).toUpperCase();

        messageEl.textContent = 'Settings updated successfully!';
        messageEl.className = 'settings-message success';
        messageEl.style.display = 'block';

        setTimeout(() => {
            messageEl.style.display = 'none';
        }, 3000);

    } catch (err) {
        console.error('Error updating settings:', err);
        messageEl.textContent = 'Failed to update settings. Please try again.';
        messageEl.className = 'settings-message error';
        messageEl.style.display = 'block';
    }
}

// Utility function
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// Close modal on outside click
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-backdrop')) {
        closeCodeModal();
    }
});

// Close modal on ESC key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeCodeModal();
    }
});
