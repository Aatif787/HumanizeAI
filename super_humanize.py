import sys
import json
import re
import random
import spacy
from typing import List, Dict

# Load English NLP model
try:
    nlp = spacy.load("en_core_web_md")
except:
    # Fallback to small model if medium isn't available
    try:
        nlp = spacy.load("en_core_web_sm")
    except:
        print(json.dumps({"error": "Spacy model not found. Please install en_core_web_sm"}))
        sys.exit(1)

class SuperHumanizeEngine:
    def __init__(self):
        self.transition_variations = {
            "addition": ["Plus,", "And also,", "On top of that,", "Not to mention,"],
            "contrast": ["But honestly,", "Though,", "Still,", "On the flip side,"],
            "conclusion": ["Basically,", "So yeah,", "In short,", "All in all,"],
            "example": ["Like,", "For instance,", "Say,"],
        }
        
        self.filler_words = ["literally", "basically", "actually", "honestly", "kind of", "sort of", "just"]

    def analyze_burstiness(self, text: str) -> float:
        """Calculate the variance in sentence lengths (Human-like writing has high variance)."""
        doc = nlp(text)
        lengths = [len(sent.text.split()) for sent in doc.sents]
        if not lengths: return 0.0
        mean = sum(lengths) / len(lengths)
        variance = sum((x - mean) ** 2 for x in lengths) / len(lengths)
        return variance

    def inject_linguistic_noise(self, text: str) -> str:
        """Inject subtle human-like imperfections and variations."""
        doc = nlp(text)
        sentences = [sent.text for sent in doc.sents]
        modified_sentences = []

        for i, sent in enumerate(sentences):
            s_text = sent.strip()
            
            # 1. Break predictable transitions
            if s_text.startswith(("Furthermore", "Moreover", "Additionally")):
                s_text = re.sub(r"^(Furthermore|Moreover|Additionally),?\s*", random.choice(self.transition_variations["addition"]) + " ", s_text)
            elif s_text.startswith("However"):
                s_text = re.sub(r"^However,?\s*", random.choice(self.transition_variations["contrast"]) + " ", s_text)

            # 2. Inject fillers occasionally
            if random.random() < 0.1:
                words = s_text.split()
                if len(words) > 5:
                    idx = random.randint(1, len(words) - 1)
                    words.insert(idx, random.choice(self.filler_words))
                    s_text = " ".join(words)

            modified_sentences.append(s_text)

        return " ".join(modified_sentences)

    def optimize_rhythm(self, text: str) -> str:
        """Adjust sentence flow to mimic human internal monologue."""
        # Simple heuristic: Combine short sentences or break long ones randomly to vary 'burstiness'
        doc = nlp(text)
        sents = list(doc.sents)
        if len(sents) < 2: return text
        
        new_text = []
        i = 0
        while i < len(sents):
            curr = sents[i].text.strip()
            # Randomly combine two short sentences
            if i + 1 < len(sents) and len(curr.split()) < 10 and len(sents[i+1].text.split()) < 10 and random.random() < 0.3:
                combined = curr.rstrip(".") + ", and " + sents[i+1].text.strip()
                new_text.append(combined)
                i += 2
            else:
                new_text.append(curr)
                i += 1
                
        return " ".join(new_text)

    def process(self, text: str) -> Dict:
        """Main entry point for humanization."""
        initial_burstiness = self.analyze_burstiness(text)
        
        # Humanization Pipeline
        processed = self.inject_linguistic_noise(text)
        processed = self.optimize_rhythm(processed)
        
        final_burstiness = self.analyze_burstiness(processed)
        
        return {
            "humanized": processed,
            "metrics": {
                "initial_burstiness": round(initial_burstiness, 2),
                "final_burstiness": round(final_burstiness, 2),
                "improvement": round(final_burstiness - initial_burstiness, 2)
            }
        }

if __name__ == "__main__":
    if len(sys.argv) > 1:
        input_text = sys.argv[1]
    else:
        # Read from stdin if no arg provided
        input_text = sys.stdin.read()
    
    engine = SuperHumanizeEngine()
    result = engine.process(input_text)
    print(json.dumps(result))
