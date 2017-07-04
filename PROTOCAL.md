# Protocal Document
This document lists the protocal of communication between the server and the client. Each message is a line of JSON seperated by a newline character `\n`.


TODO: Add good detailed documentation.

## Protocal Dump
The following is an example of the server status and client command:

Server Status:
```
{"type":"status","username":"hansonry","serverTickMS":500,"vision":[{"x":0,"y":0,"type":"pawn","pawn":{"id":"SJJCiUdVb","ownerName":"hansonry","facing":"west","health":10,"view":2,"storageType":"battery","storageCount":63,"storageMax":100,"charge":44,"chargeMax":100}},{"x":0,"y":-1,"type":"ore","ore":{"value":87,"rate":1,"max":100}},{"x":1,"y":0,"type":"item","item":{"type":"battery","count":100}},{"x":1,"y":0,"type":"building","building":{"type":"smallSolar","view":1,"health":10,"ownerName":"hansonry"}},{"x":-1,"y":0,"type":"building","building":{"type":"smallFactory","view":1,"health":10,"ownerName":"hansonry","cost":100}}]}
```

Client Response:
```
{"type":"command","commands":[{"type":"mine","pawnId":"BkefVv_4b"}]}
```


