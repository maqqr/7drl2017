```
 _____ ____  ____  ____  _____  _     _  _  __ _____
/    //  __\/  _ \/ ___\/__ __\/ \   / \/ |/ //  __/
|  __\|  \/|| / \||    \  / \  | |   | ||   / |  \  
| |   |    /| \_/|\___ |  | |  | |_/\| ||   \ |  /_ 
\_/   \_/\_\\____/\____/  \_/  \____/\_/\_|\_\\____\

```

*Icy dungeons, cold blizzards and an endless winter. An evil wizard has cursed the world and made it permanently frozen. The only way to break the curse is to defeat the wizard.*

Frostlike is a seven day roguelike challange 2017 entry.

The game focuses on cold environments and the player has to fight against monsters and crawl through dungeons, but also keep themselves warm.

Status: *Working on it*

### Build instructions

```
bower install
pulp build --skip-entry-point --main Rogue --modules Rogue --to output.js
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