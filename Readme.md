# Test Technique CCM Benchmark

Je vous fournis ci-joint le test technique tel que décrit dans le fichier instruction.md.
J'ai séparé les différent sous objectif dans différents dossier.

##### /!\ n'oubliez pas pour chaque sous objectif d'utiliser la commande npm install pour installer les différentes dépendances 


Le premier dossier regroupe les deux premiers sous objectifs dans le but d'avoir le front et le back de fonctionnel pour pouvoir le tester directement.

pour les autres sous-objectif ils sont respectivement dans les dossiers nommés *SO_#* 
(*# etant le numéro du sous objectif*)

J'ai rajouté un système de logging pour chaque sous objectif, qui permet d'avoir une trace de l'ouput de la console, chaque logs sont stockés dans le sous-dossier *logs* contenant lui même un sous dossier a la date du jour au format *dd-mm-YYYY*

A partir du sous objectif numéro 4 il est demandé d'archiver les hits envoyé au backend  (DISPLAY et VIEWED ) pour des raisons de praticités j'ai décidé d'enregistrer ça dans un fichier JSON stocker dans le sous dossier nommé *Archives* 

Dans le sous objectif numéro 5 j'ai rajouté un outils de ligne de commande entre le serveur Node.js et le Front sous forme d'un websocket.

Le système de ligne de commande démarre quand le websocket est connecté au client.
une fois celui-ci connecté n'hésitez pas a utiliser la command 'help' pour voir la liste des commandes disponibles.


