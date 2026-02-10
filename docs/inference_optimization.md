# Inference Optimization Guide

## Latency Targets
- Sub-100 ms for local pipelines on typical inputs.
- Batch and streaming modes for long content.

## Techniques
- Quantization and distillation for edge models.
- Caching: embeddings, style profiles, and memory lookups.
- Parallelization: workers for heavy analysis.
- Early exits when risk and empathy scores pass thresholds.

## Fallbacks
- LLM gateway disabled → local pipeline executes.
- Advanced pipeline error → basic pipeline executes.
- Graceful degradation under load with queue backpressure.

## Deployment Notes
- Configure LLM_GATEWAY_URL and LLM_API_KEY via environment.
- Use CDN and HTTP/2 for static assets.
- Monitor performance via server metrics endpoints.
