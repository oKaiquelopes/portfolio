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

    // BOTÃO CV — feedback visual ao baixar (o download em si é nativo via atributo download)
    const btnCv = document.getElementById('btnCv');
    if (btnCv) {
        const cvLabel = btnCv.querySelector('.cv-label');
        let cvTimer;
        btnCv.addEventListener('click', () => {
            clearTimeout(cvTimer);
            cvLabel.textContent = 'baixando…';
            cvTimer = setTimeout(() => {
                btnCv.classList.add('is-done');
                cvLabel.textContent = 'baixado ✓';
                cvTimer = setTimeout(() => {
                    btnCv.classList.remove('is-done');
                    cvLabel.textContent = cvLabel.dataset.default;
                }, 2600);
            }, 900);
        });
    }

    // PALETA DE COMANDOS — Ctrl/⌘ + K
    (function initCommandPalette() {
        const root  = document.getElementById('cmdk');
        const input = document.getElementById('cmdkInput');
        const list  = document.getElementById('cmdkList');
        const toast = document.getElementById('cmdkToast');
        if (!root || !input || !list) return;

        const EMAIL  = 'kaiquelopes.dev@gmail.com';
        const WHATS  = 'https://api.whatsapp.com/send?phone=5515996916423&text=' + encodeURIComponent('Olá! Vim pelo portfólio!');
        const isMac  = /Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgent);
        const html   = document.documentElement;

        // rótulo do atalho conforme o sistema
        document.querySelectorAll('.cmdk-keys').forEach(el => { el.textContent = isMac ? '⌘ K' : 'Ctrl K'; });

        // ── helpers ──
        const norm = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
        const goTo = sel => () => { const el = document.querySelector(sel); if (el) el.scrollIntoView(); };
        const openUrl = url => () => window.open(url, '_blank', 'noopener');

        let toastTimer;
        function showToast(msg) {
            if (!toast) return;
            toast.textContent = msg;
            toast.classList.add('show');
            clearTimeout(toastTimer);
            toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
        }
        async function copyEmail() {
            try {
                await navigator.clipboard.writeText(EMAIL);
                showToast('e-mail copiado ✓');
            } catch (_) {
                const t = document.createElement('textarea');
                t.value = EMAIL;
                t.style.cssText = 'position:fixed;opacity:0;top:0;left:0';
                document.body.appendChild(t);
                t.select();
                let ok = false;
                try { ok = document.execCommand('copy'); } catch (__) {}
                t.remove();
                showToast(ok ? 'e-mail copiado ✓' : EMAIL);
            }
        }

        // ── comandos ──
        const commands = [
            { g: 'navegar', icon: '#', label: 'Início',      hint: 'topo',           kw: 'home hero topo',                          run: () => window.scrollTo({ top: 0 }) },
            { g: 'navegar', icon: '#', label: 'Projetos',    hint: 'trabalhos',      kw: 'portfolio cases trabalhos sites',         run: goTo('#projetos') },
            { g: 'navegar', icon: '#', label: 'Processo',    hint: 'como funciona',  kw: 'etapas metodologia passos',               run: goTo('#processo') },
            { g: 'navegar', icon: '#', label: 'Sobre',       hint: 'quem sou',       kw: 'bio about kaique',                        run: goTo('#about') },
            { g: 'navegar', icon: '#', label: 'FAQ',         hint: 'dúvidas',        kw: 'perguntas duvidas respostas',             run: goTo('#faq') },
            { g: 'navegar', icon: '#', label: 'Depoimentos', hint: 'clientes',       kw: 'avaliacoes feedback opiniao',             run: goTo('#testimonials') },
            { g: 'navegar', icon: '#', label: 'Orçamento',   hint: '4 perguntas',    kw: 'proposta preco cotacao contratar form',   run: goTo('#budget-section') },

            { g: 'ações',   icon: '↓', label: 'Baixar CV',          hint: 'PDF',            kw: 'curriculo resume download pdf',     run: () => { const b = document.getElementById('btnCv'); if (b) b.click(); } },
            { g: 'ações',   icon: '↗', label: 'Falar no WhatsApp',  hint: 'abre a conversa', kw: 'zap whats contato mensagem chat',   run: openUrl(WHATS) },
            { g: 'ações',   icon: '@', label: 'Enviar e-mail',      hint: 'abre o app',     kw: 'email mail contato gmail',          run: () => { window.location.href = 'mailto:' + EMAIL; } },
            { g: 'ações',   icon: '⎘', label: 'Copiar e-mail',      hint: 'copia',          kw: 'email mail copiar clipboard',       run: copyEmail },

            { g: 'redes',   icon: '↗', label: 'GitHub',    hint: '@oKaiquelopes', kw: 'codigo repositorios git',   run: openUrl('https://github.com/oKaiquelopes') },
            { g: 'redes',   icon: '↗', label: 'LinkedIn',  hint: 'perfil',        kw: 'linkedin rede profissional', run: openUrl('https://www.linkedin.com/in/kaique-lopes-779450263/') },
            { g: 'redes',   icon: '↗', label: 'Instagram', hint: '@kaique.exe',   kw: 'insta redes social',        run: openUrl('https://www.instagram.com/kaique.exe/') }
        ];
        commands.forEach(c => { c._n = norm(c.label + ' ' + c.kw + ' ' + c.g); });

        // ── render ──
        let items = [];
        let active = 0;

        function markLabel(label, tokens) {
            const n = norm(label);
            const mask = new Array(label.length).fill(false);
            tokens.forEach(t => {
                let i = n.indexOf(t);
                while (i > -1) {
                    for (let k = i; k < i + t.length; k++) mask[k] = true;
                    i = n.indexOf(t, i + t.length);
                }
            });
            const frag = document.createDocumentFragment();
            let buf = '', on = false;
            const flush = () => {
                if (!buf) return;
                const node = document.createElement(on ? 'mark' : 'span');
                node.textContent = buf;
                frag.appendChild(node);
                buf = '';
            };
            for (let i = 0; i < label.length; i++) {
                if (mask[i] !== on) { flush(); on = mask[i]; }
                buf += label[i];
            }
            flush();
            return frag;
        }

        function setActive(i, scroll) {
            const rows = list.querySelectorAll('.cmdk-item');
            if (rows[active]) { rows[active].classList.remove('is-active'); rows[active].setAttribute('aria-selected', 'false'); }
            active = i;
            const row = rows[i];
            if (!row) return;
            row.classList.add('is-active');
            row.setAttribute('aria-selected', 'true');
            input.setAttribute('aria-activedescendant', row.id);
            if (scroll) row.scrollIntoView({ block: 'nearest' });
        }

        function render() {
            const q = input.value.trim();
            const tokens = norm(q).split(/\s+/).filter(Boolean);
            items = commands.filter(c => tokens.every(t => c._n.includes(t)));
            list.textContent = '';
            active = 0;

            if (!items.length) {
                const empty = document.createElement('div');
                empty.className = 'cmdk-empty';
                empty.textContent = 'nada encontrado para "' + q + '"';
                list.appendChild(empty);
                input.removeAttribute('aria-activedescendant');
                return;
            }

            let lastGroup = '';
            items.forEach((c, i) => {
                if (c.g !== lastGroup) {
                    const h = document.createElement('div');
                    h.className = 'cmdk-group';
                    h.setAttribute('role', 'presentation');
                    h.textContent = c.g;
                    list.appendChild(h);
                    lastGroup = c.g;
                }
                const row = document.createElement('div');
                row.className = 'cmdk-item';
                row.id = 'cmdk-opt-' + i;
                row.setAttribute('role', 'option');
                row.setAttribute('aria-selected', 'false');

                const ico = document.createElement('span');
                ico.className = 'cmdk-ico';
                ico.setAttribute('aria-hidden', 'true');
                ico.textContent = c.icon;

                const lab = document.createElement('span');
                lab.className = 'cmdk-label';
                lab.appendChild(markLabel(c.label, tokens));

                const hint = document.createElement('span');
                hint.className = 'cmdk-hint';
                hint.textContent = c.hint;

                row.append(ico, lab, hint);
                row.addEventListener('mousemove', () => { if (active !== i) setActive(i, false); });
                row.addEventListener('click', () => runItem(i));
                list.appendChild(row);
            });
            setActive(0, false);
            list.scrollTop = 0;
        }

        // ── abrir / fechar ──
        let lastFocus = null;
        const isOpen = () => root.classList.contains('open');

        function openPalette() {
            if (isOpen()) return;
            lastFocus = document.activeElement;
            closeMenu();                       // fecha o menu mobile, se estiver aberto
            input.value = '';
            render();
            root.classList.add('open');
            root.setAttribute('aria-hidden', 'false');
            html.classList.add('cmdk-lock');
            input.focus({ preventScroll: true });
        }
        function closePalette() {
            if (!isOpen()) return;
            root.classList.remove('open');
            root.setAttribute('aria-hidden', 'true');
            html.classList.remove('cmdk-lock');
            if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus({ preventScroll: true });
        }
        function runItem(i) {
            const c = items[i];
            if (!c) return;
            closePalette();
            c.run();
        }

        // ── eventos ──
        document.querySelectorAll('[data-cmdk-open]').forEach(b => b.addEventListener('click', openPalette));
        root.querySelectorAll('[data-cmdk-close]').forEach(b => b.addEventListener('click', closePalette));
        input.addEventListener('input', render);
        list.addEventListener('mousedown', e => e.preventDefault()); // mantém o foco no input

        input.addEventListener('keydown', e => {
            if (e.isComposing) return;
            const n = items.length;
            switch (e.key) {
                case 'ArrowDown': e.preventDefault(); if (n) setActive((active + 1) % n, true); break;
                case 'ArrowUp':   e.preventDefault(); if (n) setActive((active - 1 + n) % n, true); break;
                case 'Home':      e.preventDefault(); if (n) setActive(0, true); break;
                case 'End':       e.preventDefault(); if (n) setActive(n - 1, true); break;
                case 'Enter':     e.preventDefault(); runItem(active); break;
                case 'Tab':       e.preventDefault(); break; // foco preso na paleta
            }
        });

        document.addEventListener('keydown', e => {
            if ((e.ctrlKey || e.metaKey) && !e.altKey && !e.shiftKey && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                isOpen() ? closePalette() : openPalette();
            } else if (e.key === 'Escape' && isOpen()) {
                e.preventDefault();
                closePalette();
            }
        });
    })();

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