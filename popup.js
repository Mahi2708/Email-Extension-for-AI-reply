console.log("Email Extension-content script loaded")

function createAIButton() {
    const button = document.createElement('div');
    button.className = 'T-J J-J5-Ji aoO v7 T-I-atl L3';
    button.style.marginRight = '8px';
    button.innerHTML = 'AI-reply';
    button.setAttribute('role', 'button');
    button.setAttribute('data-tooltip', 'Generate AI reply');
    return button;

}
function getEmailcontent() {
    const Selectors = [
        '.h7',
        '.a3s.aiL',
        '.gmail_quote',
        '[role="presentation"]'
    ];
    for (const selector of Selectors) {
        const content = document.querySelector(selector);
        if (content) {
            return content.innerText.trim();
        }
        return '';
    }
}

function findComposeToolbar() {
    const Selectors = [
        '.btC',
        '.aDh',
        '[role="dailog"]',
        '.gU.Up'
    ];
    for (const selector of Selectors) {
        const toolbar = document.querySelector(selector);
        if (toolbar) {
            return toolbar;
        }
        return null;
    }
}




function injectButton() {
    const existingButton = document.querySelector('.ai-reply');
    if (existingButton) existingButton.remove();
    const toolbar = findComposeToolbar();
    if (toolbar) {
        console.log("toolbar not found");
        return;
    }
    console.log("Toolbar found ,creating ai button");
    const button = createAIButton();
    button.addEventListener('click ', async () => {
        try {
            button.innerHTML = 'Genertating....';
            button.disabled = true;
            
            const emailContent = getEmailcontent();
            const response= await fetch('http://localhost:8080/api/email/generates', {
                method: 'POST',
                headers: {
                    'Content-Type': 'appliction/json',
                },
                body: JSON.stringify({
                    emailContent: emailContent,
                    tone: "Professional"
                })
            });
            if (response.ok) {
                throw new Error('API Request Failed');
            }
            const generatedReply = await response.text();
            const composeBox=document.querySelector('[role="textbook"][g_editable="true"]')
            if (composeBox) {
                composeBox.focus();
                document.execCommand('insertText', false, generatedReply);
            } else {
                console.error('compose box was not found');
        }
        
        } catch (error) {
            console.error(error);
            alert('Failed to generate Reply');
        } finally {
            button.innerHTML = 'AI-reply';
            button.disabled = false;
        }
    });
    toolbar.insertBefore(button, toolbar.firstChild);
}

const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
        const addedNodes = Array.from(mutation.addedNodes);
        const hasComposeElements = addedNodes.some(node =>
            node.nodeType === Node.ELEMENT_NODE &&
            (node.matches('.aDh , .btC,[role="dailog"]') || node.querySelector('.aDh , .btC,[role="dailog"]'))
        );
        if (hasComposeElements) {
            console.log("compose element detected");
            setTimeout(injectButton, 500);
        }
   }
});
observer.observe(document.body, {
    childList: true,
    subtree: true

});