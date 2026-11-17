# Florida Field Guide

Open the guide on any phone or computer:

https://philipgraffshapiro.github.io/florida-field-guide-site/

This repository contains the public edition: 721 destinations, 77 stays, maps, camping and work stops. Private notes and personal browser choices are excluded. Source version: 1df7e71b1c95fc6cc8e3f8e6857d7e911fdbd6e5.

The HTML page loads separate application, style and vendor files from versioned assets, with the catalog in a JSON file. site-assets.json lists the exact SHA-256 for each published file. The map libraries are locally repaired components of Leaflet 1.9.4 and Leaflet.markercluster 1.5.3, tested against those original versions. Their license notices are preserved.

The site is published by GitHub Pages from the root of main. Update only with a verified website build through publish-site.mjs in the source repository. It validates every asset before writing and replaces the entry page last. Retain previous versioned assets for cached pages. Dates and prices remain research snapshots; follow each place's sources for current information.
