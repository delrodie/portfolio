(function () {
  const list = document.querySelector('[data-projects-list]');
  if (!list) {
    return;
  }

  const chipClass = 'border border-[#1e40af]/30 bg-[#1e40af]/15 hover:bg-[#1e40af]/50 cursor-pointer py-1 px-3 m-1';
  const projectsPerPage = 5;
  let projects = [];
  let currentPage = 1;
  const pagination = document.createElement('nav');
  pagination.className = 'mx-4 mt-8 flex flex-wrap items-center justify-center gap-2 text-sm';
  pagination.setAttribute('aria-label', 'Pagination des projets');
  list.setAttribute('aria-live', 'polite');
  list.innerHTML = `
    <div class="mx-4 rounded-lg border border-[#1e40af]/40 bg-[#1e40af]/15 px-5 py-8 text-center text-gray-400">
      Chargement des projets…
    </div>
  `;

  const escapeHtml = (value) => String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
  const sanitizeContent = window.portfolioContent?.sanitize || escapeHtml;

  const projectTheme = (type) => {
    if (type === 'live') {
      return {
        status: 'bg-green-300/20 text-green-400 border border-green-300/30'
      };
    }

    if (type === 'archive') {
      return {
        status: 'bg-red-300/20 text-red-400 border border-red-300/30'
      };
    }

    return {
      status: 'bg-amber-300/20 text-amber-400 border border-amber-300/30'
    };
  };

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

  const sortProjectsByDateDesc = (items) => [...items].sort((first, second) => {
    const dateDiff = parseProjectDate(second.date) - parseProjectDate(first.date);
    if (dateDiff !== 0) {
      return dateDiff;
    }

    return String(first.title || '').localeCompare(String(second.title || ''), 'fr');
  });

  const renderProject = (project) => {
    const detailUrl = `projet.html?slug=${encodeURIComponent(project.slug)}`;
    const theme = projectTheme(project.statusType);

    return `
      <article class="my-2 py-3 px-4 rounded-sm mx-4 border border-[#1e40af]/60 bg-[#1e40af]/15 hover:bg-[#1e40af]/30 transition duration-300 hover:translate-y-[-5px] hover:shadow-lg hover:shadow-[#1e40af]/30">
        <div class="grid grid-cols-2 gap-4 items-center">
          <div class="text-[12px] text-gray-500">${escapeHtml(project.date)}</div>
          <div class="text-[12px] text-end uppercase flex justify-end items-center">
            <div class="relative inline-block group">
              <a href="${detailUrl}" class="text-2xl hover:text-green-500 me-3" aria-label="Voir les details du projet ${escapeHtml(project.title)}">
                <i class="fa-regular fa-file-lines"></i>
              </a>
              <span class="absolute right-full top-1/2 -translate-y-1/2 mr-1 bg-[#1e40af] text-xs rounded px-3 py-1.5 text-nowrap font-medium opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none">
                Voir les details
              </span>
            </div>
            <span class="${theme.status} px-3 py-1">${escapeHtml(project.status)}</span>
          </div>
        </div>
        <h2 class="font-semibold mt-3 mb-2">${escapeHtml(project.title)}</h2>
        <h3 class="italic text-sm text-green-600">${escapeHtml(project.subtitle)}</h3>
        <p class="my-3 text-sm/7 font-extralight">${sanitizeContent(project.summary)}</p>
        <ul class="flex flex-wrap items-center text-[12px] font-light">
          ${(project.technologies || []).map((tech) => `<li class="${chipClass}">${escapeHtml(tech)}</li>`).join('')}
        </ul>
      </article>
    `;
  };

  const renderPagination = () => {
    const pageCount = Math.ceil(projects.length / projectsPerPage);

    if (pageCount <= 1) {
      pagination.innerHTML = '';
      return;
    }

    const pageButtons = Array.from({ length: pageCount }, (_, index) => {
      const page = index + 1;
      const isCurrent = page === currentPage;

      return `
        <button type="button" data-page="${page}" class="min-w-10 border px-3 py-2 transition ${isCurrent ? 'border-green-500 bg-green-500 text-black' : 'border-[#1e40af]/50 bg-[#1e40af]/15 text-white hover:bg-[#1e40af]/40'}" ${isCurrent ? 'aria-current="page"' : ''}>
          ${page}
        </button>
      `;
    }).join('');

    pagination.innerHTML = `
      <button type="button" data-page="${Math.max(1, currentPage - 1)}" class="border border-[#1e40af]/50 bg-[#1e40af]/15 px-3 py-2 text-white transition hover:bg-[#1e40af]/40" ${currentPage === 1 ? 'disabled aria-disabled="true"' : ''}>
        Precedent
      </button>
      ${pageButtons}
      <button type="button" data-page="${Math.min(pageCount, currentPage + 1)}" class="border border-[#1e40af]/50 bg-[#1e40af]/15 px-3 py-2 text-white transition hover:bg-[#1e40af]/40" ${currentPage === pageCount ? 'disabled aria-disabled="true"' : ''}>
        Suivant
      </button>
    `;
  };

  const renderPage = () => {
    const start = (currentPage - 1) * projectsPerPage;
    const visibleProjects = projects.slice(start, start + projectsPerPage);
    list.innerHTML = visibleProjects.map(renderProject).join('');
    renderPagination();
  };

  pagination.addEventListener('click', (event) => {
    const button = event.target.closest('[data-page]');
    if (!button || button.disabled) {
      return;
    }

    currentPage = Number(button.dataset.page);
    renderPage();
    list.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  fetch(`./assets/data/projects.json?v=${Date.now()}`, { cache: 'no-store' })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return response.json();
    })
    .then((data) => {
      projects = sortProjectsByDateDesc(Array.isArray(data.projects) ? data.projects : []);
      if (!projects.length) {
        list.innerHTML = `
          <div class="mx-4 rounded-lg border border-[#1e40af]/40 bg-[#1e40af]/15 px-5 py-8 text-center text-gray-400">
            Aucun projet n’est actuellement publié.
          </div>
        `;
        return;
      }

      list.after(pagination);
      renderPage();
    })
    .catch((error) => {
      console.warn('Impossible de charger les projets dynamiques.', error);
      list.innerHTML = `
        <div class="mx-4 rounded-lg border border-red-500/40 bg-red-500/10 px-5 py-8 text-center text-red-200" role="alert">
          La liste des projets n’a pas pu être chargée. Vérifiez que le fichier
          <code class="font-mono">assets/data/projects.json</code> existe, porte exactement ce nom et contient un JSON valide.
        </div>
      `;
    });
})();
