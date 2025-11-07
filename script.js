let elementoActual = null;
let quizNivel = 'fácil';
let puntuacion = 0;
let preguntasQuiz = [];
let indicePreg = 0;

// Preguntas dinámicas por nivel
const preguntasPorNivel = {
    fácil: [
        { q: "¿Cuál es el símbolo del elemento?", resp: () => elementoActual.symbol, opciones: () => generarOpciones(elementoActual.symbol, 3) },
        { q: "¿En qué grupo está?", resp: () => elementoActual.group, opciones: () => [1, 2, 13, 14, 15, 16, 17, 18].sort(() => 0.5 - Math.random()).slice(0, 4) }
    ],
    medio: [
        { q: "¿Cuál es su masa atómica aproximada?", resp: () => Math.round(elementoActual.atomic_mass), opciones: () => generarOpciones(Math.round(elementoActual.atomic_mass), 3, 10, 300) },
        { q: "¿Es metal o no metal?", resp: () => elementoActual.category.includes('metal') ? 'Metal' : 'No metal', opciones: ['Metal', 'No metal'] }
    ],
    avanzado: [
        { q: "¿Punto de ebullición en Kelvin (aprox)?", resp: () => elementoActual.boil ? Math.round(elementoActual.boil) : 'Desconocido', opciones: () => generarOpciones(elementoActual.boil ? Math.round(elementoActual.boil) : 0, 3, 0, 5000) },
        { q: "¿Quién lo descubrió?", resp: () => elementoActual.discovered_by || 'Antiguo', opciones: () => generarOpciones(elementoActual.discovered_by || 'Antiguo', 3) }
    ]
};

// Generar opciones falsas
function generarOpciones(correcta, cantidad, min = 1, max = 118) {
    const opciones = [correcta];
    while (opciones.length < cantidad + 1) {
        let falsa;
        if (typeof correcta === 'number') {
            falsa = Math.floor(Math.random() * (max - min + 1)) + min;
        } else {
            falsa = elementos[Math.floor(Math.random() * elementos.length)][typeof correcta === 'string' ? 'symbol' : 'discovered_by'] || 'Desconocido';
        }
        if (!opciones.includes(falsa) && falsa !== correcta) opciones.push(falsa);
    }
    return opciones.sort(() => 0.5 - Math.random());
}

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    renderTabla();

    document.getElementById('entrar-btn').onclick = () => {
        document.getElementById('inicio').classList.add('oculto');
        document.getElementById('app').classList.remove('oculto');
    };

    document.getElementById('volver-inicio').onclick = () => {
        document.getElementById('app').classList.add('oculto');
        document.getElementById('inicio').classList.remove('oculto');
    };
});

// Renderizar tabla
function renderTabla() {
    const grid = document.getElementById('tabla-periodica');
    grid.innerHTML = '';
    for (let y = 1; y <= 7; y++) {
        for (let x = 1; x <= 18; x++) {
            const celda = document.createElement('div');
            celda.className = 'celda vacia';
            const el = elementos.find(e => e.xpos === x && e.ypos === y);
            if (el) {
                celda.className = celda ${claseCategoria(el.category)};
                celda.innerHTML = <strong>${el.symbol}</strong><br><small>${el.number}</small>;
                celda.onclick = () => mostrarInfo(el);
            }
            grid.appendChild(celda);
        }
    }
}

function claseCategoria(cat) {
    const mapa = {
        'alcalino': 'alcalino',
        'alcalinoterreo': 'alcalinoterreo',
        'metal-transicion': 'metal-transicion',
        'otro-metal': 'otro-metal',
        'metaloides': 'metaloides',
        'no-metal': 'no-metal',
        'gas-noble': 'gas-noble',
        'lantanidos': 'lantanidos',
        'actínidos': 'actínidos'
    };
    return mapa[cat] || 'otro-metal';
}

