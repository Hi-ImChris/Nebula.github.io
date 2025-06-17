let emojiPicker = null;

function initEmojiPicker() {
    const picker = new EmojiMart.Picker({
        data: async () => {
            const response = await fetch('https://cdn.jsdelivr.net/npm/@emoji-mart/data');
            return response.json();
        },
        onEmojiSelect: (emoji) => {
            insertEmoji(emoji.native);
        },
        theme: 'dark',
        categories: ['frequent', 'people', 'nature', 'foods', 'activity', 'objects', 'symbols', 'flags'],
        style: {
            width: '320px'
        }
    });
    
    document.getElementById('emoji-picker').appendChild(picker);
    emojiPicker = picker;
}

function insertEmoji(emoji) {
    const messageInput = document.getElementById('message-input');
    const cursorPos = messageInput.selectionStart;
    const text = messageInput.value;
    messageInput.value = text.slice(0, cursorPos) + emoji + text.slice(cursorPos);
    messageInput.focus();
    closeEmojiPicker();
}

function toggleEmojiPicker(event) {
    event.stopPropagation();
    const picker = document.getElementById('emoji-picker');
    const overlay = document.querySelector('.overlay');
    
    if (picker.style.display === 'none') {
        picker.style.display = 'block';
        overlay.style.display = 'block';
    } else {
        closeEmojiPicker();
    }
}

function closeEmojiPicker() {
    document.getElementById('emoji-picker').style.display = 'none';
    document.querySelector('.overlay').style.display = 'none';
}

// Initialize event listeners
document.addEventListener('DOMContentLoaded', () => {
    initEmojiPicker();
    
    // Close emoji picker when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.emoji-wrapper')) {
            closeEmojiPicker();
        }
    });
});

export { toggleEmojiPicker, closeEmojiPicker };