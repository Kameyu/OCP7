# Projet 7 OpenClassrooms Développeur Web

# Note importante
L'API utilise des variables d'environnement pour fonctionner correctement.
Pour cela, vous devez créer un fichier `.env` à la racine du projet et y assigner 3 variables comme suit :
```
PORT=
API_SECRET=
MONGODB_SRV=
```

* `PORT` : le numéro du port sur lequel l'API doit démarrer
* `API_SECRET` : le token unique de l'API pour le hachage des mots de passe
* `MONGODB_SRV` : l'adresse mongodb+srv que vous utiliserez pour votre base de données.
  * Elle doit être sous la forme suivante : `mongodb+srv://<user>:<password>@adresse-serveur.domaine/`, avec `<user>` et `<password>` étant votre nom d'utilisateur et votre mot de passe.
