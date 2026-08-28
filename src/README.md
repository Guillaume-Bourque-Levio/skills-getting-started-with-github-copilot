# Gestionnaire de reçus

Une petite application FastAPI pour enregistrer, consulter, filtrer et supprimer ses reçus. Les données sont conservées en mémoire et sont réinitialisées au redémarrage.

## Démarrage

```bash
pip install -r ../requirements.txt
uvicorn app:app --reload
```

Ouvrez ensuite <http://localhost:8000/>.

## API

| Méthode | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/receipts` | Liste les reçus, avec un filtre optionnel `category` |
| `GET` | `/receipts/{id}` | Affiche un reçu |
| `POST` | `/receipts` | Crée un reçu (`merchant`, `amount`, `date`, `category`, `notes`) |
| `DELETE` | `/receipts/{id}` | Supprime un reçu |
