# API Usage Examples

## Humanization Endpoint
POST /api/humanize
Body:
{
  "text": "Input text",
  "style": "casual",
  "complexity": "medium",
  "formality": "medium",
  "useAdvanced": true
}

## Detection Models Info
GET /api/detect/models

## Performance Metrics
GET /api/detect/performance

## LLM Gateway (optional)
POST ${LLM_GATEWAY_URL}
Headers:
- Authorization: Bearer ${LLM_API_KEY}
Body:
{
  "prompt": "Text to humanize",
  "style": "empathetic",
  "formality": "medium"
}
