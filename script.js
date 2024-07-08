const text = "olá! sou o Kaique Lopes, UX/UI designer e desenvolvedor web front end.";
const textElement = document.getElementById("home-title");


let index = 0;

function type() {
  if (index < text.length) {
    textElement.textContent += text[index];
    index++;
  } else {
    textElement.innerHTML += '<span id="blinking-cursor">|</span>';
    clearInterval(typingInterval);
    setInterval(blinkCursor, 500);
  }
}

function blinkCursor() {
  const cursor = document.getElementById("blinking-cursor");
  cursor.style.visibility = (cursor.style.visibility === 'hidden') ? 'visible' : 'hidden';
}
const typingInterval = setInterval(type, 100);