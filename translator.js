let currentLanguage = 'pt'; // Idioma inicial

function toggleTranslation() {
    const newLanguage = currentLanguage === 'pt' ? 'en' : 'pt';

    // Carrega o arquivo JSON com as traduções
    fetch('translations.json')
        .then(response => response.json())
        .then(data => {
            // Atualiza os textos no site
            document.getElementById('title').innerText = data[newLanguage].title;
            document.getElementById('description').innerText = data[newLanguage].description;
            document.getElementById('button').innerText = data[newLanguage].button;

            // Atualiza o estado do idioma
            currentLanguage = newLanguage;

            // Atualiza o texto do botão de tradução
            document.getElementById('translatorText').innerText = newLanguage === 'pt' ? 'EN' : 'PT';
        })
        .catch(error => {
            console.error('Erro ao carregar as traduções:', error);
        });
}