// Mostrar modal
window.mostrarInfo = function(el) {
    elementoActual = el;
    const info = document.getElementById('info-elemento');
    info.innerHTML = `
        <h2>${el.name}</h2>
        <p><strong>Símbolo:</strong> ${el.symbol} | <strong>Nº:</strong> ${el.number}</p>
        <p><strong>Masa atómica:</strong> ${el.atomic_mass} u</p>
        <p><strong>Categoría:</strong> ${traducirCategoria(el.category)}</p>
        <p><strong>Fusión:</strong> ${el.melt || '—'} K | <strong>Ebullición:</strong> ${el.boil || '—'} K</p>
        <p><strong>Densidad:</strong> ${el.density || '—'} g/cm³</p>
        <p><strong>Descubierto por:</strong> ${el.discovered_by || 'Antiguo'}</p>
        <p><strong>Descripción:</strong> ${el.desc_es}</p>
        ${el.image?.url ? <img src="${el.image.url}" alt="${el.name}" onerror="this.style.display='none'"> : ''}
        <p style="font-size:0.8em; color:#666; margin-top:10px;">${el.image?.title || ''}</p>
    `;
    document.getElementById('modal-info').classList.remove('oculto');
};

function traducirCategoria(cat) {
    const trad = {
        'no-metal': 'No metal',
        'gas-noble': 'Gas noble',
        'metal-transicion': 'Metal de transición',
        'alcalino': 'Metal alcalino',
        'alcalinoterreo': 'Metal alcalinotérreo',
        'otro-metal': 'Otro metal',
        'metaloides': 'Metaloide',
        'lantanidos': 'Lantánido',
        'actínidos': 'Actínido'
    };
    return trad[cat] || cat;
}

// Quiz
document.getElementById('quiz-btn').onclick = () => {
    document.getElementById('modal-info').classList.add('oculto');
    quizNivel = prompt('Elige nivel:\nfácil\nmedio\navanzado', 'fácil') || 'fácil';
    iniciarQuiz();
    document.getElementById('modal-quiz').classList.remove('oculto');
};

function iniciarQuiz() {
    const pool = preguntasPorNivel[quizNivel];
    preguntasQuiz = pool.map(p => ({ q: p.q, resp: p.resp(), opciones: p.opciones() }));
    preguntasQuiz.sort(() => 0.5 - Math.random());
    puntuacion = 0;
    indicePreg = 0;
    document.getElementById('nivel-quiz').textContent = Quiz: Nivel ${quizNivel.charAt(0).toUpperCase() + quizNivel.slice(1)};
    renderPregunta();
    document.getElementById('iniciar-quiz').classList.add('oculto');
    document.getElementById('siguiente-preg').classList.remove('oculto');
}

function renderPregunta() {
    if (indicePreg >= preguntasQuiz.length) {
        mostrarResultado();
        return;
    }
    const preg = preguntasQuiz[indicePreg];
    const opciones = preg.opciones.map(opt => `
        <button onclick="seleccionar('${opt}', '${preg.resp}')">${opt}</button>
    `).join('');
    document.getElementById('preguntas-quiz').innerHTML = `
        <div class="pregunta">
            <h3>${preg.q}</h3>
            <div class="opciones">${opciones}</div>
        </div>
    `;
}

window.seleccionar = function(opt, correcta) {
    if (opt === correcta) puntuacion++;
    indicePreg++;
    renderPregunta();
};

function mostrarResultado() {
    const porcentaje = Math.round((puntuacion / preguntasQuiz.length) * 100);
    document.getElementById('preguntas-quiz').innerHTML = `
        <h3>¡Quiz terminado!</h3>
        <p>Puntuación: <strong>${puntuacion}/${preguntasQuiz.length}</strong> (${porcentaje}%)</p>
        <p>${porcentaje >= 80 ? '¡Excelente!' : porcentaje >= 60 ? '¡Muy bien!' : '¡Sigue practicando!'}</p>
    `;
    document.getElementById('siguiente-preg').textContent = 'Volver a intentar';
    document.getElementById('siguiente-preg').onclick = iniciarQuiz;
}

// Cerrar modales
document.querySelectorAll('.cerrar, .cerrar-quiz').forEach(btn => {
    btn.onclick = () => {
        document.getElementById('modal-info').classList.add('oculto');
        document.getElementById('modal-quiz').classList.add('oculto');
    };
});

document.getElementById('siguiente-preg').onclick = () => {
    if (indicePreg >= preguntasQuiz.length) iniciarQuiz();
    else renderPregunta();
};
