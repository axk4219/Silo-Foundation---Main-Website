/* ============================================
   Admin Panel Logic
   Manages content via JSON data files + n8n webhooks
   ============================================ */

const Admin = {
  // --- CONFIG ---
  // Password hash (SHA-256 of "silo2026") — change this to the client's password
  PASSWORD_HASH: '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918',
  // n8n webhook URL for content updates
  WEBHOOK_URL: 'https://n8n.srv1426838.hstgr.cloud/webhook/silo-admin-save',
  // n8n webhook URL for image uploads
  IMAGE_WEBHOOK_URL: 'https://n8n.srv1426838.hstgr.cloud/webhook/silo-admin-upload',

  data: {},
  currentSection: 'events',
  editingId: null,

  // --- Form field definitions per section ---
  fields: {
    events: [
      { key: 'title', label: 'Event Title', type: 'text', required: true },
      { key: 'date', label: 'Date', type: 'date', required: true },
      { key: 'time', label: 'Time', type: 'text', placeholder: 'e.g. 2:00 PM - 10:00 PM' },
      { key: 'location', label: 'Location', type: 'text' },
      { key: 'description', label: 'Description', type: 'textarea', required: true },
      { key: 'image', label: 'Image URL', type: 'text', placeholder: 'Paste image URL or upload below', hint: 'Recommended: 800 x 500px (landscape)' },
      { key: 'link', label: 'Ticket / Event Link', type: 'text' },
      { key: 'featured', label: 'Featured on Homepage?', type: 'select', options: ['false', 'true'] }
    ],
    gallery: [
      { key: 'title', label: 'Event Title', type: 'text', required: true },
      { key: 'date', label: 'Date', type: 'date', required: true },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'images', label: 'Image URLs (one per line)', type: 'textarea', placeholder: 'Paste one URL per line', hint: 'Recommended: 800 x 600px per photo' }
    ],
    merch: [
      { key: 'name', label: 'Product Name', type: 'text', required: true },
      { key: 'price', label: 'Price', type: 'text', required: true, placeholder: 'e.g. $25' },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'image', label: 'Image URL', type: 'text', hint: 'Recommended: 600 x 600px (square)' },
      { key: 'link', label: 'Order Link', type: 'text' }
    ],
    team: [
      { key: 'name', label: 'Full Name', type: 'text', required: true },
      { key: 'role', label: 'Role / Title', type: 'text', required: true },
      { key: 'photo', label: 'Photo URL', type: 'text', hint: 'Recommended: 400 x 400px (square)' },
      { key: 'bio', label: 'Bio', type: 'textarea' }
    ],
    sponsors: [
      { key: 'name', label: 'Sponsor Name', type: 'text', required: true },
      { key: 'image', label: 'Logo Image', type: 'text', placeholder: 'Upload sponsor logo below', hint: 'Recommended: 600 x 400px (3:2 ratio)' },
      { key: 'url', label: 'Website URL', type: 'text', placeholder: 'https://...' }
    ],
    resources: [
      { key: 'title', label: 'Resource Title', type: 'text', required: true },
      { key: 'description', label: 'Description', type: 'textarea', required: true },
      { key: 'url', label: 'Link URL', type: 'text', placeholder: 'https://...' }
    ],
    hero: [
      { key: 'image', label: 'Background Image URL', type: 'text', hint: 'Recommended: 1920 x 1080px (full-width banner)' },
      { key: 'heading', label: 'Heading Text', type: 'text' },
      { key: 'subheading', label: 'Subheading Text', type: 'text' },
      { key: 'storyImage', label: 'Story Section Image (About page only)', type: 'text', hint: 'Recommended: 800 x 600px. Only used on the About page.' }
    ]
  },

  // --- INIT ---
  async init() {
    this.bindLogin();
    this.bindTabs();
    this.bindModal();

    // Check if already logged in this session
    if (sessionStorage.getItem('silo_admin') === 'true') {
      this.showPanel();
    }
  },

  // --- AUTH ---
  bindLogin() {
    const btn = document.getElementById('loginBtn');
    const input = document.getElementById('loginPassword');
    const error = document.getElementById('loginError');

    const attempt = async () => {
      const hash = await this.sha256(input.value);
      if (hash === this.PASSWORD_HASH) {
        sessionStorage.setItem('silo_admin', 'true');
        this.showPanel();
      } else {
        error.style.display = 'block';
        input.value = '';
        input.focus();
      }
    };

    btn.addEventListener('click', attempt);
    input.addEventListener('keydown', e => { if (e.key === 'Enter') attempt(); });

    document.getElementById('logoutBtn').addEventListener('click', () => {
      sessionStorage.removeItem('silo_admin');
      location.reload();
    });
  },

  async sha256(str) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
  },

  showPanel() {
    document.getElementById('loginGate').style.display = 'none';
    document.getElementById('adminPanel').classList.add('active');
    this.loadAllData();
  },

  // --- DATA LOADING ---
  async loadAllData() {
    const files = ['events', 'gallery', 'merch', 'team', 'sponsors', 'resources', 'hero'];
    await Promise.all(files.map(async f => {
      try {
        const res = await fetch(`data/${f}.json?t=${Date.now()}`);
        this.data[f] = await res.json();
      } catch (e) {
        this.data[f] = f === 'hero' ? {} : [];
      }
    }));
    this.renderAll();
  },

  renderAll() {
    this.renderItems('events');
    this.renderItems('gallery');
    this.renderItems('merch');
    this.renderItems('team');
    this.renderItems('sponsors');
    this.renderItems('resources');
    this.renderHero();
  },

  // --- TABS ---
  bindTabs() {
    document.querySelectorAll('.admin-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
        tab.classList.add('active');
        const section = tab.dataset.tab;
        document.getElementById(`section-${section}`).classList.add('active');
        this.currentSection = section;
      });
    });
  },

  // --- RENDER ITEM LISTS ---
  renderItems(section) {
    const container = document.getElementById(`items-${section}`);
    if (!container) return;
    const items = this.data[section] || [];

    if (!items.length) {
      container.innerHTML = '<div class="admin-empty"><p>No items yet. Click the button above to add one.</p></div>';
      return;
    }

    container.innerHTML = items.map(item => {
      const img = item.image || item.photo || (item.images && item.images[0]) || '';
      const title = item.title || item.name || '';
      const meta = item.date ? this.formatDate(item.date) : (item.role || item.price || item.url || '');

      return `
        <div class="admin-item">
          ${img ? `<img class="admin-item__img" src="${img}" alt="${title}">` : '<div class="admin-item__img"></div>'}
          <div class="admin-item__info">
            <div class="admin-item__title">${title}</div>
            <div class="admin-item__meta">${meta}</div>
          </div>
          <div class="admin-item__actions">
            <button class="btn-edit" onclick="Admin.openForm('${section}', '${item.id}')">Edit</button>
            <button class="btn-delete" onclick="Admin.deleteItem('${section}', '${item.id}')">Delete</button>
          </div>
        </div>
      `;
    }).join('');
  },

  renderHero() {
    const container = document.getElementById('items-hero');
    if (!container) return;
    const hero = this.data.hero || {};
    const pages = Object.keys(hero);

    container.innerHTML = pages.map(page => {
      const h = hero[page];
      return `
        <div class="admin-item">
          ${h.image ? `<img class="admin-item__img" src="${h.image}" alt="${page}">` : '<div class="admin-item__img"></div>'}
          <div class="admin-item__info">
            <div class="admin-item__title">${page.charAt(0).toUpperCase() + page.slice(1)} Page</div>
            <div class="admin-item__meta">${h.heading || 'No heading set'}</div>
          </div>
          <div class="admin-item__actions">
            <button class="btn-edit" onclick="Admin.openHeroForm('${page}')">Edit</button>
          </div>
        </div>
      `;
    }).join('');
  },

  formatDate(dateStr) {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  },

  // --- MODAL / FORM ---
  bindModal() {
    document.getElementById('adminModal').addEventListener('click', e => {
      if (e.target.id === 'adminModal') this.closeForm();
    });
  },

  openForm(section, editId = null) {
    this.currentSection = section;
    this.editingId = editId;

    const fields = this.fields[section];
    const item = editId ? (this.data[section] || []).find(i => i.id === editId) : null;
    const isEdit = !!item;

    document.getElementById('modalTitle').textContent = isEdit
      ? `Edit ${section.charAt(0).toUpperCase() + section.slice(1).replace(/s$/, '')}`
      : `Add ${section.charAt(0).toUpperCase() + section.slice(1).replace(/s$/, '')}`;

    const form = document.getElementById('adminForm');
    form.innerHTML = fields.map(f => {
      let value = item ? (item[f.key] || '') : '';
      // For gallery images array, join to multiline string
      if (f.key === 'images' && Array.isArray(value)) value = value.join('\n');

      if (f.type === 'textarea') {
        // Gallery images get upload support too
        const isImages = f.key === 'images';
        return `<div class="form-group">
          <label>${f.label}${f.required ? ' *' : ''}</label>
          <textarea id="field-${f.key}" placeholder="${f.placeholder || ''}" ${f.required ? 'required' : ''}>${value}</textarea>
          ${isImages ? `<div class="upload-zone" data-target="field-${f.key}" data-multi="true">
            <p>Drop images here or <label class="upload-link">browse<input type="file" accept="image/*" multiple hidden></label></p>
          </div>` : ''}
          ${f.hint ? `<div class="form-hint">${f.hint}</div>` : ''}
        </div>`;
      }
      if (f.type === 'select') {
        return `<div class="form-group">
          <label>${f.label}</label>
          <select id="field-${f.key}">
            ${f.options.map(o => `<option value="${o}" ${value.toString() === o ? 'selected' : ''}>${o}</option>`).join('')}
          </select>
        </div>`;
      }
      // Add upload button for image/photo fields
      const isImageField = ['image', 'photo'].includes(f.key);
      return `<div class="form-group">
        <label>${f.label}${f.required ? ' *' : ''}</label>
        <input type="${f.type}" id="field-${f.key}" value="${value}" placeholder="${f.placeholder || ''}" ${f.required ? 'required' : ''}>
        ${isImageField ? `<div class="upload-zone" data-target="field-${f.key}">
          <p>Drop image here or <label class="upload-link">browse<input type="file" accept="image/*" hidden></label></p>
        </div>
        ${f.hint ? `<div class="form-hint">${f.hint}</div>` : ''}
        <div class="upload-preview" id="preview-${f.key}">${value ? `<img src="${value}" alt="preview"><button type="button" class="btn-remove-img" onclick="Admin.removeImage('${f.key}')">Remove Image</button>` : ''}</div>` : `${f.hint ? `<div class="form-hint">${f.hint}</div>` : ''}`}
      </div>`;
    }).join('');

    this.bindUploads();
    document.getElementById('adminModal').classList.add('active');
  },

  openHeroForm(page) {
    this.currentSection = 'hero';
    this.editingId = page;

    const hero = this.data.hero[page] || {};
    const fields = this.fields.hero;

    document.getElementById('modalTitle').textContent = `Edit ${page.charAt(0).toUpperCase() + page.slice(1)} Hero`;

    const form = document.getElementById('adminForm');
    form.innerHTML = fields.map(f => {
      const value = hero[f.key] || '';
      const isImageField = ['image', 'storyImage'].includes(f.key);
      return `<div class="form-group">
        <label>${f.label}</label>
        <input type="text" id="field-${f.key}" value="${value}" placeholder="">
        ${isImageField ? `<div class="upload-zone" data-target="field-${f.key}">
          <p>Drop image here or <label class="upload-link">browse<input type="file" accept="image/*" hidden></label></p>
        </div>
        ${f.hint ? `<div class="form-hint">${f.hint}</div>` : ''}
        <div class="upload-preview" id="preview-${f.key}">${value ? `<img src="${value}" alt="preview"><button type="button" class="btn-remove-img" onclick="Admin.removeImage('${f.key}')">Remove Image</button>` : ''}</div>` : ''}
      </div>`;
    }).join('');

    this.bindUploads();
    document.getElementById('adminModal').classList.add('active');
  },

  // --- IMAGE UPLOAD ---
  bindUploads() {
    document.querySelectorAll('.upload-zone').forEach(zone => {
      const targetId = zone.dataset.target;
      const isMulti = zone.dataset.multi === 'true';
      const fileInput = zone.querySelector('input[type="file"]');

      // Drag & drop
      zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('dragover'); });
      zone.addEventListener('dragleave', () => zone.classList.remove('dragover'));
      zone.addEventListener('drop', e => {
        e.preventDefault();
        zone.classList.remove('dragover');
        const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
        if (files.length) this.uploadFiles(files, targetId, isMulti);
      });

      // File picker
      fileInput.addEventListener('change', () => {
        const files = Array.from(fileInput.files);
        if (files.length) this.uploadFiles(files, targetId, isMulti);
        fileInput.value = '';
      });
    });
  },

  async uploadFiles(files, targetId, isMulti) {
    const input = document.getElementById(targetId);
    const preview = document.getElementById('preview-' + targetId.replace('field-', ''));

    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);

      try {
        const res = await fetch(this.IMAGE_WEBHOOK_URL, { method: 'POST', body: formData });
        if (!res.ok) throw new Error('Upload failed');
        const data = await res.json();

        if (isMulti) {
          // Append URL to textarea (one per line)
          input.value = input.value ? input.value.trim() + '\n' + data.url : data.url;
        } else {
          input.value = data.url;
          const fieldKey = targetId.replace('field-', '');
          if (preview) preview.innerHTML = `<img src="${data.url}" alt="preview"><button type="button" class="btn-remove-img" onclick="Admin.removeImage('${fieldKey}')">Remove Image</button>`;
        }
        this.toast('Image uploaded!');
      } catch (e) {
        this.toast('Upload failed. Please try again.', true);
      }
    }
  },

  closeForm() {
    document.getElementById('adminModal').classList.remove('active');
    this.editingId = null;
  },

  // --- SAVE ---
  async saveItem() {
    const section = this.currentSection;
    const fields = this.fields[section];

    // Collect form values
    const values = {};
    for (const f of fields) {
      let val = document.getElementById(`field-${f.key}`).value.trim();
      // Parse special types
      if (f.key === 'images') val = val.split('\n').map(s => s.trim()).filter(Boolean);
      if (f.key === 'featured') val = val === 'true';
      values[f.key] = val;
    }

    // Handle hero separately
    if (section === 'hero') {
      this.data.hero[this.editingId] = { ...this.data.hero[this.editingId], ...values };
    } else {
      if (this.editingId) {
        // Update existing
        const idx = this.data[section].findIndex(i => i.id === this.editingId);
        if (idx !== -1) this.data[section][idx] = { ...this.data[section][idx], ...values };
      } else {
        // Add new — generate ID
        values.id = (values.title || values.name || 'item').toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();
        this.data[section].push(values);
      }
    }

    this.closeForm();
    this.renderAll();

    // Push to n8n webhook
    await this.pushUpdate(section);
  },

  // --- DELETE ---
  async deleteItem(section, id) {
    if (!confirm('Are you sure you want to delete this item?')) return;

    this.data[section] = this.data[section].filter(i => i.id !== id);
    this.renderAll();
    await this.pushUpdate(section);
  },

  // --- SAVE TO SERVER ---
  async pushUpdate(section) {
    try {
      const file = section === 'hero' ? 'hero' : section;
      const res = await fetch(this.WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section: file,
          data: this.data[section]
        })
      });

      if (res.ok) {
        this.toast('Changes saved and published!');
      } else {
        throw new Error(`HTTP ${res.status}`);
      }
    } catch (e) {
      this.toast('Error saving. Please try again.', true);
      console.error('[Admin] Save error:', e);
    }
  },

  // --- REMOVE IMAGE ---
  removeImage(fieldKey) {
    const input = document.getElementById(`field-${fieldKey}`);
    if (input) input.value = '';
    const preview = document.getElementById(`preview-${fieldKey}`);
    if (preview) preview.innerHTML = '';
  },

  // --- TOAST ---
  toast(message, isError = false) {
    const el = document.getElementById('adminToast');
    el.textContent = message;
    el.className = 'admin-toast visible' + (isError ? ' error' : '');
    setTimeout(() => { el.className = 'admin-toast'; }, 3000);
  }
};

// Boot
document.addEventListener('DOMContentLoaded', () => Admin.init());
