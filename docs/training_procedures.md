# Training Procedures

## Dataset Preparation
- Diverse conversational corpora emphasizing emotional nuance and cultural sensitivity.
- Deduplicate, normalize whitespace, and remove PII.
- Label tone, sentiment, intent, and persona where applicable.

## Fine-Tuning
- Base: GPT-4-class or newer.
- Objective: Instruction-following with empathy and context retention.
- Methods: Few-shot, LoRA/PEFT, RLHF with human-likeness and empathy rewards.

## Affective Calibration
- Train a lightweight sentiment/affect classifier for real-time guidance.
- Align tone adjustments with user sentiment trajectory.

## Safety Calibration
- Toxicity and bias datasets for negative sampling and mitigation.
- Adversarial prompts for robustness.

## Validation
- Human-likeness panel ratings and empathy scores.
- Cultural sensitivity checks.
- Regression suite on style and safety invariants.
