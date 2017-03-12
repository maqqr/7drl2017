```
  █████▒██▀███   ▒█████    ██████ ▄▄▄█████▓ ██▓     ██▓ ██ ▄█▀▓█████ 
▓██   ▒▓██ ▒ ██▒▒██▒  ██▒▒██    ▒ ▓  ██▒ ▓▒▓██▒    ▓██▒ ██▄█▒ ▓█   ▀ 
▒████ ░▓██ ░▄█ ▒▒██░  ██▒░ ▓██▄   ▒ ▓██░ ▒░▒██░    ▒██▒▓███▄░ ▒███   
░▓█▒  ░▒██▀▀█▄  ▒██   ██░  ▒   ██▒░ ▓██▓ ░ ▒██░    ░██░▓██ █▄ ▒▓█  ▄ 
░▒█░   ░██▓ ▒██▒░ ████▓▒░▒██████▒▒  ▒██▒ ░ ░██████▒░██░▒██▒ █▄░▒████▒
 ▒ ░   ░ ▒▓ ░▒▓░░ ▒░▒░▒░ ▒ ▒▓▒ ▒ ░  ▒ ░░   ░ ▒░▓  ░░▓  ▒ ▒▒ ▓▒░░ ▒░ ░
 ░       ░▒ ░ ▒░  ░ ▒ ▒░ ░ ░▒  ░ ░    ░    ░ ░ ▒  ░ ▒ ░░ ░▒ ▒░ ░ ░  ░
 ░ ░     ░░   ░ ░ ░ ░ ▒  ░  ░  ░    ░        ░ ░    ▒ ░░ ░░ ░    ░   
          ░         ░ ░        ░               ░  ░ ░  ░  ░      ░  ░
```

*Icy dungeons, cold blizzards and an endless winter. An evil wizard has cursed the world and made it permanently frozen. The only way to break the curse is to defeat the wizard.*

Frostlike is a seven day roguelike challenge 2017 entry made using Typescript and Purescript.

The game focuses on cold environments and the player has to fight against monsters and crawl through dungeons, but also keep themselves warm.

Status: **Done** :white_check_mark:

You can play the game here: https://drl2017-fa07d.firebaseapp.com/

### Screenshot

![Screenshot](/screenshot/shot.png)

### Build instructions

```
bower install
pulp build --skip-entry-point --main Rogue --modules Rogue,Random,ContentGenerator --to output.js
tsc -p . --out tsoutput.js
```

### tasks.json for Visual Studio Code

```
{
    "version": "0.1.0",
    "command": "tsc",
    "isShellCommand": true,
    "args": ["-p", ".", "--out", "tsoutput.js"],
    "showOutput": "silent",
    "problemMatcher": "$tsc"
}
```
