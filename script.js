document.addEventListener("DOMContentLoaded", () => {

    // ==========================================
    // 1. GESTION DU MENU MOBILE
    // ==========================================
    const menuToggle = document.getElementById("mobile-menu");
    const navLinks = document.getElementById("nav-links");

    if (menuToggle && navLinks) {
        menuToggle.addEventListener("click", () => {
            navLinks.classList.toggle("show");
        });
    }

    // ==========================================
    // 2. PROTECTION ANTI-SPAM (EMAIL)
    // ==========================================
    const protectedEmails = document.querySelectorAll('.email-protect');
    protectedEmails.forEach(link => {
        const user = link.getAttribute('data-user');
        const domain = link.getAttribute('data-domain');
        if (user && domain) {
            const emailAddress = `${user}@${domain}`;
            link.href = `mailto:${emailAddress}`;
            link.textContent = emailAddress;
        }
    });

    // ==========================================
    // 3. MOTEUR DE RECHERCHE MULTI-PAGES OPTIMISÉ
    // ==========================================
    const searchInputs = document.querySelectorAll('.search-input');
    const searchBtns = document.querySelectorAll('.search-btn');

    // Mots-clés des pages du site
    const sitePages = [
        { 
            url: "index.html", 
            keywords: [
                "accueil", "bienvenue", "parabole", "nouh-tech", "reception", "réception", "signal", "officielle", "zone", 
                "kara", "bafilo", "koumonde", "koumondè", "boulade", "bouladè", "soudou", "pya", "niamtougou", "assoli", "kozah", "togo", "avis"
            ] 
        },
        { 
            url: "services.html", 
            keywords: ["service", "services", "canal", "new world", "bercy", "installation", "installé", "installer", "maintenance", "réparation", "prix", "tarif", "décodeur", "antenne", "bug"] 
        },
        { 
            url: "Contact.html", 
            keywords: ["contact", "contacter", "telephone", "téléphone", "appel", "whatsapp", "email", "mail", "message"] 
        }
    ];

    function removeHighlights() {
        const highlights = document.querySelectorAll('mark.search-highlight');
        highlights.forEach(mark => {
            const parent = mark.parentNode;
            if (parent) {
                parent.replaceChild(document.createTextNode(mark.textContent), mark);
                parent.normalize();
            }
        });
    }

    // Générateur de Regex insensible aux accents
    function buildSearchRegex(query) {
        let clean = query.trim().toLowerCase();
        if (clean.length < 2) return null;

        if (clean.startsWith('install')) {
            return new RegExp('install[a-zA-Zà-ÿÀ-Ÿ]*', 'gi');
        }
        if (clean.startsWith('mainten')) {
            return new RegExp('mainten[a-zA-Zà-ÿÀ-Ÿ]*', 'gi');
        }
        if (clean.startsWith('repar') || clean.startsWith('répar')) {
            return new RegExp('(r[eéèêë]par)[a-zA-Zà-ÿÀ-Ÿ]*', 'gi');
        }

        const accentMap = {
            'a': '[aàâäAÀÂÄ]',
            'e': '[eéèêëEÉÈÊË]',
            'i': '[iîïIÎÏ]',
            'o': '[oôöOÔÖ]',
            'u': '[uùûüUÙÛÜ]',
            'c': '[cçCÇ]'
        };

        let pattern = '';
        for (let char of clean) {
            pattern += accentMap[char] || char.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        }

        return new RegExp(`(${pattern})`, 'gi');
    }

    // Surlignage et défilement fluide
    function highlightOnPage(searchTerm) {
        removeHighlights();

        if (!searchTerm || searchTerm.trim().length < 2) return false;

        const mainContainer = document.querySelector('main');
        if (!mainContainer) return false;

        const regex = buildSearchRegex(searchTerm);
        if (!regex) return false;

        const textNodes = [];
        const walker = document.createTreeWalker(
            mainContainer,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode: (node) => {
                    const parentTag = node.parentElement ? node.parentElement.tagName : '';
                    if (['SCRIPT', 'STYLE', 'INPUT', 'TEXTAREA', 'BUTTON', 'MARK'].includes(parentTag)) {
                        return NodeFilter.FILTER_REJECT;
                    }
                    return node.nodeValue.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
                }
            }
        );

        while (walker.nextNode()) {
            textNodes.push(walker.currentNode);
        }

        let firstMatch = null;

        textNodes.forEach(node => {
            const text = node.nodeValue;
            regex.lastIndex = 0;

            if (regex.test(text)) {
                regex.lastIndex = 0;
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = text.replace(regex, '<mark class="search-highlight">$1</mark>');

                const parent = node.parentNode;
                if (parent) {
                    while (tempDiv.firstChild) {
                        const child = tempDiv.firstChild;
                        if (!firstMatch && child.nodeType === 1 && child.classList.contains('search-highlight')) {
                            firstMatch = child;
                        }
                        parent.insertBefore(child, node);
                    }
                    parent.removeChild(node);
                }
            }
        });

        if (firstMatch) {
            firstMatch.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return true;
        }

        return false;
    }

    // Recherche multi-pages avec redirection
    async function searchOtherPages(query) {
        const currentPath = decodeURIComponent(window.location.pathname);
        const regex = buildSearchRegex(query);
        const cleanQuery = query.toLowerCase().trim();

        for (const page of sitePages) {
            const decodedPageUrl = decodeURIComponent(page.url);

            if (currentPath.endsWith(decodedPageUrl) || (currentPath.endsWith('/') && page.url === 'index.html')) {
                continue;
            }

            try {
                const response = await fetch(encodeURI(page.url));
                if (response.ok) {
                    const htmlText = await response.text();
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(htmlText, 'text/html');
                    const mainContent = doc.querySelector('main');

                    if (mainContent) {
                        regex.lastIndex = 0;
                        if (regex.test(mainContent.textContent)) {
                            window.location.href = `${encodeURI(page.url)}?search=${encodeURIComponent(query)}`;
                            return true;
                        }
                    }
                }
            } catch (error) {
                // Secours réseau silencieux
            }

            const matchKeyword = page.keywords.some(kw => cleanQuery.includes(kw) || kw.includes(cleanQuery));
            if (matchKeyword) {
                window.location.href = `${encodeURI(page.url)}?search=${encodeURIComponent(query)}`;
                return true;
            }
        }

        return false;
    }

    // Lancement de la recherche
    async function performSearch(query) {
        if (!query.trim()) return;

        const foundLocally = highlightOnPage(query);

        if (!foundLocally) {
            const redirected = await searchOtherPages(query);
            if (!redirected) {
                alert(`Le terme "${query}" n'a été trouvé sur aucune page du site NOUH-TECH SERVICE.`);
            }
        }
    }

    // ==========================================
    // 4. ÉCOUTEURS D'ÉVÉNEMENTS
    // ==========================================
    searchInputs.forEach(input => {
        input.addEventListener('input', (e) => {
            highlightOnPage(e.target.value);
        });

        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performSearch(input.value);
            }
        });
    });

    searchBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const input = btn.previousElementSibling;
            if (input) performSearch(input.value);
        });
    });

    // ==========================================
    // 5. REDIRECTION ET SURLIGNAGE ENTRANT
    // ==========================================
    const urlParams = new URLSearchParams(window.location.search);
    const searchQueryParam = urlParams.get('search');

    if (searchQueryParam) {
        searchInputs.forEach(input => input.value = searchQueryParam);
        setTimeout(() => {
            highlightOnPage(searchQueryParam);
        }, 400);
    }

});