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

    // ═══ EXTRAS: projetos em lista, métricas, GitHub, tema, atalhos ═══
    const root$ = document.documentElement;
    const jump = sel => { const el = document.querySelector(sel); if (el) el.scrollIntoView({ behavior: 'smooth' }); };
    const cards = [...document.querySelectorAll('.proj-card')].map(a => ({
        href: a.href,
        n: a.querySelector('.pc-eyebrow span').textContent,
        kind: a.querySelector('.pc-eyebrow').lastChild.textContent.trim(),
        date: a.querySelector('.pc-date').textContent,
        title: a.querySelector('.pc-title').textContent,
        img: a.querySelector('.pc-img').getAttribute('src')
    }));

    // Projetos: grade <-> lista com preview que segue o cursor
    const grid = document.querySelector('.proj-grid');
    let setView = () => {};
    if (grid && cards.length) {
        const toggle = document.createElement('div');
        toggle.className = 'view-toggle';
        toggle.setAttribute('role', 'group');
        toggle.setAttribute('aria-label', 'Modo de visualização');
        toggle.innerHTML = '<button type="button" class="vt-btn active" data-view="grid" aria-pressed="true">grade</button><button type="button" class="vt-btn" data-view="list" aria-pressed="false">lista</button>';
        const listEl = document.createElement('div');
        listEl.className = 'proj-list';
        listEl.hidden = true;
        cards.forEach(c => {
            const a = document.createElement('a');
            a.className = 'pl-row'; a.href = c.href; a.target = '_blank'; a.rel = 'noopener noreferrer';
            a.dataset.img = c.img;
            [['pl-n', c.n], ['pl-t', c.title], ['pl-k', c.kind], ['pl-d', c.date], ['pl-a', '↗']].forEach(([cls, txt]) => {
                const s = document.createElement('span'); s.className = cls; s.textContent = txt; a.appendChild(s);
            });
            listEl.appendChild(a);
        });
        const prev = document.createElement('div');
        prev.className = 'proj-preview';
        prev.setAttribute('aria-hidden', 'true');
        const pimg = document.createElement('img');
        pimg.alt = '';
        prev.appendChild(pimg);
        grid.before(toggle); grid.after(listEl); document.body.appendChild(prev);

        setView = v => {
            grid.hidden = v === 'list'; listEl.hidden = v !== 'list';
            toggle.querySelectorAll('.vt-btn').forEach(b => {
                const on = b.dataset.view === v;
                b.classList.toggle('active', on); b.setAttribute('aria-pressed', on);
            });
            if (v !== 'list') prev.classList.remove('show');
        };
        toggle.addEventListener('click', e => { const b = e.target.closest('.vt-btn'); if (b) setView(b.dataset.view); });

        let tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;
        const loop = () => {
            cx += (tx - cx) * 0.14; cy += (ty - cy) * 0.14;
            prev.style.transform = 'translate3d(' + cx + 'px,' + cy + 'px,0)';
            raf = prev.classList.contains('show') ? requestAnimationFrame(loop) : 0;
        };
        listEl.addEventListener('mousemove', e => { tx = e.clientX + 24; ty = e.clientY - 110; });
        listEl.addEventListener('mouseover', e => {
            const r = e.target.closest('.pl-row');
            if (!r) return;
            tx = e.clientX + 24; ty = e.clientY - 110;
            if (pimg.getAttribute('src') !== r.dataset.img) pimg.src = r.dataset.img;
            if (!prev.classList.contains('show')) { cx = tx; cy = ty; prev.classList.add('show'); if (!raf) raf = requestAnimationFrame(loop); }
        });
        listEl.addEventListener('mouseleave', () => prev.classList.remove('show'));
    }

    // Este site em números (Performance API)
    const stat = k => document.querySelector('[data-stat="' + k + '"]');
    if (stat('size')) {
        let lcp = 0;
        const paint = () => {
            const res = performance.getEntriesByType('resource');
            const nav = performance.getEntriesByType('navigation')[0];
            const bytes = res.reduce((s, r) => s + (r.transferSize || 0), 0) + (nav ? nav.transferSize || 0 : 0);
            stat('size').textContent = !bytes ? 'em cache' : bytes >= 1048576 ? (bytes / 1048576).toFixed(1) + ' MB' : Math.round(bytes / 1024) + ' KB';
            stat('reqs').textContent = res.length + 1;
            stat('lcp').textContent = lcp ? (lcp / 1000).toFixed(2) + ' s' : '—';
            stat('dom').textContent = document.getElementsByTagName('*').length;
        };
        try { new PerformanceObserver(l => { const e = l.getEntries(); lcp = e[e.length - 1].startTime; paint(); }).observe({ type: 'largest-contentful-paint', buffered: true }); } catch (e) {}
        try { new PerformanceObserver(paint).observe({ type: 'resource' }); } catch (e) {}
        paint();
        window.addEventListener('load', () => setTimeout(paint, 600));
    }

    // Último commit (GitHub, com cache de 10 min)
    const git = document.getElementById('ssGit');
    if (git) {
        const ago = d => {
            const m = Math.round((Date.now() - new Date(d)) / 6e4);
            if (m < 60) return 'há ' + Math.max(m, 1) + ' min';
            const h = Math.round(m / 60);
            return h < 48 ? 'há ' + h + ' h' : 'há ' + Math.round(h / 24) + ' dias';
        };
        const show = p => { git.textContent = 'último commit · ' + ago(p.at) + ' · ' + p.repo + ' ↗'; git.href = 'https://github.com/' + p.full; };
        (async () => {
            try {
                const c = JSON.parse(sessionStorage.getItem('kl-gh') || 'null');
                if (c && Date.now() - c.t < 6e5) return show(c.p);
                const r = await fetch('https://api.github.com/users/oKaiquelopes/events/public');
                if (!r.ok) throw 0;
                const ev = (await r.json()).find(e => e.type === 'PushEvent');
                if (!ev) throw 0;
                const p = { at: ev.created_at, repo: ev.repo.name.split('/')[1], full: ev.repo.name };
                sessionStorage.setItem('kl-gh', JSON.stringify({ t: Date.now(), p }));
                show(p);
            } catch (e) { git.textContent = 'github · @oKaiquelopes ↗'; }
        })();
    }

    // Tema (escuro / papel)
    const setTheme = t => {
        if (t) root$.dataset.theme = t; else delete root$.dataset.theme;
        try { t ? localStorage.setItem('kl-theme', t) : localStorage.removeItem('kl-theme'); } catch (e) {}
        const m = document.querySelector('meta[name="theme-color"]');
        if (m) m.content = t ? '#f1ece2' : '#0d0e10';
    };
    const toggleTheme = () => {
        // classe temporária só durante a troca, pra transição suave sem pesar o resto do tempo
        root$.classList.add('theme-fade');
        setTheme(root$.dataset.theme === 'paper' ? '' : 'paper');
        setTimeout(() => root$.classList.remove('theme-fade'), 450);
    };
    // mantém várias abas sincronizadas
    window.addEventListener('storage', e => {
        if (e.key === 'kl-theme') { if (e.newValue) root$.dataset.theme = e.newValue; else delete root$.dataset.theme; }
    });
    if (root$.dataset.theme === 'paper') setTheme('paper');

    // Comandos extras para a paleta
    const openNew = u => window.open(u, '_blank', 'noopener');
    window.__cmdkExtra = () => [
        ...cards.map(c => ({ g: 'projetos', icon: c.n, label: c.title, hint: c.kind, kw: 'projeto case ' + c.kind + ' ' + c.date, run: () => openNew(c.href) })),
        { g: 'projetos', icon: '?', label: 'Projeto aleatório', hint: 'surpreenda-me', kw: 'random sorte acaso', run: () => openNew(cards[Math.floor(Math.random() * cards.length)].href) },
        { g: 'projetos', icon: '≡', label: 'Ver projetos em lista', hint: 'índice', kw: 'lista grade visualizacao indice', run: () => { setView('list'); jump('#projetos'); } },
        { g: 'projetos', icon: '▦', label: 'Ver projetos em grade', hint: 'cards', kw: 'grade cards visualizacao', run: () => { setView('grid'); jump('#projetos'); } },
        { g: 'sistema', icon: '◐', label: 'Trocar tema', hint: 'escuro / papel', kw: 'tema claro escuro dark light papel cor', run: toggleTheme },
        { g: 'sistema', icon: '↗', label: 'Ver código-fonte', hint: 'GitHub', kw: 'source codigo repositorio', run: () => openNew('https://github.com/oKaiquelopes') },
        { g: 'sistema', icon: '#', label: 'Este site em números', hint: 'métricas', kw: 'performance peso lcp stats numeros', run: () => jump('#siteStats') }
    ];

    // Atalhos estilo vim: g + letra
    let gAt = 0;
    const gMap = { p: '#projetos', r: '#processo', s: '#about', f: '#faq', d: '#testimonials', o: '#budget-section', n: '#siteStats' };
    document.addEventListener('keydown', e => {
        if (e.metaKey || e.ctrlKey || e.altKey || (e.target.closest && e.target.closest('input,textarea,select,[contenteditable],.cmdk'))) return;
        const k = e.key.toLowerCase();
        if (gAt && Date.now() - gAt < 900 && gMap[k]) { e.preventDefault(); jump(gMap[k]); gAt = 0; return; }
        gAt = k === 'g' ? Date.now() : 0;
    });

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
            { g: 'redes',   icon: '↗', label: 'Instagram', hint: '@kaique.exe',   kw: 'insta redes social',        run: openUrl('https://www.instagram.com/kaique.exe/') },
            ...(window.__cmdkExtra ? window.__cmdkExtra() : [])
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