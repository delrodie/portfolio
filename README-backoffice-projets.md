# Backoffice projets statique

Cette configuration garde le portfolio compatible avec GitHub Pages.

## Fichiers principaux

- `assets/data/projects.json` : base de donnees JSON exportable.
- `projets.html` : liste des projets, rendue depuis le JSON.
- `projet.html?slug=...` : page detail dynamique.
- `admin-projets.html` : mini backoffice HTML/JS pour modifier les donnees et exporter un nouveau JSON.

## Workflow de mise a jour

1. Lancer le site avec un serveur local, par exemple :

```bash
python3 -m http.server 4173
```

2. Ouvrir `http://127.0.0.1:4173/admin-projets.html`.
3. Modifier, ajouter ou supprimer les projets.
4. Cliquer sur `Exporter projects.json`.
5. Remplacer `assets/data/projects.json` par le fichier exporte.
6. Publier les changements sur GitHub Pages.

Le nom doit rester exactement `projects.json`, sans espace avant `.json`. Les pages publiques désactivent le cache pour cette requête afin qu'un fichier remplacé soit relu dès le prochain chargement.

Le backoffice ne modifie pas directement le fichier dans le dossier, car un site statique GitHub Pages n'a pas de serveur capable d'ecrire sur le disque. Il genere donc un fichier JSON pret a publier.

## Affichage public

Les projets sont tries automatiquement par date decroissante. Les dates les plus recentes s'affichent en haut, puis les projets plus anciens descendent dans la liste.

La page `projets.html` affiche automatiquement 5 projets par page et ajoute une pagination si la base JSON contient plus de 5 projets.

## Details projet

Dans `admin-projets.html`, la zone `Details du projet` permet d'ajouter les sections visibles sur `projet.html?slug=...`.

Chaque section contient :

- un titre, par exemple `Contexte & objectifs` ;
- des points de detail, un par ligne.

Les points de détail et le résumé acceptent un HTML limité et sécurisé : liens `<a href="https://...">`, emphase `<strong>`/`<em>`, soulignement `<u>`, retour à la ligne `<br>` et code `<code>`. Les scripts, iframes, formulaires, gestionnaires d'événements et protocoles dangereux sont automatiquement supprimés à l'affichage.

Ces sections remplacent les anciennes pages detail ecrites a la main comme `projet-ongkagninmin.html` et `projet-nyaka2026.html`.
