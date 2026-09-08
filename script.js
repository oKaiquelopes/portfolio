window.addEventListener('DOMContentLoaded', () => {
    // HEADER SCROLL + BARRA DE PROGRESSO
    const header = document.getElementById('header');
    const scrollBar = document.getElementById('scrollProgress');
    function onScroll() {
        header.classList.toggle('scrolled', window.scrollY > 40);
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const pct = docHeight > 0 ? (window.scrollY / docHeight) * 100 : 0;
        if (scrollBar) scrollBar.style.width = pct + '%';
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

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

    // ACORDEÃO DO FAQ
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const btn = item.querySelector('.faq-q');
        const answer = item.querySelector('.faq-a');
        btn.addEventListener('click', () => {
            const isOpen = item.classList.contains('open');
            faqItems.forEach(other => {
                other.classList.remove('open');
                other.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
                other.querySelector('.faq-a').style.maxHeight = null;
            });
            if (!isOpen) {
                item.classList.add('open');
                btn.setAttribute('aria-expanded', 'true');
                answer.style.maxHeight = answer.scrollHeight + 'px';
            }
        });
    });

    // REVEAL ON SCROLL (também controla a linha do processo, via .reveal.active)
    const obs = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.classList.add('active');
                obs.unobserve(e.target);
            }
        });
    }, { threshold: 0.15 });
    document.querySelectorAll('.reveal').forEach(el => obs.observe(el));

    // COUNTER ANIMATION — dispara quando os números entram na tela
    const counters = [
        { el: document.getElementById('count1'), target: 20, suffix: '+' },
        { el: document.getElementById('count2'), target: 3,  suffix: '+' },
        { el: document.getElementById('count3'), target: 5,  suffix: ''  }
    ];
    function animateCount(el, target, suffix, duration) {
        const start = performance.now();
        function tick(now) {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.floor(eased * target) + suffix;
            if (progress < 1) requestAnimationFrame(tick);
            else el.textContent = target + suffix;
        }
        requestAnimationFrame(tick);
    }
    const numbersEl = document.querySelector('.hero-numbers');
    if (numbersEl) {
        const numObs = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    counters.forEach((c, i) => {
                        if (c.el) setTimeout(() => animateCount(c.el, c.target, c.suffix, 1300), i * 200);
                    });
                    numObs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.4 });
        numObs.observe(numbersEl);
    }
});

// FORM — global para os onclick="" funcionarem
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
function selectOption(el, valor, tipo) {
    data[tipo] = valor;
    el.classList.add('chosen');
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