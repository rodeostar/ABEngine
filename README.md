
# AutoBattler Engine

A game engine for auto-battler strategy games. This game works in an arena setting, where user's join a queue via websocket and play against other players of the same turn. Combat results in either a loss, win, or draw. Players have ten lives, and receive 10 gold each turn to spend in the random generated shop.


## Architecture
100% Typescript utilizing Deno's typescript runtime.

**UI:** Preact

**API/Web Server:** Oak

**Communication Layer**: Websockets

## Running the codebase
Requires Deno and GNU make.

- Install Deno: https://deno.land/manual/getting_started/installation
- Install GNU Make: https://www.gnu.org/software/make/

Open two terminals and run `make ws` in the first and `make run` in the second.

Head to http://localhost:8000.

## Test Coverage
Tests are written using the Deno test framework. 

`make test` will run the test suite.


![alt text](https://i.imgur.com/rt6Uxbn.png)
