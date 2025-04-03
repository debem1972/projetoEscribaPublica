/// Armazenar todos os textos carregados
let allTexts = [];
// Controlar a leitura atual
let currentUtterance = null;
// Rastrear o botão ativo
let currentButton = null;
// Armazenar o timeout de leitura
let currentReadTimeout = null;

// Carregar os dados JSON do arquivo psicografias.json
const fetchTexts = async () => {
    const poetryGrid = document.querySelector('.poetry-grid');
    try {
        const response = await fetch('psicografias.json');
        if (!response.ok) throw new Error('Arquivo não encontrado');
        const texts = await response.json();
        allTexts = texts;
        populatePoetryGrid(texts);
        populateCategories(texts);
    } catch (error) {
        console.error('Erro ao carregar psicografias.json:', error);
        poetryGrid.innerHTML = '<p>Nenhum texto carregado</p>';
    }
};

// Popular a poetry-grid com os textos do JSON, ordenados por data decrescente
const populatePoetryGrid = (texts) => {
    const poetryGrid = document.querySelector('.poetry-grid');
    poetryGrid.innerHTML = '';

    if (texts.length === 0) {
        poetryGrid.innerHTML = '<p>Nenhum resultado encontrado</p>';
        return;
    }

    // Ordenar os textos por timestamp em ordem decrescente (mais recente primeiro)
    const sortedTexts = [...texts].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    sortedTexts.forEach(text => {
        const article = document.createElement('article');
        article.className = 'poetry-card';

        const title = document.createElement('h2');
        title.className = 'poetry-title';
        title.textContent = text.title || 'Sem Título';
        article.appendChild(title);

        const preview = document.createElement('p');
        preview.className = 'poetry-preview';
        preview.textContent = text.content || 'Sem Conteúdo';
        article.appendChild(preview);

        const authorDiv = document.createElement('div');
        authorDiv.className = 'poetry-author';

        const authors = text.author.split('/');
        if (authors.length === 1) {
            const authorP = document.createElement('p');
            authorP.textContent = `Por ${authors[0]}`;
            authorDiv.appendChild(authorP);
        } else if (authors.length === 2) {
            const spiritP = document.createElement('p');
            spiritP.textContent = `Por Espírito ${authors[0]}`;
            authorDiv.appendChild(spiritP);
            const mediumP = document.createElement('p');
            mediumP.textContent = `Psicografado pelo médium ${authors[1]}`;
            authorDiv.appendChild(mediumP);
        }

        const dateP = document.createElement('p');
        const date = new Date(text.timestamp);
        dateP.textContent = date.toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).replace(',', ' -');
        authorDiv.appendChild(dateP);

        article.appendChild(authorDiv);

        const speakButton = document.createElement('button');
        speakButton.className = 'speak-btn';
        speakButton.textContent = 'Ouvir Texto';
        speakButton.dataset.state = 'play';
        speakButton.addEventListener('click', () => toggleSpeech(text, speakButton));
        article.appendChild(speakButton);

        // Botão "Sobre o Médium" com card
        const aboutWrapper = document.createElement('div');
        aboutWrapper.className = 'about-wrapper';

        const aboutButton = document.createElement('button');
        aboutButton.className = 'about-btn';
        aboutButton.textContent = 'Sobre o Médium';
        aboutWrapper.appendChild(aboutButton);

        const aboutCard = document.createElement('div');
        aboutCard.className = 'about-card';
        aboutCard.style.display = 'none'; // Inicialmente oculto

        // Construção dinâmica do card
        const mediumName = authors.length === 2 ? authors[1] : ''; // Assume o segundo como nome do médium
        if (text.mediumPhoto) {
            const img = document.createElement('img');
            img.src = text.mediumPhoto;
            img.alt = `Foto do médium ${mediumName || 'desconhecido'}`;
            img.className = 'medium-photo';
            aboutCard.appendChild(img);
        }
        if (mediumName) {
            const name = document.createElement('h3');
            name.textContent = mediumName;
            name.className = 'medium-name';
            aboutCard.appendChild(name);
        }
        if (text.about && text.about !== 'Sem informações sobre o médium.') {
            const info = document.createElement('p');
            info.textContent = text.about;
            info.className = 'medium-info';
            aboutCard.appendChild(info);
        }
        if (text.mediumPhone || text.mediumEmail) {
            const contactDiv = document.createElement('div');
            contactDiv.className = 'medium-contact';
            if (text.mediumPhone) {
                const phone = document.createElement('p');
                phone.innerHTML = `<strong>Telefone/WhatsApp:</strong> ${text.mediumPhone}`;
                contactDiv.appendChild(phone);
            }
            if (text.mediumEmail) {
                const email = document.createElement('p');
                email.innerHTML = `<strong>E-mail:</strong> <a href="mailto:${text.mediumEmail}">${text.mediumEmail}</a>`;
                contactDiv.appendChild(email);
            }
            aboutCard.appendChild(contactDiv);
        }

        aboutWrapper.appendChild(aboutCard);

        // Eventos de hover
        aboutButton.addEventListener('mouseenter', () => {
            aboutCard.style.display = 'block';
        });
        aboutWrapper.addEventListener('mouseleave', () => {
            aboutCard.style.display = 'none';
        });

        article.appendChild(aboutWrapper);

        article.dataset.category = text.category || 'Sem Categoria';
        article.dataset.author = text.author.toLowerCase();
        article.dataset.title = text.title.toLowerCase();

        poetryGrid.appendChild(article);
    });
};

