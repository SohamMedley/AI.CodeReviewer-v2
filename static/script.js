document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileUpload');
    const codeInput = document.getElementById('codeInput');
    const executeBtn = document.getElementById('executeBtn');
    const outputModule = document.getElementById('outputModule');
    const codeDisplay = document.getElementById('codeDisplay');
    const explainModule = document.getElementById('explainModule');
    const explainText = document.getElementById('explainText');
    const copyBtn = document.getElementById('copyBtn');
    const outputHeaderTitle = document.getElementById('outputHeaderTitle');

    if(!dropZone) return; // Exit if not on the main analyzer page

    // Drag & Drop
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, e => {
            e.preventDefault();
            e.stopPropagation();
        }, false);
    });

    dropZone.addEventListener('dragenter', () => dropZone.classList.add('dragover'));
    dropZone.addEventListener('dragover', () => dropZone.classList.add('dragover'));
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
    
    dropZone.addEventListener('drop', (e) => {
        dropZone.classList.remove('dragover');
        handleFiles(e.dataTransfer.files);
    });

    fileInput.addEventListener('change', function() { handleFiles(this.files); });

    function handleFiles(files) {
        if (files.length > 0) {
            const reader = new FileReader();
            reader.onload = (e) => codeInput.value = e.target.result;
            reader.readAsText(files[0]);
        }
    }

    // Smart Notification System - Updated for Cross-Toggle Actions
    function showNotification(message, actionType) {
        const container = document.getElementById('toastContainer');
        container.innerHTML = ''; // Clear previous notifications

        const toast = document.createElement('div');
        toast.className = 'cyber-toast';
        
        let html = `<span>${message}</span>`;
        if (actionType) {
            html += `
                <div class="toast-actions">
                    <button class="toast-btn primary" id="toastYesBtn">YES</button>
                    <button class="toast-btn" id="toastNoBtn">DISMISS</button>
                </div>
            `;
        }
        toast.innerHTML = html;
        container.appendChild(toast);

        if (actionType) {
            toast.querySelector('#toastYesBtn').addEventListener('click', () => {
                // If user clicks yes, turn BOTH toggles ON and re-execute
                document.getElementById('autoFix').checked = true;
                document.getElementById('autoExplain').checked = true;
                toast.remove();
                executeBtn.click();
            });
            toast.querySelector('#toastNoBtn').addEventListener('click', () => {
                toast.remove();
            });
        } else {
            // Auto dismiss after 4 seconds
            setTimeout(() => {
                toast.style.animation = 'slideOutLeft 0.3s ease-in forwards';
                setTimeout(() => toast.remove(), 300);
            }, 4000);
        }
    }

    // Execute API Call
    executeBtn.addEventListener('click', async () => {
        const code = codeInput.value;
        const autoFix = document.getElementById('autoFix').checked;
        const autoExplain = document.getElementById('autoExplain').checked;

        if (!code.trim()) return alert("No input detected.");

        executeBtn.disabled = true;
        executeBtn.innerText = "PROCESSING...";

        // UI Polish: Completely hide the code box if Auto-Fix is off
        const codeContainer = document.querySelector('.code-container');
        
        if (autoFix) {
            outputHeaderTitle.innerText = "// OPTIMIZED_OUTPUT";
            outputHeaderTitle.style.color = "var(--accent)";
            codeContainer.style.display = "block";
            copyBtn.style.display = "inline-block";
        } else {
            outputHeaderTitle.innerText = "// DIAGNOSTIC_REPORT";
            outputHeaderTitle.style.color = "var(--text-dim)";
            codeContainer.style.display = "none";
            copyBtn.style.display = "none";
        }

        try {
            const response = await fetch('/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code, autoFix, autoExplain })
            });

            const result = await response.json();

            if (result.error) throw new Error(result.error);

            // Trigger Smart Notifications based on Toggles & AI Status
            if (!autoFix && autoExplain && result.status === 'WRONG') {
                showNotification("Your code has issues. Do you want to fix it?", 'fix');
            } else if (autoFix && !autoExplain && result.status === 'WRONG') {
                showNotification("Do you want explanation of this code?", 'explain');
            }

            // Show Results
            outputModule.classList.remove('hidden');
            codeDisplay.textContent = result.fixed_code;
            
            if (window.Prism) {
                Prism.highlightElement(codeDisplay);
            }

            if (autoExplain && result.explanation) {
                explainModule.classList.remove('hidden');
                
                // Height fix if no code is shown
                if (!autoFix) {
                    explainModule.classList.add('full-height');
                } else {
                    explainModule.classList.remove('full-height');
                }
                
                // Use Marked.js to parse the Markdown
                if (window.marked) {
                    explainText.innerHTML = marked.parse(result.explanation);
                } else {
                    explainText.textContent = result.explanation; // Fallback
                }
            } else {
                explainModule.classList.add('hidden');
                explainModule.classList.remove('full-height');
            }

            if (window.innerWidth < 900) {
                outputModule.scrollIntoView({ behavior: 'smooth' });
            }

        } catch (err) {
            alert("API Error: " + err.message);
        } finally {
            executeBtn.disabled = false;
            executeBtn.innerText = "EXECUTE SEQUENCE";
        }
    });

    // Copy to Clipboard
    if(copyBtn) {
        copyBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(codeDisplay.textContent).then(() => {
                const originalText = copyBtn.innerText;
                copyBtn.innerText = "COPIED";
                copyBtn.style.background = "var(--accent)";
                copyBtn.style.color = "var(--bg-base)";
                setTimeout(() => {
                    copyBtn.innerText = originalText;
                    copyBtn.style.background = "";
                    copyBtn.style.color = "";
                }, 1500);
            });
        });
    }
});