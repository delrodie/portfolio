(function () {
  const root = document.querySelector('[data-project-detail]');
  if (!root) {
    return;
  }

  const escapeHtml = (value) => String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

  const params = new URLSearchParams(window.location.search);
  const slug = params.get('slug');
  const siteUrl = 'https://delrodieamoikon.github.io/portfolio';

  const setMeta = (selector, content) => {
    const element = document.querySelector(selector);
    if (element && content) {
      element.setAttribute('content', content);
    }
  };

  const renderSections = (sections) => (sections || []).map((section) => `
    <section class="mt-7">
      <h3 class="text-2xl font-bold text-white">${escapeHtml(section.heading)}</h3>
      <ul class="list-inside list-disc mt-3">
        ${(section.items || []).map((item) => `<li>${escapeHtml(item)}</li>`).join('')}
      </ul>
    </section>
  `).join('');

  const render = (project) => {
    const title = `${project.title} | Dieudonné Amoikon`;
    const description = project.summary || `Découvrez le projet ${project.title} réalisé par Dieudonné Amoikon.`;
    const projectUrl = `${siteUrl}/projet.html?slug=${encodeURIComponent(project.slug)}`;
    const imageUrl = project.image
      ? new URL(project.image.replace(/^\.\//, ''), `${siteUrl}/`).href
      : `${siteUrl}/assets/img/portrait-color.png`;

    document.title = title;
    setMeta('meta[name="description"]', description);
    setMeta('meta[property="og:title"]', title);
    setMeta('meta[property="og:description"]', description);
    setMeta('meta[property="og:url"]', projectUrl);
    setMeta('meta[property="og:image"]', imageUrl);
    setMeta('meta[property="og:image:alt"]', `Aperçu du projet ${project.title}`);
    setMeta('meta[name="twitter:title"]', title);
    setMeta('meta[name="twitter:description"]', description);
    setMeta('meta[name="twitter:image"]', imageUrl);

    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      canonical.setAttribute('href', projectUrl);
    }

    root.innerHTML = `
      <h1 class="text-4xl md:text-7xl text-center font-cocon text-gray-800/70 hover:text-gray-700 transition">
        <i class="fa-solid fa-earth-africa"></i> ${escapeHtml(project.title)}
      </h1>
      <div class="mx-auto relative w-full lg:w-5xl grid grid-cols-1 gap-6 mt-20">
        <article class="text-base/7 md:text-xl/10 lg:text-base/7 text-gray-400 2xl:text-lg/8">
          ${project.image ? `
            <figure>
              <img src="${escapeHtml(project.image)}" alt="${escapeHtml(project.title)}" class="float-left w-full md:w-[500px] max-h-[500px] object-contain pr-0 md:pr-7 pb-7">
            </figure>
          ` : ''}
          <div class="mb-3">
            <h2 class="text-2xl text-white">
              <span class="font-bold">${escapeHtml(project.subtitle)}</span>
              <span class="text-sm italic"> - ${escapeHtml(project.role)}</span>
            </h2>
            <p class="text-justify mt-3">${escapeHtml(project.summary)}</p>
            ${renderSections(project.sections)}
            <h3 class="text-2xl mt-7 font-bold text-white">Technologies</h3>
            <ul class="flex flex-wrap items-center text-[12px] font-light mt-3">
              ${(project.technologies || []).map((tech) => `<li class="border border-[#1e40af]/40 bg-[#1e40af]/15 hover:bg-[#1e40af]/50 py-1 px-3 m-1">${escapeHtml(tech)}</li>`).join('')}
            </ul>
          </div>
          <div class="grid grid-cols-2 pe-3 mt-10 clear-both">
            <div>
              ${project.website ? `
                <a href="${escapeHtml(project.website)}" class="text-3xl me-2 hover:text-green-500 inline-flex items-start" target="_blank" rel="noopener noreferrer">
                  <i class="fa-solid fa-earth-americas"></i>
                  <span class="border border-[#1e40af]/40 bg-[#1e40af]/15 hover:bg-[#1e40af]/50 py-2 px-3 text-[10px]">${escapeHtml(project.website.replace(/^https?:\/\//, '').replace(/\/$/, ''))}</span>
                </a>
              ` : ''}
            </div>
            <a href="projets.html" class="text-end text-2xl hover:text-green-500" aria-label="Retour aux projets">
              <i class="fa-solid fa-tent-arrow-turn-left"></i>
            </a>
          </div>
        </article>
      </div>
    `;
  };

  const renderNotFound = () => {
    document.title = 'Projet introuvable | Dieudonné Amoikon';
    setMeta('meta[name="robots"]', 'noindex, follow');
    root.innerHTML = `
      <h1 class="text-4xl md:text-7xl text-center font-cocon text-gray-800/70">Projet introuvable</h1>
      <div class="mx-auto relative w-full lg:w-5xl mt-20 px-4 text-gray-400">
        <p>Le projet demande n'existe pas encore dans la base JSON.</p>
        <a href="projets.html" class="inline-flex mt-6 text-green-500 hover:text-green-300">Retour aux projets</a>
      </div>
    `;
  };

  if (!slug) {
    renderNotFound();
    return;
  }

  fetch('./assets/data/projects.json')
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return response.json();
    })
    .then((data) => {
      const project = (data.projects || []).find((item) => item.slug === slug);
      if (!project) {
        renderNotFound();
        return;
      }

      render(project);
    })
    .catch((error) => {
      console.warn('Impossible de charger la fiche projet.', error);
      renderNotFound();
    });
})();
