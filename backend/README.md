# Backend API

This service provides a minimal Express API with file-backed storage.

## Setup

```sh
npm install
npm run dev
```

Configure runtime settings by copying `.env.example` to `.env`.

## Endpoints

### Health

`GET /api/health`

### Items

- `GET /api/items` (optional query: `status=pending|active|archived`, `q=search`)
- `GET /api/items/:id`
- `POST /api/items`
- `PUT /api/items/:id`
- `DELETE /api/items/:id`

#### Item payload

```json
{
  "name": "Example",
  "description": "Optional description",
  "status": "pending"
}
```
