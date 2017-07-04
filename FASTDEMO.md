# Fast Demo
This document describes how to get a local server running quickly so you can try Botwars out.

Start by checking out this repo into a directory of your choice.

## Install tools
You will need the following programs:

* Node.js - nodejs.org
* npm     - npmjs.com


## Setup

Open up a console (terminal or cmd) and `cd` into the project directory.

Start by running `npm install` in the project directory.

## Start Server

With the same console opened above, run `nodejs main.js`. You should see some text indicating the port is open.

## Start a client

Open up a new console and `cd` into the project directory. Then change directoy into the `test_client` folder.

Run `nodejs starterBot.js`.

You should see some output. The outputs is dumping updates from the server and commands and commands sent back to the server. Also there are some states listed that the script keeps track of.

If you see a strange error message, make sure the server is running.

## Stopping things

To stop the client or the server use `ctrl-c`.



