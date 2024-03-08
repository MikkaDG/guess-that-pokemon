# guess-that-pokemon

**Installatie** <br>
Wanneer je de documenten uit de Github repository hebt gedownload en verder wilt werken met dit project, is het handig om als eerste npm install uit te voeren in de directory waar je server staat. Zie onderstaande structuur:

```
SERVER
├── .env
├── .gitignore
├── server.js
CLIENT
├── index.html
├── script.js
└── style.css
```

Vervolgens verander je de naam van .env-example naar .env en vul je de juiste informatie in van de api key die jij gaat gebruiken.

Zet het volgende in je .gitignore file:
```
node_modules
.env
```

Mocht je interesse hebben om het project live te zetten op bijvoorbeeld DigitalOcean dan zit er ook een Dockerfile inbegrepen in deze repository. 
De Dockerfile werkt als een soort routebeschrijving zodat de deployment van een web page via DigitalOcean vrijwel automatisch gaat.

**Eventuele issues**<br>
De enige issue die ik kan bedenken bij dit project is dat de omschrijving van de Pokémon die de AI geeft niet altijd even goed is, vooral van recentere generaties zal het niet altijd even accuraat zijn
