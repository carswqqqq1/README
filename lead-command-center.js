(function () {
  'use strict';

  var STORAGE_KEY = 'arroyo-lead-command-center-v1';
  var STATUS_ORDER = [
    { value: 'NEW', label: 'New', tone: 'blue' },
    { value: 'READY_TO_CALL', label: 'Ready To Call', tone: 'blue' },
    { value: 'CALLED_NO_ANSWER', label: 'Called - No Answer', tone: 'amber' },
    { value: 'CALLED_ANSWERED', label: 'Called - Answered', tone: 'green' },
    { value: 'FOLLOW_UP', label: 'Follow Up', tone: 'amber' },
    { value: 'MEETING_BOOKED', label: 'Meeting Booked', tone: 'green' },
    { value: 'NO_SHOW', label: 'No Show', tone: 'rose' },
    { value: 'CLOSED', label: 'Closed', tone: 'green' },
    { value: 'DEAD', label: 'Dead', tone: 'rose' }
  ];
  var STATUS_MAP = STATUS_ORDER.reduce(function (map, item) {
    map[item.value] = item;
    return map;
  }, {});

  var els = {};
  var state = {
    leads: [],
    selectedLeadId: '',
    filters: {
      search: '',
      status: 'ALL',
      owner: 'ALL',
      followup: 'all'
    },
    view: 'board',
    pendingImportText: '',
    draggedLeadId: ''
  };

  var sampleCsv = [
    'Business Name,Phone,Website,Email,Owner,City,State,Status,Opportunity Note,Best Opening Angle,Next Follow Up,Notes',
    'Sonoran Turf Co,(602) 555-0134,https://sonoranturf.co,owner@sonoranturf.co,Alex,Scottsdale,AZ,READY TO CALL,Weak offer and no clear trust stack,Lead with review gap and booking friction,2026-03-21,Ready for first pass',
    'Peak Patio Covers,(480) 555-0112,https://peakpatio.co,hello@peakpatio.co,Alex,Phoenix,AZ,FOLLOW UP,Decent work but slow response speed,Follow up after owner asked for examples,2026-03-22,Asked for callback next afternoon',
    'Mesa Outdoor Living,(480) 555-0188,,info@mesaoutdoorliving.com,Jordan,Mesa,AZ,MEETING BOOKED,Strong before/after work but weak close path,Prep call around proof stack,2026-03-24,Booked Tuesday 2:00 PM',
    'Desert Glow Lighting,(623) 555-0101,https://desertglow.io,,Alex,Peoria,AZ,CALLED - NO ANSWER,Poor search positioning,Use missed opportunity angle,2026-03-21,Left voicemail',
    'Arcadia Yard Studio,(602) 555-0197,https://arcadiayardstudio.com,owner@arcadiayardstudio.com,Carson,Phoenix,AZ,CALLED - ANSWERED,Owner curious but skeptical,Send concise audit angle,2026-03-23,Asked for proof and quick summary'
  ].join('\n');

  function init() {
    bindElements();
    loadState();
    bindEvents();
    render();
  }

  function bindElements() {
    els.csvFileInput = document.getElementById('csvFileInput');
    els.dropzone = document.getElementById('dropzone');
    els.importButton = document.getElementById('importButton');
    els.demoImportButton = document.getElementById('demoImportButton');
    els.importSummary = document.getElementById('importSummary');
    els.leadCountPill = document.getElementById('leadCountPill');
    els.statsGrid = document.getElementById('statsGrid');
    els.boardView = document.getElementById('boardView');
    els.tableView = document.getElementById('tableView');
    els.tableBody = document.getElementById('tableBody');
    els.searchInput = document.getElementById('searchInput');
    els.statusFilter = document.getElementById('statusFilter');
    els.ownerFilter = document.getElementById('ownerFilter');
    els.followupFilter = document.getElementById('followupFilter');
    els.resultsHeading = document.getElementById('resultsHeading');
    els.agendaList = document.getElementById('agendaList');
    els.lastSavedLabel = document.getElementById('lastSavedLabel');
    els.drawer = document.getElementById('leadDrawer');
    els.drawerBackdrop = document.getElementById('drawerBackdrop');
    els.drawerBody = document.getElementById('drawerBody');
    els.drawerTitle = document.getElementById('drawerTitle');
    els.drawerTemplate = document.getElementById('drawerTemplate');
    els.closeDrawerButton = document.getElementById('closeDrawerButton');
    els.loadSampleButton = document.getElementById('loadSampleButton');
    els.exportButton = document.getElementById('exportButton');
    els.resetButton = document.getElementById('resetButton');
    els.viewButtons = Array.prototype.slice.call(document.querySelectorAll('[data-view]'));
  }

  function bindEvents() {
    els.csvFileInput.addEventListener('change', handleFileSelection);
    els.importButton.addEventListener('click', importPendingText);
    els.demoImportButton.addEventListener('click', function () {
      state.pendingImportText = sampleCsv;
      importPendingText();
    });
    els.loadSampleButton.addEventListener('click', loadSampleLeads);
    els.exportButton.addEventListener('click', exportCsv);
    els.resetButton.addEventListener('click', resetData);
    els.searchInput.addEventListener('input', function (event) {
      state.filters.search = event.target.value || '';
      render();
    });
    els.statusFilter.addEventListener('change', function (event) {
      state.filters.status = event.target.value;
      render();
    });
    els.ownerFilter.addEventListener('change', function (event) {
      state.filters.owner = event.target.value;
      render();
    });
    els.followupFilter.addEventListener('change', function (event) {
      state.filters.followup = event.target.value;
      render();
    });
    els.drawerBackdrop.addEventListener('click', closeDrawer);
    els.closeDrawerButton.addEventListener('click', closeDrawer);
    els.viewButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        state.view = button.getAttribute('data-view');
        renderViewToggle();
      });
    });
    ['dragenter', 'dragover'].forEach(function (name) {
      els.dropzone.addEventListener(name, function (event) {
        event.preventDefault();
        els.dropzone.classList.add('is-dragover');
      });
    });
    ['dragleave', 'drop'].forEach(function (name) {
      els.dropzone.addEventListener(name, function (event) {
        event.preventDefault();
        els.dropzone.classList.remove('is-dragover');
      });
    });
    els.dropzone.addEventListener('drop', function (event) {
      var file = event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0];
      if (file) readCsvFile(file);
    });
  }

  function handleFileSelection(event) {
    var file = event.target.files && event.target.files[0];
    if (file) readCsvFile(file);
  }

  function readCsvFile(file) {
    var reader = new FileReader();
    reader.onload = function () {
      state.pendingImportText = String(reader.result || '');
      els.importSummary.textContent = 'Loaded "' + file.name + '". Ready to import.';
    };
    reader.readAsText(file);
  }

  function importPendingText() {
    if (!state.pendingImportText) {
      els.importSummary.textContent = 'Choose a CSV file first or use the demo import.';
      return;
    }

    var rows = parseCsv(state.pendingImportText);
    if (!rows.length) {
      els.importSummary.textContent = 'Import failed. The file looked empty.';
      return;
    }

    var leads = rows.map(normalizeLeadRow).filter(Boolean);
    if (!leads.length) {
      els.importSummary.textContent = 'No usable leads were found in that file.';
      return;
    }

    state.leads = mergeLeads(state.leads, leads);
    saveState();
    els.importSummary.textContent = 'Imported ' + leads.length + ' leads. Existing matching leads were updated.';
    render();
  }

  function loadSampleLeads() {
    state.leads = parseCsv(sampleCsv).map(normalizeLeadRow).filter(Boolean);
    saveState();
    render();
    els.importSummary.textContent = 'Sample pipeline loaded for layout and workflow testing.';
  }

  function parseCsv(text) {
    var rows = [];
    var current = '';
    var row = [];
    var inQuotes = false;
    var source = String(text || '').replace(/\r\n/g, '\n');

    for (var i = 0; i < source.length; i += 1) {
      var char = source[i];
      var next = source[i + 1];

      if (char === '"') {
        if (inQuotes && next === '"') {
          current += '"';
          i += 1;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        row.push(current);
        current = '';
      } else if (char === '\n' && !inQuotes) {
        row.push(current);
        rows.push(row);
        row = [];
        current = '';
      } else {
        current += char;
      }
    }

    if (current.length || row.length) {
      row.push(current);
      rows.push(row);
    }

    if (rows.length < 2) return [];
    var headers = rows[0].map(function (header) {
      return String(header || '').trim();
    });

    return rows.slice(1).filter(function (values) {
      return values.some(function (value) {
        return String(value || '').trim();
      });
    }).map(function (values) {
      var result = {};
      headers.forEach(function (header, index) {
        result[header] = String(values[index] || '').trim();
      });
      return result;
    });
  }

  function normalizeLeadRow(row) {
    var businessName = pick(row, ['Business Name', 'Business', 'Company', 'Name']);
    var phone = pick(row, ['Phone', 'Phone Number', 'Mobile']);
    var email = pick(row, ['Email', 'Contact Email']);
    var website = pick(row, ['Website', 'Site', 'URL']);
    if (!businessName && !phone && !email) return null;

    var status = normalizeStatus(pick(row, ['Status', 'Lead Status', 'Pipeline Stage']) || 'NEW');
    var nextFollowUp = normalizeDate(pick(row, ['Next Follow Up', 'Follow Up', 'Next Follow-Up']));
    var initialNote = pick(row, ['Notes', 'Opportunity Note', 'Best Opening Angle']) || '';
    var now = new Date().toISOString();
    var extras = {};

    Object.keys(row).forEach(function (key) {
      if (!pick(row, [key])) return;
      if ([
        'Business Name', 'Business', 'Company', 'Name', 'Phone', 'Phone Number', 'Mobile',
        'Email', 'Contact Email', 'Website', 'Site', 'URL', 'Status', 'Lead Status', 'Pipeline Stage',
        'Next Follow Up', 'Follow Up', 'Next Follow-Up', 'Owner', 'City', 'State', 'GBP URL', 'Website Status',
        'Rating', 'Review Count', 'Opportunity Note', 'Best Opening Angle', 'Notes'
      ].indexOf(key) !== -1) {
        return;
      }
      extras[key] = row[key];
    });

    return {
      id: slugify((businessName || email || phone || now) + '-' + Math.random().toString(36).slice(2, 8)),
      businessName: businessName || 'Unnamed Lead',
      phone: phone || '',
      email: email || '',
      website: website || '',
      gbpUrl: pick(row, ['GBP URL', 'GBP', 'Google Business Profile']) || '',
      owner: pick(row, ['Owner', 'Assigned To']) || 'Unassigned',
      city: pick(row, ['City']) || '',
      state: pick(row, ['State']) || '',
      websiteStatus: pick(row, ['Website Status']) || '',
      rating: pick(row, ['Rating']) || '',
      reviewCount: pick(row, ['Review Count']) || '',
      opportunityNote: pick(row, ['Opportunity Note']) || '',
      openingAngle: pick(row, ['Best Opening Angle']) || '',
      status: status,
      nextFollowUp: nextFollowUp,
      notes: initialNote ? [{ id: 'note-' + Date.now(), text: initialNote, createdAt: now, type: 'import' }] : [],
      createdAt: now,
      updatedAt: now,
      lastContactedAt: '',
      extras: extras
    };
  }

  function mergeLeads(existing, incoming) {
    var byKey = {};
    existing.forEach(function (lead) {
      byKey[identityKey(lead)] = lead;
    });

    incoming.forEach(function (lead) {
      var key = identityKey(lead);
      var current = byKey[key];
      if (!current) {
        byKey[key] = lead;
        return;
      }
      byKey[key] = {
        id: current.id,
        businessName: lead.businessName || current.businessName,
        phone: lead.phone || current.phone,
        email: lead.email || current.email,
        website: lead.website || current.website,
        gbpUrl: lead.gbpUrl || current.gbpUrl,
        owner: lead.owner || current.owner,
        city: lead.city || current.city,
        state: lead.state || current.state,
        websiteStatus: lead.websiteStatus || current.websiteStatus,
        rating: lead.rating || current.rating,
        reviewCount: lead.reviewCount || current.reviewCount,
        opportunityNote: lead.opportunityNote || current.opportunityNote,
        openingAngle: lead.openingAngle || current.openingAngle,
        status: lead.status || current.status,
        nextFollowUp: lead.nextFollowUp || current.nextFollowUp,
        notes: current.notes.concat(lead.notes || []),
        createdAt: current.createdAt,
        updatedAt: new Date().toISOString(),
        lastContactedAt: current.lastContactedAt || '',
        extras: Object.assign({}, current.extras || {}, lead.extras || {})
      };
    });

    return Object.keys(byKey).map(function (key) { return byKey[key]; }).sort(sortLeads);
  }

  function identityKey(lead) {
    return slugify((lead.businessName || '') + '|' + (lead.phone || '') + '|' + (lead.email || ''));
  }

  function normalizeStatus(value) {
    var upper = String(value || '').trim().toUpperCase().replace(/[^A-Z]+/g, '_').replace(/^_|_$/g, '');
    if (upper === 'CALLED_ANSWER') return 'CALLED_ANSWERED';
    if (upper === 'READY_CALL') return 'READY_TO_CALL';
    return STATUS_MAP[upper] ? upper : 'NEW';
  }

  function normalizeDate(value) {
    var raw = String(value || '').trim();
    if (!raw) return '';
    var parsed = new Date(raw);
    if (isNaN(parsed.getTime())) return '';
    return parsed.toISOString().slice(0, 10);
  }

  function pick(row, keys) {
    for (var i = 0; i < keys.length; i += 1) {
      var value = row[keys[i]];
      if (String(value || '').trim()) return String(value || '').trim();
    }
    return '';
  }

  function slugify(value) {
    return String(value || '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  function loadState() {
    try {
      var stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      if (Array.isArray(stored.leads)) state.leads = stored.leads;
    } catch (error) {
      state.leads = [];
    }
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ leads: state.leads }));
    els.lastSavedLabel.textContent = 'Saved locally ' + formatTimestamp(new Date().toISOString());
  }

  function render() {
    populateFilters();
    renderStats();
    renderAgenda();
    renderBoard();
    renderTable();
    renderViewToggle();
    renderDrawer();
    els.leadCountPill.textContent = state.leads.length + ' leads';
  }

  function populateFilters() {
    var owners = uniqueOwners();
    syncSelect(els.statusFilter, [{ value: 'ALL', label: 'All statuses' }].concat(STATUS_ORDER.map(function (item) {
      return { value: item.value, label: item.label };
    })), state.filters.status);
    syncSelect(els.ownerFilter, [{ value: 'ALL', label: 'All owners' }].concat(owners.map(function (owner) {
      return { value: owner, label: owner };
    })), state.filters.owner);
  }

  function syncSelect(element, options, selected) {
    element.innerHTML = options.map(function (option) {
      return '<option value="' + escapeHtml(option.value) + '"' + (option.value === selected ? ' selected' : '') + '>' + escapeHtml(option.label) + '</option>';
    }).join('');
  }

  function renderStats() {
    var filtered = getFilteredLeads();
    var dueCount = filtered.filter(isDueFollowUp).length;
    var bookedCount = filtered.filter(function (lead) { return lead.status === 'MEETING_BOOKED'; }).length;
    var activeCount = filtered.filter(function (lead) { return ['CLOSED', 'DEAD'].indexOf(lead.status) === -1; }).length;
    var calledToday = filtered.filter(function (lead) {
      return lead.lastContactedAt && lead.lastContactedAt.slice(0, 10) === new Date().toISOString().slice(0, 10);
    }).length;

    var stats = [
      { label: 'Active Pipeline', value: activeCount },
      { label: 'Due Follow-up', value: dueCount },
      { label: 'Meetings Booked', value: bookedCount },
      { label: 'Calls Logged Today', value: calledToday }
    ];

    els.statsGrid.innerHTML = stats.map(function (item) {
      return '<article class="stat-card"><span class="eyebrow">' + escapeHtml(item.label) + '</span><strong>' + item.value + '</strong></article>';
    }).join('');
  }

  function renderAgenda() {
    var list = getFilteredLeads()
      .filter(function (lead) { return isDueFollowUp(lead) || lead.status === 'READY_TO_CALL' || lead.status === 'MEETING_BOOKED'; })
      .sort(sortLeads)
      .slice(0, 6);

    if (!list.length) {
      els.agendaList.innerHTML = '<div class="agenda__item"><strong>No urgent leads</strong><p>Import a list or loosen filters to see the next queue.</p></div>';
      return;
    }

    els.agendaList.innerHTML = list.map(function (lead) {
      return '<button class="agenda__item" type="button" data-open-lead="' + escapeHtml(lead.id) + '">' +
        '<strong>' + escapeHtml(lead.businessName) + '</strong>' +
        '<p>' + escapeHtml(statusLabel(lead.status)) + ' · ' + escapeHtml(lead.owner || 'Unassigned') + '</p>' +
        '<p>' + escapeHtml(lead.nextFollowUp ? ('Follow up ' + formatDate(lead.nextFollowUp)) : (lead.phone || 'No phone listed')) + '</p>' +
      '</button>';
    }).join('');

    bindOpenLeadButtons(els.agendaList);
  }

  function renderBoard() {
    var filtered = getFilteredLeads();
    els.resultsHeading.textContent = filtered.length + ' filtered leads';
    els.boardView.innerHTML = STATUS_ORDER.map(function (statusItem) {
      var leads = filtered.filter(function (lead) { return lead.status === statusItem.value; });
      return '<section class="board-column" data-status-column="' + statusItem.value + '">' +
        '<div class="column-head"><strong>' + escapeHtml(statusItem.label) + '</strong><span class="pill">' + leads.length + '</span></div>' +
        '<div class="column-stack">' + (leads.length ? leads.map(renderLeadCard).join('') : '<div class="agenda__item"><p>No leads here.</p></div>') + '</div>' +
      '</section>';
    }).join('');

    bindBoardInteractions();
  }

  function renderLeadCard(lead) {
    return '<article class="lead-card" draggable="true" data-lead-id="' + escapeHtml(lead.id) + '">' +
      '<div class="lead-card__title"><strong>' + escapeHtml(lead.businessName) + '</strong><span class="status-badge" data-tone="' + escapeHtml(statusTone(lead.status)) + '">' + escapeHtml(shortStatus(lead.status)) + '</span></div>' +
      '<div class="lead-card__meta">' +
        '<span>' + escapeHtml(lead.phone || 'No phone') + '</span>' +
        '<span>' + escapeHtml(compactLocation(lead)) + '</span>' +
        '<span>' + escapeHtml(lead.owner || 'Unassigned') + '</span>' +
      '</div>' +
      '<div class="lead-card__footer">' +
        '<strong>' + escapeHtml(lead.opportunityNote || lead.openingAngle || 'No opportunity note yet') + '</strong>' +
        '<span>' + escapeHtml(lead.nextFollowUp ? ('Next follow-up ' + formatDate(lead.nextFollowUp)) : 'No follow-up scheduled') + '</span>' +
      '</div>' +
    '</article>';
  }

  function bindBoardInteractions() {
    Array.prototype.slice.call(document.querySelectorAll('.lead-card')).forEach(function (card) {
      card.addEventListener('click', function () {
        openLead(card.getAttribute('data-lead-id'));
      });
      card.addEventListener('dragstart', function () {
        state.draggedLeadId = card.getAttribute('data-lead-id');
        card.classList.add('is-dragging');
      });
      card.addEventListener('dragend', function () {
        state.draggedLeadId = '';
        card.classList.remove('is-dragging');
        Array.prototype.slice.call(document.querySelectorAll('.board-column')).forEach(function (column) {
          column.classList.remove('is-dropping');
        });
      });
    });

    Array.prototype.slice.call(document.querySelectorAll('[data-status-column]')).forEach(function (column) {
      column.addEventListener('dragover', function (event) {
        event.preventDefault();
        column.classList.add('is-dropping');
      });
      column.addEventListener('dragleave', function () {
        column.classList.remove('is-dropping');
      });
      column.addEventListener('drop', function (event) {
        event.preventDefault();
        column.classList.remove('is-dropping');
        moveLeadToStatus(state.draggedLeadId, column.getAttribute('data-status-column'));
      });
    });
  }

  function renderTable() {
    var filtered = getFilteredLeads();
    if (!filtered.length) {
      els.tableBody.innerHTML = '<tr><td colspan="6">No leads match the current filters.</td></tr>';
      return;
    }

    els.tableBody.innerHTML = filtered.map(function (lead) {
      return '<tr data-open-lead="' + escapeHtml(lead.id) + '">' +
        '<td><strong>' + escapeHtml(lead.businessName) + '</strong><br><span>' + escapeHtml(compactLocation(lead)) + '</span></td>' +
        '<td><span class="status-badge" data-tone="' + escapeHtml(statusTone(lead.status)) + '">' + escapeHtml(statusLabel(lead.status)) + '</span></td>' +
        '<td>' + escapeHtml(lead.owner || 'Unassigned') + '</td>' +
        '<td>' + escapeHtml(lead.nextFollowUp ? formatDate(lead.nextFollowUp) : 'Not set') + '</td>' +
        '<td>' + escapeHtml(lead.lastContactedAt ? formatTimestamp(lead.lastContactedAt) : 'No activity yet') + '</td>' +
        '<td>' + escapeHtml(lead.opportunityNote || lead.openingAngle || 'No note') + '</td>' +
      '</tr>';
    }).join('');

    bindOpenLeadButtons(els.tableBody);
  }

  function bindOpenLeadButtons(container) {
    Array.prototype.slice.call(container.querySelectorAll('[data-open-lead]')).forEach(function (node) {
      node.addEventListener('click', function () {
        openLead(node.getAttribute('data-open-lead'));
      });
    });
  }

  function renderViewToggle() {
    els.viewButtons.forEach(function (button) {
      button.classList.toggle('is-active', button.getAttribute('data-view') === state.view);
    });
    var showBoard = state.view === 'board';
    els.boardView.hidden = !showBoard;
    els.tableView.hidden = showBoard;
  }

  function renderDrawer() {
    var lead = state.leads.find(function (item) { return item.id === state.selectedLeadId; });
    if (!lead) {
      els.drawer.classList.remove('is-open');
      els.drawer.setAttribute('aria-hidden', 'true');
      els.drawerTitle.textContent = 'Select a lead';
      els.drawerBody.innerHTML = '<p class="drawer__empty">Click a lead card or table row to manage notes, next step, and status updates.</p>';
      return;
    }

    els.drawer.classList.add('is-open');
    els.drawer.setAttribute('aria-hidden', 'false');
    els.drawerTitle.textContent = lead.businessName;
    els.drawerBody.innerHTML = els.drawerTemplate.innerHTML;

    els.drawerBody.querySelector('[data-bind="businessName"]').textContent = lead.businessName;
    els.drawerBody.querySelector('[data-bind="locationLine"]').textContent = compactLocation(lead) || 'Location not listed';
    var badge = els.drawerBody.querySelector('[data-bind="statusLabel"]');
    badge.textContent = statusLabel(lead.status);
    badge.setAttribute('data-tone', statusTone(lead.status));

    var quickActions = els.drawerBody.querySelector('#quickActions');
    quickActions.innerHTML = STATUS_ORDER.map(function (statusItem) {
      return '<button class="segmented' + (lead.status === statusItem.value ? ' is-active' : '') + '" type="button" data-quick-status="' + statusItem.value + '">' + escapeHtml(statusItem.label) + '</button>';
    }).join('');

    var meta = [
      { label: 'Phone', value: lead.phone || 'Not listed' },
      { label: 'Email', value: lead.email || 'Not listed' },
      { label: 'Owner', value: lead.owner || 'Unassigned' },
      { label: 'Website', value: lead.website || 'Not listed' },
      { label: 'GBP URL', value: lead.gbpUrl || 'Not listed' },
      { label: 'Website Status', value: lead.websiteStatus || 'Not listed' },
      { label: 'Rating', value: lead.rating || 'Not listed' },
      { label: 'Review Count', value: lead.reviewCount || 'Not listed' },
      { label: 'Opportunity', value: lead.opportunityNote || 'None yet' },
      { label: 'Opening Angle', value: lead.openingAngle || 'None yet' }
    ];
    els.drawerBody.querySelector('#detailMeta').innerHTML = meta.map(function (item) {
      return '<div class="detail-meta__item"><strong>' + escapeHtml(item.label) + '</strong><p>' + escapeHtml(item.value) + '</p></div>';
    }).join('');

    var statusSelect = els.drawerBody.querySelector('#drawerStatusSelect');
    syncSelect(statusSelect, STATUS_ORDER.map(function (item) {
      return { value: item.value, label: item.label };
    }), lead.status);
    els.drawerBody.querySelector('#drawerFollowupInput').value = lead.nextFollowUp || '';
    els.drawerBody.querySelector('#timeline').innerHTML = renderTimeline(lead);

    quickActions.querySelectorAll('[data-quick-status]').forEach(function (button) {
      button.addEventListener('click', function () {
        statusSelect.value = button.getAttribute('data-quick-status');
      });
    });

    els.drawerBody.querySelector('#saveLeadButton').addEventListener('click', function () {
      saveDrawerLead(true);
    });
    els.drawerBody.querySelector('#logCallButton').addEventListener('click', function () {
      saveDrawerLead(false);
    });
  }

  function renderTimeline(lead) {
    if (!lead.notes || !lead.notes.length) {
      return '<div class="timeline__item"><strong>No notes yet</strong><p>Use the update form to log call outcomes and next steps.</p></div>';
    }

    return lead.notes.slice().reverse().map(function (note) {
      return '<div class="timeline__item"><strong>' + escapeHtml(formatTimestamp(note.createdAt)) + '</strong><p>' + escapeHtml(note.text) + '</p></div>';
    }).join('');
  }

  function saveDrawerLead(includeStatusChange) {
    var lead = state.leads.find(function (item) { return item.id === state.selectedLeadId; });
    if (!lead) return;

    var nextStatus = els.drawerBody.querySelector('#drawerStatusSelect').value;
    var nextFollowUp = els.drawerBody.querySelector('#drawerFollowupInput').value;
    var noteText = String(els.drawerBody.querySelector('#drawerNoteInput').value || '').trim();
    var now = new Date().toISOString();

    if (includeStatusChange) {
      lead.status = nextStatus;
    }

    lead.nextFollowUp = nextFollowUp;
    lead.updatedAt = now;
    lead.lastContactedAt = now;

    if (noteText) {
      lead.notes = lead.notes || [];
      lead.notes.push({
        id: 'note-' + Date.now(),
        text: noteText,
        createdAt: now,
        type: includeStatusChange ? 'update' : 'call'
      });
    }

    saveState();
    render();
  }

  function moveLeadToStatus(leadId, status) {
    if (!leadId || !STATUS_MAP[status]) return;
    var lead = state.leads.find(function (item) { return item.id === leadId; });
    if (!lead) return;
    lead.status = status;
    lead.updatedAt = new Date().toISOString();
    saveState();
    render();
  }

  function getFilteredLeads() {
    return state.leads.filter(function (lead) {
      if (state.filters.status !== 'ALL' && lead.status !== state.filters.status) return false;
      if (state.filters.owner !== 'ALL' && (lead.owner || 'Unassigned') !== state.filters.owner) return false;
      if (!matchesFollowupFilter(lead, state.filters.followup)) return false;

      if (!state.filters.search) return true;
      var haystack = [
        lead.businessName, lead.owner, lead.phone, lead.email, lead.city, lead.state,
        lead.opportunityNote, lead.openingAngle
      ].join(' ').toLowerCase();
      return haystack.indexOf(state.filters.search.toLowerCase()) !== -1;
    }).sort(sortLeads);
  }

  function matchesFollowupFilter(lead, filter) {
    if (filter === 'all') return true;
    if (filter === 'due') return isDueFollowUp(lead);
    if (filter === 'scheduled') return Boolean(lead.nextFollowUp);
    if (filter === 'none') return !lead.nextFollowUp;
    return true;
  }

  function isDueFollowUp(lead) {
    if (!lead.nextFollowUp) return false;
    return lead.nextFollowUp <= new Date().toISOString().slice(0, 10);
  }

  function sortLeads(a, b) {
    var aDue = a.nextFollowUp || '9999-12-31';
    var bDue = b.nextFollowUp || '9999-12-31';
    if (aDue !== bDue) return aDue < bDue ? -1 : 1;
    return (a.businessName || '').localeCompare(b.businessName || '');
  }

  function uniqueOwners() {
    var seen = {};
    state.leads.forEach(function (lead) {
      seen[lead.owner || 'Unassigned'] = true;
    });
    return Object.keys(seen).sort();
  }

  function openLead(leadId) {
    state.selectedLeadId = leadId;
    renderDrawer();
  }

  function closeDrawer() {
    state.selectedLeadId = '';
    renderDrawer();
  }

  function exportCsv() {
    if (!state.leads.length) return;
    var headers = ['Business Name', 'Phone', 'Email', 'Website', 'Owner', 'City', 'State', 'Status', 'Next Follow Up', 'Opportunity Note', 'Best Opening Angle', 'Latest Note'];
    var lines = [headers.join(',')].concat(state.leads.map(function (lead) {
      return [
        lead.businessName, lead.phone, lead.email, lead.website, lead.owner, lead.city, lead.state,
        statusLabel(lead.status), lead.nextFollowUp, lead.opportunityNote, lead.openingAngle,
        lead.notes && lead.notes.length ? lead.notes[lead.notes.length - 1].text : ''
      ].map(csvEscape).join(',');
    }));
    var blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var link = document.createElement('a');
    link.href = url;
    link.download = 'arroyo-leads-export.csv';
    link.click();
    URL.revokeObjectURL(url);
  }

  function resetData() {
    state.leads = [];
    state.selectedLeadId = '';
    localStorage.removeItem(STORAGE_KEY);
    els.importSummary.textContent = 'Local data cleared.';
    render();
  }

  function csvEscape(value) {
    var text = String(value || '');
    if (/[",\n]/.test(text)) return '"' + text.replace(/"/g, '""') + '"';
    return text;
  }

  function compactLocation(lead) {
    return [lead.city, lead.state].filter(Boolean).join(', ');
  }

  function statusLabel(status) {
    return STATUS_MAP[status] ? STATUS_MAP[status].label : status;
  }

  function shortStatus(status) {
    var label = statusLabel(status);
    return label.length > 14 ? label.replace('Called - ', '') : label;
  }

  function statusTone(status) {
    return STATUS_MAP[status] ? STATUS_MAP[status].tone : 'blue';
  }

  function formatDate(value) {
    if (!value) return '';
    var date = new Date(value + 'T12:00:00');
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }

  function formatTimestamp(value) {
    if (!value) return '';
    var date = new Date(value);
    return date.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  init();
}());