// Função para controlar a leitura (play, pause, stop)
const toggleSpeech = (text, button) => {
    const synth = window.speechSynthesis;

    // Limpar qualquer timeout anterior
    if (currentReadTimeout) {
        clearTimeout(currentReadTimeout);
        currentReadTimeout = null;
    }

    // Se outro botão estava ativo, resetá-lo
    if (currentButton && currentButton !== button) {
        synth.cancel();
        resetButton(currentButton);
    }

    const state = button.dataset.state;

    if (state === 'play') {
        // Montar o texto completo para leitura
        const authors = text.author.split('/');
        let authorText = '';
        if (authors.length === 1) {
            authorText = `Por ${authors[0]}`;
        } else if (authors.length === 2) {
            authorText = `Por Espírito ${authors[0]}, psicografado pelo médium ${authors[1]}`;
        }

        const date = new Date(text.timestamp).toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).replace(',', ' -');

        const fullText = `${text.title || 'Sem Título'}. ${text.content || 'Sem Conteúdo'}. ${authorText}. Publicado em ${date}.`;

        // Cancelar qualquer leitura anterior e iniciar nova
        synth.cancel();
        currentUtterance = new SpeechSynthesisUtterance(fullText);
        currentUtterance.lang = 'pt-BR';
        currentUtterance.rate = 1.0;
        currentUtterance.pitch = 1.0;

        // Flag para verificar se a leitura foi concluída naturalmente
        let isReadingCompleted = false;

        // Configurar tratamento de fim de leitura
        currentUtterance.onend = () => {
            console.log('Leitura concluída via onend');
            isReadingCompleted = true;
            resetButton(button); // Resetar ao terminar
            // Limpar referências
            currentUtterance = null;
            currentButton = null;

            // Cancelar o timeout de segurança
            if (currentReadTimeout) {
                clearTimeout(currentReadTimeout);
                currentReadTimeout = null;
            }
        };

        // Configurar timeout de segurança
        currentReadTimeout = setTimeout(() => {
            // Só executa se a leitura NÃO foi concluída naturalmente
            if (!isReadingCompleted) {
                console.log('Leitura forçada via timeout');
                synth.cancel();
                resetButton(button);
                currentUtterance = null;
                currentButton = null;
                currentReadTimeout = null;
            }
        }, (fullText.length * 100) + 10000); // Tempo estimado + margem de segurança

        // Iniciar leitura
        synth.speak(currentUtterance);
        button.textContent = 'Pausar';
        button.dataset.state = 'pause';
        currentButton = button; // Atualizar o botão ativo
    } else if (state === 'pause') {
        synth.pause();
        button.textContent = 'Continuar';
        button.dataset.state = 'continue';
    } else if (state === 'continue') {
        synth.resume();
        button.textContent = 'Pausar';
        button.dataset.state = 'pause';
    }
};

