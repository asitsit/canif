# A1 : Générateur de QR code

Adresse : `/qr-code`.

- Contenus : lien, texte, accès Wi-Fi (format WIFI standard, caractères spéciaux échappés), e-mail, téléphone.
- Couleurs avec alerte de contraste (et de code plus clair que le fond), logo au centre (niveau de correction H, 30 %).
- PNG 512, 1024 ou 2048 px ; SVG avec logo intégré. Bibliothèque `qrcode` (MIT), chargée seulement sur cette page.
- Tout reste dans le navigateur, y compris le mot de passe Wi-Fi (inscrit en clair dans le code, dit dans l'outil).
