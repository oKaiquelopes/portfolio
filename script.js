window.addEventListener('DOMContentLoaded', () => {
    // HEADER SCROLL
    window.addEventListener('scroll', () => {
        document.getElementById('header').classList.toggle('scrolled', window.scrollY > 40);
    });

    // HAMBURGER
    const hamburger = document.getElementById('hamburger');
    const menu = document.getElementById('menuMobile');
    const overlay = document.getElementById('overlay');
    function closeMenu() {
        hamburger.classList.remove('open');
        menu.classList.remove('active');
        overlay.classList.remove('active');
    }
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('open');
        menu.classList.toggle('active');
        overlay.classList.toggle('active');
    });
    overlay.addEventListener('click', closeMenu);
    menu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));

    // REVEAL ON SCROLL
    const obs = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.classList.add('active');
                obs.unobserve(e.target);
            }
        });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
});

// FORM — global so onclick="" works
let current = 1;
const data = { servico:'', prazo:'', orcamento:'', nome:'', contato:'', detalhes:'' };
const labels = ['01 / 04','02 / 04','03 / 04','04 / 04'];

function updateProgress() {
    document.getElementById('progress').innerText = labels[current - 1];
    document.getElementById('progressBar').style.width = (current / 4 * 100) + '%';
}
function nextStep() {
    document.getElementById('step' + current).classList.remove('active');
    current++;
    document.getElementById('step' + current).classList.add('active');
    updateProgress();
}
function prevStep() {
    document.getElementById('step' + current).classList.remove('active');
    current--;
    document.getElementById('step' + current).classList.add('active');
    updateProgress();
}
function selectOption(valor, tipo) {
    data[tipo] = valor;
    event.currentTarget.classList.add('chosen');
    setTimeout(nextStep, 280);
}
function enviarWhats() {
    data.orcamento = document.getElementById('orcamento').value;
    data.nome      = document.getElementById('nome').value;
    data.contato   = document.getElementById('contato').value;
    data.detalhes  = document.getElementById('detalhes').value;
    const msg = '*Orçamento via Portfólio*\n\nServiço: ' + data.servico + '\nPrazo: ' + data.prazo + '\nOrçamento: ' + (data.orcamento || 'Não informado') + '\nNome: ' + data.nome + '\nContato: ' + data.contato + '\nDetalhes: ' + data.detalhes;
    window.open('https://api.whatsapp.com/send?phone=5515996916423&text=' + encodeURIComponent(msg), '_blank');
}


// COUNTER ANIMATION
function animateCount(el, target, suffix, duration) {
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
        start += step;
        if (start >= target) {
            el.textContent = target + suffix;
            clearInterval(timer);
        } else {
            el.textContent = Math.floor(start) + suffix;
        }
    }, 16);
}

// Dispara quando a página carrega
window.addEventListener('load', () => {
    setTimeout(() => {
        animateCount(document.getElementById('count1'), 20, '+', 1200);
        animateCount(document.getElementById('count2'), 3, '+', 900);
        animateCount(document.getElementById('count3'), 5, '', 800);
    }, 600);
});

    // COUNTER ANIMATION — lento, um de cada vez
    function animateCount(el, target, suffix, duration, onDone) {
        let start = 0;
        const interval = duration / target;
        const timer = setInterval(() => {
            start += 1;
            el.textContent = start + suffix;
            if (start >= target) {
                clearInterval(timer);
                if (onDone) onDone();
            }
        }, interval);
    }

    // Cada número começa só depois que o anterior termina
    setTimeout(() => {
        const c1 = document.getElementById('count1');
        const c2 = document.getElementById('count2');
        const c3 = document.getElementById('count3');

        animateCount(c1, 20, '+', 2000, () => {
            setTimeout(() => {
                animateCount(c2, 3, '+', 1800, () => {
                    setTimeout(() => {
                        animateCount(c3, 5, '', 1500);
                    }, 400);
                });
            }, 400);
        });
    }, 800);
