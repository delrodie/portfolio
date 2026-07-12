(function () {
  const state = {
    projects: [],
    selectedSlug: null
  };

  const form = document.querySelector('[data-project-form]');
  const list = document.querySelector('[data-admin-list]');
  const jsonPreview = document.querySelector('[data-json-preview]');
  const importInput = document.querySelector('[data-import-json]');
  const sectionsBuilder = document.querySelector('[data-sections-builder]');
  const addSectionButton = document.querySelector('[data-add-section]');

  if (!form || !list || !jsonPreview || !sectionsBuilder) {
    return;
  }

  const fields = [
    'slug',
    'date',
    'status',
    'statusType',
    'title',
    'subtitle',
    'role',
    'summary',
    'image',
    'website',
    'technologies'
  ];

  const slugify = (value) => String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  const escapeHtml = (value) => String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

  const parseProjectDate = (date) => {
    const value = String(date || '').toLowerCase();
    const months = {
      janvier: 0,
      fevrier: 1,
      février: 1,
      mars: 2,
      avril: 3,
      mai: 4,
      juin: 5,
      juillet: 6,
      aout: 7,
      août: 7,
      septembre: 8,
      octobre: 9,
      novembre: 10,
      decembre: 11,
      décembre: 11
    };
    const year = Number((value.match(/\b(20\d{2}|19\d{2})\b/) || [])[1]);
    const monthName = Object.keys(months).find((month) => value.includes(month));
    const month = monthName ? months[monthName] : 0;

    if (!year) {
      return 0;
    }

    return new Date(year, month, 1).getTime();
  };

  const sortProjectsByDateDesc = () => {
    state.projects.sort((first, second) => {
      const dateDiff = parseProjectDate(second.date) - parseProjectDate(first.date);
      if (dateDiff !== 0) {
        return dateDiff;
      }

      return String(first.title || '').localeCompare(String(second.title || ''), 'fr');
    });
  };

  const sectionTemplate = (section = { heading: '', items: [''] }) => `
    <article class="space-y-3 border border-[#1e40af]/40 bg-[#1e40af]/10 p-3" data-section>
      <div class="flex items-start gap-3">
        <label class="grow text-sm text-gray-300">
          Titre de section
          <input data-section-heading value="${escapeHtml(section.heading)}" class="mt-1 w-full border border-[#1e40af]/60 bg-black px-3 py-2 text-white outline-none focus:border-green-500">
        </label>
        <button type="button" data-remove-section class="mt-6 border border-red-500/70 px-3 py-2 text-xs text-red-300 hover:bg-red-500/20">
          Supprimer
        </button>
      </div>
      <label class="block text-sm text-gray-300">
        Points de detail, une ligne par point
        <span class="mt-1 block text-xs text-gray-500">HTML autorisé : &lt;a href=&quot;https://...&quot;&gt;, &lt;strong&gt;, &lt;em&gt;, &lt;u&gt;, &lt;br&gt; et &lt;code&gt;.</span>
        <textarea data-section-items rows="5" class="mt-1 w-full border border-[#1e40af]/60 bg-black px-3 py-2 text-white outline-none focus:border-green-500">${escapeHtml((section.items || []).join('\n'))}</textarea>
      </label>
    </article>
  `;

  const renderSectionsBuilder = (sections = []) => {
    const normalizedSections = sections.length ? sections : [
      {
        heading: 'Contexte & objectifs',
        items: ['Premier point a presenter.']
      }
    ];

    sectionsBuilder.innerHTML = normalizedSections.map(sectionTemplate).join('');
  };

  const sectionsFromBuilder = () => Array.from(sectionsBuilder.querySelectorAll('[data-section]'))
    .map((section) => ({
      heading: section.querySelector('[data-section-heading]').value.trim(),
      items: section.querySelector('[data-section-items]').value.split('\n').map((item) => item.trim()).filter(Boolean)
    }))
    .filter((section) => section.heading || section.items.length);

  const projectToForm = (project) => {
    fields.forEach((field) => {
      const input = form.elements[field];
      if (!input) {
        return;
      }

      if (field === 'technologies') {
        input.value = (project.technologies || []).join(', ');
        return;
      }

      input.value = project[field] || '';
    });

    renderSectionsBuilder(project.sections || []);
  };

  const formToProject = () => {
    const title = form.elements.title.value.trim();
    const slug = form.elements.slug.value.trim() || slugify(title);

    return {
      slug,
      date: form.elements.date.value.trim(),
      status: form.elements.status.value.trim(),
      statusType: form.elements.statusType.value,
      title,
      subtitle: form.elements.subtitle.value.trim(),
      role: form.elements.role.value.trim(),
      summary: form.elements.summary.value.trim(),
      image: form.elements.image.value.trim(),
      website: form.elements.website.value.trim(),
      technologies: form.elements.technologies.value.split(',').map((item) => item.trim()).filter(Boolean),
      sections: sectionsFromBuilder()
    };
  };

  const currentJson = () => JSON.stringify({
    updatedAt: new Date().toISOString().slice(0, 10),
    projects: state.projects
  }, null, 2);

  const refresh = () => {
    sortProjectsByDateDesc();

    list.innerHTML = state.projects.map((project) => `
      <button type="button" data-edit="${project.slug}" class="w-full text-left border border-[#1e40af]/50 bg-[#1e40af]/15 hover:bg-[#1e40af]/30 px-3 py-3 transition ${project.slug === state.selectedSlug ? 'ring-2 ring-green-500' : ''}">
        <span class="block text-sm font-semibold text-white">${project.title || 'Sans titre'}</span>
        <span class="block text-xs text-gray-400">${project.date || 'Sans date'} - ${project.slug}</span>
      </button>
    `).join('');

    jsonPreview.value = currentJson();
  };

  const resetForm = () => {
    form.reset();
    form.elements.statusType.value = 'progress';
    renderSectionsBuilder();
    state.selectedSlug = null;
    refresh();
  };

  const loadProjects = (data) => {
    state.projects = Array.isArray(data.projects) ? data.projects : [];
    state.selectedSlug = state.projects[0]?.slug || null;
    if (state.selectedSlug) {
      projectToForm(state.projects[0]);
    } else {
      resetForm();
    }

    refresh();
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const project = formToProject();
    const index = state.projects.findIndex((item) => item.slug === state.selectedSlug || item.slug === project.slug);
    if (index >= 0) {
      state.projects[index] = project;
    } else {
      state.projects.unshift(project);
    }

    state.selectedSlug = project.slug;
    projectToForm(project);
    refresh();
  });

  list.addEventListener('click', (event) => {
    const button = event.target.closest('[data-edit]');
    if (!button) {
      return;
    }

    const project = state.projects.find((item) => item.slug === button.dataset.edit);
    if (!project) {
      return;
    }

    state.selectedSlug = project.slug;
    projectToForm(project);
    refresh();
  });

  document.querySelector('[data-new-project]').addEventListener('click', resetForm);

  addSectionButton?.addEventListener('click', () => {
    sectionsBuilder.insertAdjacentHTML('beforeend', sectionTemplate({
      heading: '',
      items: ['']
    }));
  });

  sectionsBuilder.addEventListener('click', (event) => {
    const button = event.target.closest('[data-remove-section]');
    if (!button) {
      return;
    }

    button.closest('[data-section]').remove();
    if (!sectionsBuilder.querySelector('[data-section]')) {
      renderSectionsBuilder();
    }
  });

  document.querySelector('[data-delete-project]').addEventListener('click', () => {
    if (!state.selectedSlug) {
      resetForm();
      return;
    }

    state.projects = state.projects.filter((project) => project.slug !== state.selectedSlug);
    resetForm();
  });

  document.querySelector('[data-download-json]').addEventListener('click', () => {
    const blob = new Blob([currentJson()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'projects.json';
    link.click();
    URL.revokeObjectURL(url);
  });

  importInput?.addEventListener('change', () => {
    const file = importInput.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      try {
        loadProjects(JSON.parse(reader.result));
      } catch (error) {
        alert(`Fichier JSON invalide : ${error.message}`);
      }
    };
    reader.readAsText(file);
  });

  fetch(`./assets/data/projects.json?v=${Date.now()}`, { cache: 'no-store' })
    .then((response) => response.json())
    .then(loadProjects)
    .catch(() => {
      resetForm();
    });
})();
