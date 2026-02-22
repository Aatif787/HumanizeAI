document.addEventListener('DOMContentLoaded', () => {
    const inputText = document.getElementById('input-text');
    const outputText = document.getElementById('output-text');
    const humanizeBtn = document.getElementById('humanize-button');
    const clearBtn = document.getElementById('clear-input');
    const copyBtn = document.getElementById('copy-output');
    const wordCountInput = document.getElementById('input-word-count');
    const wordCountOutput = document.getElementById('output-word-count');
    const loadingOverlay = document.getElementById('processing-overlay');
    const statusMessage = document.getElementById('status-message');
    const spinner = document.getElementById('processing-spinner');
    
    // Options
    const styleSelect = document.getElementById('writing-style');
    const humanizationSlider = document.getElementById('humanization-level-slider');
    const variationsSelect = document.getElementById('natural-variations');
    
    // Quick samples
    const sampleBtns = document.querySelectorAll('.quick-sample');

    // State
    let isProcessing = false;

    // Word Count
    const updateWordCount = (text, element) => {
        const count = text.trim().split(/\s+/).filter(w => w.length > 0).length;
        element.textContent = `${count} Word${count !== 1 ? 's' : ''}`;
    };

    inputText.addEventListener('input', () => {
        updateWordCount(inputText.value, wordCountInput);
    });

    // Clear Input
    clearBtn.addEventListener('click', () => {
        inputText.value = '';
        updateWordCount('', wordCountInput);
        inputText.focus();
    });

    // Copy Output
    copyBtn.addEventListener('click', async () => {
        if (!outputText.value) return;
        try {
            await navigator.clipboard.writeText(outputText.value);
            const originalIcon = copyBtn.innerHTML;
            copyBtn.innerHTML = '<i class="fa-solid fa-check text-green-500"></i>';
            setTimeout(() => {
                copyBtn.innerHTML = originalIcon;
            }, 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    });

    // Quick Samples
    sampleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const type = btn.dataset.sample;
            if (type === 'academic') {
                inputText.value = "The utilization of artificial intelligence in contemporary society has become increasingly prevalent, necessitating a comprehensive analysis of its implications.";
            } else {
                inputText.value = "AI is being used a lot these days, so we really need to look at what that means for everyone.";
            }
            updateWordCount(inputText.value, wordCountInput);
        });
    });

    // Humanize Action
    humanizeBtn.addEventListener('click', async () => {
        if (isProcessing) return;
        
        const text = inputText.value.trim();
        if (!text) {
            statusMessage.textContent = 'Please enter some text first';
            statusMessage.className = 'text-sm font-bold uppercase tracking-widest text-red-500 mb-6 h-6 animate-pulse';
            return;
        }

        // Start Processing
        isProcessing = true;
        humanizeBtn.disabled = true;
        humanizeBtn.classList.add('opacity-75', 'cursor-not-allowed');
        spinner.classList.remove('hidden');
        loadingOverlay.classList.remove('hidden');
        statusMessage.textContent = '';
        
        try {
            // Map slider values to API expected values
            const complexityMap = ['low', 'medium', 'high', 'high'];
            const humanizationLevel = humanizationSlider.value; // 0-3
            
            const payload = {
                text: text,
                style: styleSelect.value,
                complexity: complexityMap[humanizationLevel] || 'medium',
                errorLevel: variationsSelect.value === 'none' ? 'minimal' : (variationsSelect.value === 'high' ? 'high' : 'moderate'),
                useAdvanced: true
            };

            const response = await fetch('/api/humanize', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to process text');
            }

            // Success
            const humanizedText = data.data.humanizedText;
            
            // Typing effect
            outputText.value = '';
            let i = 0;
            const typeSpeed = 5; // ms per char
            
            loadingOverlay.classList.add('hidden');
            
            const typeInterval = setInterval(() => {
                outputText.value += humanizedText.charAt(i);
                outputText.scrollTop = outputText.scrollHeight;
                i++;
                if (i >= humanizedText.length) {
                    clearInterval(typeInterval);
                    isProcessing = false;
                    humanizeBtn.disabled = false;
                    humanizeBtn.classList.remove('opacity-75', 'cursor-not-allowed');
                    spinner.classList.add('hidden');
                    updateWordCount(outputText.value, wordCountOutput);
                    
                    // Update quality metrics if available
                    if (data.data.results && data.data.results.confidenceScore) {
                        const score = Math.round(data.data.results.confidenceScore);
                        document.getElementById('human-score').textContent = `${score}%`;
                        document.getElementById('human-score-bar').style.width = `${score}%`;
                        document.getElementById('quality-indicators').classList.remove('hidden');
                    }
                }
            }, typeSpeed);

        } catch (error) {
            console.error('Error:', error);
            statusMessage.textContent = 'Error: ' + error.message;
            statusMessage.className = 'text-sm font-bold uppercase tracking-widest text-red-500 mb-6 h-6';
            isProcessing = false;
            humanizeBtn.disabled = false;
            humanizeBtn.classList.remove('opacity-75', 'cursor-not-allowed');
            spinner.classList.add('hidden');
            loadingOverlay.classList.add('hidden');
        }
    });
});