// Resetar o botão para o estado inicial
const resetButton = (button) => {
    if (button) {
        button.textContent = 'Ouvir Texto';
        button.dataset.state = 'play';
        if (currentButton === button) currentButton = null; // Limpar o botão ativo
    }
};

// Popular as categorias dinamicamente na filter-tags
const populateCategories = (texts) => {
    const filterTags = document.querySelector('.filter-tags');
    filterTags.innerHTML = '';

    const categories = [...new Set(texts.map(text => text.category || 'Sem Categoria'))];
    categories.forEach(category => {
        const tag = document.createElement('span');
        tag.className = 'tag';
        tag.textContent = category;
        tag.addEventListener('click', () => filterByCategory(category));
        filterTags.appendChild(tag);
    });

    // Botão "Todos" com reset do campo de busca
    const allTag = document.createElement('span');
    allTag.className = 'tag';
    allTag.textContent = 'Todos';
    allTag.addEventListener('click', () => {
        populatePoetryGrid(allTexts); // Exibe todos os textos
        document.querySelector('.search-box').value = ''; // Limpa o campo de busca
    });
    filterTags.appendChild(allTag);
};

// Filtrar por categoria
const filterByCategory = (category) => {
    const articles = document.querySelectorAll('.poetry-card');
    let hasResults = false;

    articles.forEach(article => {
        if (article.dataset.category === category) {
            article.style.display = 'block';
            hasResults = true;
        } else {
            article.style.display = 'none';
        }
    });

    if (!hasResults) {
        document.querySelector('.poetry-grid').innerHTML = '<p>Nenhum resultado encontrado</p>';
    }
};

// Filtrar por data e renderizar os resultados
const filterByDate = (query) => {
    const filteredTexts = allTexts.filter(text => {
        const date = new Date(text.timestamp);
        const year = date.getFullYear().toString();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');

        if (query.length === 4 && /^\d{4}$/.test(query)) {
            // Filtro por ano (ex.: "2025")
            return year === query;
        } else if (query.length === 7 && /^\d{2}\/\d{4}$/.test(query)) {
            // Filtro por mês/ano (ex.: "06/2024")
            const [qMonth, qYear] = query.split('/');
            return month === qMonth && year === qYear;
        } else if (query.length === 10 && /^\d{2}\/\d{2}\/\d{4}$/.test(query)) {
            // Filtro por data completa (ex.: "05/03/2025")
            const [qDay, qMonth, qYear] = query.split('/');
            return day === qDay && month === qMonth && year === qYear;
        }
        return false;
    });

    populatePoetryGrid(filteredTexts);
};

// Filtrar por busca (título, autor ou data)
const filterBySearch = (query) => {
    const trimmedQuery = query.trim();

    // Verificar se é um formato de data
    if (/^\d{4}$/.test(trimmedQuery) || /^\d{2}\/\d{4}$/.test(trimmedQuery) || /^\d{2}\/\d{2}\/\d{4}$/.test(trimmedQuery)) {
        filterByDate(trimmedQuery);
    } else {
        // Filtro por título ou autor
        const filteredTexts = allTexts.filter(text => {
            const lowerQuery = trimmedQuery.toLowerCase();
            return (
                text.title.toLowerCase().includes(lowerQuery) ||
                text.author.toLowerCase().includes(lowerQuery)
            );
        });
        populatePoetryGrid(filteredTexts);
    }
};

// Evento de busca no input
document.querySelector('.search-box').addEventListener('input', (e) => {
    const query = e.target.value;
    if (query) {
        filterBySearch(query);
    } else {
        populatePoetryGrid(allTexts);
    }
});

// Inicializar ao carregar a página
document.addEventListener('DOMContentLoaded', fetchTexts);