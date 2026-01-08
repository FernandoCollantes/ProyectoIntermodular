// --- CONFIGURACIÓN DE RUTAS API (NUEVA ESTRUCTURA) ---
const URL_ASIGNATURAS = '/api/asignaturas'; // Para asignaturas y criterios
const URL_PREGUNTAS = '/api/preguntas';     // Para preguntas y búsqueda
const URL_EXAMENES = '/api/examenes';       // Para gestión de exámenes

// --- Estado Global ---
let currentExamData = null; 

// --- Referencias al DOM ---
// Búsqueda
const subjectSelect = document.getElementById('subjectInput');
const searchCriterioSelect = document.getElementById('searchCriterioInput');
const searchDifficultyInput = document.getElementById('searchDifficultyInput');
const resultsContainer = document.getElementById('resultsContainer');
const searchQuestionsSection = document.getElementById('searchQuestionsSection');

// Formularios Nuevos (Administración)
const createSubjectForm = document.getElementById('createSubjectForm');
const createCriterioForm = document.getElementById('createCriterioForm');
const criterioSubjectSelect = document.getElementById('criterioSubjectSelect'); // Dropdown dentro de Crear Criterio

// Formulario Pregunta
const newAsignaturaSelect = document.getElementById('newAsignatura'); 
// const newCriterioSelect = document.getElementById('newCriterio'); // YA NO SE USA (Sustituido por Checkboxes)
const criteriosCheckboxContainer = document.getElementById('criteriosCheckboxContainer'); // NUEVO
const formContainer = document.getElementById('addQuestionForm');
const incorrectOptionsContainer = document.getElementById('incorrectOptionsContainer');

// Formulario Examen
const createExamForm = document.getElementById('createExamForm');
const examSubjectSelect = document.getElementById('examSubjectInput'); 

// SECCIÓN NUEVA: BUSCADOR EXÁMENES
const searchExamsSection = document.getElementById('searchExamsSection');
const examSearchSubject = document.getElementById('examSearchSubject');
const examSearchAuthor = document.getElementById('examSearchAuthor');
const examsListContainer = document.getElementById('examsListContainer');
const btnSearchExams = document.getElementById('btnSearchExams');

// Vista Examen
const examViewContainer = document.getElementById('examViewContainer');
const examQuestionsList = document.getElementById('examQuestionsList');
const examNameInput = document.getElementById('examNameInput'); 
const examAuthorInput = document.getElementById('examAuthorInput'); 

// Botones (Toggles)
const toggleFormBtn = document.getElementById('toggleFormBtn');
const toggleExamFormBtn = document.getElementById('toggleExamFormBtn');
const toggleSearchExamsBtn = document.getElementById('toggleSearchExamsBtn');
const toggleSubjectFormBtn = document.getElementById('toggleSubjectFormBtn');
const toggleCriterioFormBtn = document.getElementById('toggleCriterioFormBtn');

// Botones (Acciones)
const addOptionBtn = document.getElementById('addOptionBtn');
const saveQuestionBtn = document.getElementById('saveQuestionBtn');
const searchBtn = document.getElementById('searchBtn');
const generateExamBtn = document.getElementById('generateExamBtn');
const downloadExamBtn = document.getElementById('downloadExamBtn');
const saveExamToDbBtn = document.getElementById('saveExamToDbBtn'); 
const saveSubjectBtn = document.getElementById('saveSubjectBtn');
const saveCriterioBtn = document.getElementById('saveCriterioBtn');


// --- Event Listeners ---

document.addEventListener('DOMContentLoaded', loadSubjects);

// Toggles: Gestionamos visibilidad exclusiva de secciones principales
toggleFormBtn.addEventListener('click', () => showMainSection(formContainer));
toggleExamFormBtn.addEventListener('click', () => showMainSection(createExamForm));
toggleSearchExamsBtn.addEventListener('click', () => showMainSection(searchExamsSection));

// Toggles Admin (Sub-formularios)
toggleSubjectFormBtn.addEventListener('click', () => { 
    createSubjectForm.classList.toggle('hidden'); 
    createCriterioForm.classList.add('hidden'); 
});
toggleCriterioFormBtn.addEventListener('click', () => { 
    createCriterioForm.classList.toggle('hidden'); 
    createSubjectForm.classList.add('hidden'); 
});

// Acciones
addOptionBtn.addEventListener('click', addOptionInput);
saveQuestionBtn.addEventListener('click', submitNewQuestion);
searchBtn.addEventListener('click', searchQuestions);
generateExamBtn.addEventListener('click', generateExamPreview); 
downloadExamBtn.addEventListener('click', downloadExamPDF);
saveExamToDbBtn.addEventListener('click', saveExamToDB); 
saveSubjectBtn.addEventListener('click', submitNewSubject);
saveCriterioBtn.addEventListener('click', submitNewCriterio);
btnSearchExams.addEventListener('click', searchExams);

// Dropdowns Cascada
// CASO ESPECIAL: Checkboxes para nueva pregunta
newAsignaturaSelect.addEventListener('change', (e) => loadCriteriaCheckboxes(e.target.value));
// Caso Normal: Select para búsqueda
subjectSelect.addEventListener('change', (e) => handleCriteriaLoad(e.target.value, searchCriterioSelect));


// --- Helpers ---

function showMainSection(targetSection) {
    // Lista de secciones principales que se solapan
    const sections = [
        formContainer, 
        createExamForm, 
        searchExamsSection, 
        searchQuestionsSection, 
        resultsContainer,
        examViewContainer
    ];
    
    // Ocultar todas
    sections.forEach(s => s.classList.add('hidden'));
    
    // Mostrar objetivo
    if (targetSection) {
        targetSection.classList.remove('hidden');
        
        // Si mostramos buscador de preguntas, mostramos sus resultados también por UX
        if (targetSection === searchQuestionsSection) resultsContainer.classList.remove('hidden');
    }

    // Logic extra al abrir formulario de pregunta
    if (targetSection === formContainer && incorrectOptionsContainer.children.length === 0) addOptionInput();
}

function handleCriteriaLoad(subjectId, targetSelect) {
    if (subjectId) loadCriteria(subjectId, targetSelect);
    else resetSelect(targetSelect);
}

function escapeHTML(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}


// --- Carga de Datos ---

async function loadSubjects() {
    try {
        const res = await fetch(URL_ASIGNATURAS);
        const response = await res.json();
        
        // Reset de todos los dropdowns de asignatura
        const selects = [subjectSelect, examSubjectSelect, newAsignaturaSelect, criterioSubjectSelect, examSearchSubject];
        selects.forEach(sel => sel.innerHTML = '<option value="">-- Selecciona --</option>');
        
        // Excepciones de texto por defecto
        subjectSelect.innerHTML = '<option value="">-- Cualquiera --</option>'; 
        examSearchSubject.innerHTML = '<option value="">-- Todas --</option>'; 

        if (response.success && response.subjects) {
            response.subjects.forEach(subj => {
                // Rellenamos todos los selects a la vez
                selects.forEach(sel => {
                    sel.appendChild(new Option(subj.nombre, subj._id));
                });
            });
        }
    } catch (err) { console.error(err); }
}

// Carga para Select normal (Búsqueda)
async function loadCriteria(subjectId, targetSelect) {
    try {
        targetSelect.disabled = true;
        targetSelect.innerHTML = '<option>Cargando...</option>';
        
        const res = await fetch(`${URL_ASIGNATURAS}/criterios?asignatura=${subjectId}`);
        const response = await res.json();
        targetSelect.innerHTML = '<option value="">-- Selecciona --</option>';
        
        if (response.success && response.criterios.length > 0) {
            response.criterios.forEach(crit => {
                targetSelect.appendChild(new Option(crit.nombre, crit._id));
            });
            targetSelect.disabled = false;
        } else {
            targetSelect.innerHTML = '<option value="">No hay criterios</option>';
        }
    } catch (err) { console.error(err); targetSelect.innerHTML = '<option>Error</option>'; }
}

// Carga para Checkboxes (Nueva Pregunta)
async function loadCriteriaCheckboxes(subjectId) {
    criteriosCheckboxContainer.innerHTML = '<p class="text-gray-400 p-1">Cargando...</p>';
    if (!subjectId) {
        criteriosCheckboxContainer.innerHTML = '<p class="italic text-gray-400 p-1">Selecciona una asignatura primero...</p>';
        return;
    }

    try {
        const res = await fetch(`${URL_ASIGNATURAS}/criterios?asignatura=${subjectId}`);
        const response = await res.json();
        criteriosCheckboxContainer.innerHTML = ''; // Limpiar

        if (response.success && response.criterios.length > 0) {
            response.criterios.forEach(crit => {
                // Crear estructura checkbox
                const div = document.createElement('div');
                div.className = "flex items-center gap-2 mb-1 p-1 hover:bg-gray-50 rounded";
                div.innerHTML = `
                    <input type="checkbox" id="crit_${crit._id}" value="${crit._id}" class="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500">
                    <label for="crit_${crit._id}" class="text-gray-700 select-none cursor-pointer flex-grow text-xs">${escapeHTML(crit.nombre)}</label>
                `;
                criteriosCheckboxContainer.appendChild(div);
            });
        } else {
            criteriosCheckboxContainer.innerHTML = '<p class="text-red-400 p-1 text-xs">No hay criterios definidos.</p>';
        }
    } catch (err) {
        console.error(err);
        criteriosCheckboxContainer.innerHTML = '<p class="text-red-500 text-xs">Error al cargar criterios.</p>';
    }
}

function resetSelect(targetSelect) {
    targetSelect.innerHTML = '<option value="">-- Elige Asignatura --</option>';
    targetSelect.disabled = true;
}


// --- LÓGICA DE EXÁMENES GUARDADOS ---

async function searchExams() {
    const subjectId = examSearchSubject.value;
    const author = examSearchAuthor.value;

    try {
        examsListContainer.innerHTML = '<p class="text-center text-gray-500">Buscando...</p>';
        const query = new URLSearchParams();
        if (subjectId) query.append('subjectId', subjectId);
        if (author) query.append('autor', author);

        const res = await fetch(`${URL_EXAMENES}/search?${query.toString()}`);
        const data = await res.json();

        if (data.success) {
            displayExamsList(data.exams);
        } else {
            examsListContainer.innerHTML = `<p class="text-red-500">${data.message}</p>`;
        }
    } catch (err) {
        examsListContainer.innerHTML = '<p class="text-red-500">Error de conexión.</p>';
    }
}

function displayExamsList(exams) {
    if (!exams || exams.length === 0) {
        examsListContainer.innerHTML = '<p class="text-center text-gray-500 py-4">No se encontraron exámenes.</p>';
        return;
    }

    examsListContainer.innerHTML = exams.map(exam => `
        <div class="flex flex-col sm:flex-row justify-between items-center bg-white p-3 rounded shadow-sm border border-gray-200">
            <div class="mb-2 sm:mb-0">
                <h4 class="font-bold text-gray-800 text-sm">${escapeHTML(exam.nombre)}</h4>
                <p class="text-xs text-gray-500">
                    <span class="bg-gray-100 px-1 rounded">${escapeHTML(exam.asignatura?.nombre || 'Varios')}</span>
                    • Autor: ${escapeHTML(exam.autor)}
                    • ${new Date(exam.fecha_creacion).toLocaleDateString()}
                </p>
            </div>
            <a href="${URL_EXAMENES}/${exam._id}/pdf" target="_blank" 
               class="text-indigo-600 text-xs font-bold border border-indigo-200 px-3 py-1 rounded hover:bg-indigo-50 transition flex items-center gap-1">
               📥 PDF
            </a>
        </div>
    `).join('');
}


// --- LÓGICA DE ADMINISTRACIÓN ---

async function submitNewSubject() {
    const codigo = document.getElementById('newSubjectCode').value;
    const nombre = document.getElementById('newSubjectName').value;
    
    if (!codigo || !nombre) return alert("Escribe un código y un nombre.");

    try {
        const res = await fetch(URL_ASIGNATURAS, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ codigo, nombre }) 
        });
        const data = await res.json();

        if (data.success) {
            alert(`Asignatura "${nombre}" (${codigo}) creada.`);
            document.getElementById('newSubjectName').value = '';
            document.getElementById('newSubjectCode').value = '';
            loadSubjects(); 
        } else {
            alert('Error: ' + data.message);
        }
    } catch (err) { console.error(err); alert('Error de conexión.'); }
}

async function submitNewCriterio() {
    const nombre = document.getElementById('newCriterioName').value;
    const asignaturaId = criterioSubjectSelect.value;
    const descripcion = document.getElementById('newCriterioDesc').value;

    if (!nombre || !asignaturaId) return alert("Nombre y Asignatura son obligatorios.");

    try {
        const res = await fetch(`${URL_ASIGNATURAS}/criterios`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, descripcion, asignaturaId })
        });
        const data = await res.json();

        if (data.success) {
            alert(`Criterio "${nombre}" creado.`);
            document.getElementById('newCriterioName').value = '';
            document.getElementById('newCriterioDesc').value = '';
            criterioSubjectSelect.value = '';
        } else {
            alert('Error: ' + data.message);
        }
    } catch (err) { console.error(err); alert('Error de conexión.'); }
}


// --- LÓGICA DE PREGUNTAS ---

function addOptionInput() {
    const wrapper = document.createElement('div');
    wrapper.className = 'flex items-center gap-2';
    wrapper.innerHTML = `
        <input type="text" class="incorrect-option flex-grow p-2 border rounded focus:ring-2 focus:ring-gray-200 outline-none" placeholder="Opción incorrecta">
        <button type="button" class="delete-option-btn text-gray-400 hover:text-red-500 px-2 font-bold" title="Eliminar">✕</button>
    `;
    wrapper.querySelector('.delete-option-btn').addEventListener('click', () => wrapper.remove());
    incorrectOptionsContainer.appendChild(wrapper);
}

async function submitNewQuestion() {
    const enunciado = document.getElementById('newEnunciado').value;
    const asignatura = newAsignaturaSelect.value;
    
    // RECOGEMOS LOS CHECKBOXES MARCADOS
    const checkedBoxes = criteriosCheckboxContainer.querySelectorAll('input[type="checkbox"]:checked');
    const criteriosSelected = Array.from(checkedBoxes).map(cb => cb.value);

    const dificultad = document.getElementById('newDificultad').value;
    const correcta = document.getElementById('newCorrecta').value;
    const incorrectInputs = document.querySelectorAll('.incorrect-option');
    const opcionesIncorrectas = [];
    incorrectInputs.forEach(input => { if (input.value.trim() !== "") opcionesIncorrectas.push(input.value.trim()); });

    if (!enunciado || !asignatura || criteriosSelected.length === 0 || !correcta) return alert("Rellena todos los campos y selecciona al menos un criterio.");
    
    const payload = { 
        enunciado, 
        asignatura, 
        criterios_evaluacion: criteriosSelected, 
        dificultad, 
        respuesta_correcta: correcta, 
        incorrect_options: opcionesIncorrectas 
    };

    try {
        const res = await fetch(URL_PREGUNTAS, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.success) {
            alert('Pregunta guardada!');
            document.getElementById('newEnunciado').value = '';
            document.getElementById('newCorrecta').value = '';
            newAsignaturaSelect.value = "";
            criteriosCheckboxContainer.innerHTML = '<p class="italic text-gray-400 p-1">Selecciona una asignatura primero...</p>';
            incorrectOptionsContainer.innerHTML = ''; 
            addOptionInput();
        } else { alert('Error: ' + data.message); }
    } catch (err) { alert('Error de conexión.'); }
}

async function searchQuestions() {
    const subjectName = subjectSelect.selectedIndex > 0 ? subjectSelect.options[subjectSelect.selectedIndex].text : '';
    const themeName = searchCriterioSelect.selectedIndex > 0 ? searchCriterioSelect.options[searchCriterioSelect.selectedIndex].text : '';
    const difficulty = searchDifficultyInput.value;

    if (!subjectName && !difficulty && !themeName) return alert("Elige al menos un filtro.");
    
    showMainSection(searchQuestionsSection);
    
    resultsContainer.innerHTML = '<p class="text-center text-blue-500">Cargando...</p>';
    
    const params = new URLSearchParams();
    if (subjectName) params.append('subject', subjectName);
    if (themeName) params.append('theme', themeName); 
    if (difficulty) params.append('difficulty', difficulty);

    try {
        const res = await fetch(`${URL_PREGUNTAS}/search?${params.toString()}`);
        const data = await res.json();
        displaySearchResults(data.questions);
    } catch (error) { resultsContainer.innerHTML = '<p class="text-red-500 text-center">Error de conexión</p>'; }
}

function displaySearchResults(questions) {
    if (!questions || questions.length === 0) {
        resultsContainer.innerHTML = '<p class="text-center text-gray-500">No se encontraron preguntas.</p>';
        return;
    }
    resultsContainer.innerHTML = questions.map((q, i) => `
        <div class="border-b last:border-b-0 py-4">
            <h3 class="font-semibold text-gray-800">${i+1}. ${escapeHTML(q.enunciado)}</h3>
            <div class="flex gap-2 mb-2 mt-1">
                <span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">${escapeHTML(q.asignatura)}</span>
                <span class="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">${escapeHTML(q.tema || 'General')}</span>
            </div>
            <ul class="ml-4 list-disc text-sm text-gray-600 space-y-1">${q.opciones.map(o => `<li>${escapeHTML(o)}</li>`).join('')}</ul>
        </div>
    `).join('');
}


// --- GENERACIÓN DE EXÁMENES ---

async function generateExamPreview() {
    const subjectId = examSubjectSelect.value;
    const amount = document.getElementById('examAmountInput').value;

    if (!subjectId) return alert("Selecciona una asignatura.");

    try {
        const res = await fetch(`${URL_EXAMENES}/preview`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ subjectId, amount })
        });
        const data = await res.json();

        if (data.success) {
            currentExamData = data.exam;
            showMainSection(examViewContainer); 
            displayExam(data.exam);
        } else {
            alert('Error: ' + data.message);
        }
    } catch (err) { console.error(err); alert("Error generando el examen."); }
}

function displayExam(examData) {
    examNameInput.value = examData.nombre;

    examQuestionsList.innerHTML = examData.preguntas.map((q, i) => `
        <div class="bg-white p-6 rounded-lg shadow border border-indigo-100">
            <div class="flex justify-between items-start mb-4">
                <h3 class="text-lg font-bold text-gray-800">Pregunta ${i + 1}</h3>
                <span class="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded">${escapeHTML(q.tema || 'General')}</span>
            </div>
            <p class="text-gray-700 mb-4 text-lg">${escapeHTML(q.enunciado)}</p>
            <div class="space-y-3">
                ${q.opciones.map(opcion => `
                    <div class="flex items-center p-3 border border-gray-200 rounded hover:bg-gray-50 cursor-pointer transition">
                        <div class="w-4 h-4 border-2 border-gray-400 rounded-full mr-3"></div>
                        <span class="text-gray-700">${escapeHTML(opcion)}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
}

async function saveExamToDB() {
    if (!currentExamData) return alert("No hay examen para guardar.");

    const finalName = examNameInput.value;
    const author = examAuthorInput.value;
    const questionsIds = currentExamData.preguntas.map(q => q.id);

    try {
        const res = await fetch(`${URL_EXAMENES}/save`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nombre: finalName,
                asignaturaId: currentExamData.asignaturaId, 
                preguntasIds: questionsIds,
                autor: author
            })
        });
        const data = await res.json();

        if (data.success) {
            alert(`Examen "${finalName}" guardado correctamente en la Base de Datos.`);
            currentExamData.nombre = finalName;
            currentExamData.autor = author;
        } else {
            alert('Error al guardar: ' + data.message);
        }
    } catch (err) {
        console.error(err);
        alert("Error de conexión al guardar.");
    }
}

async function downloadExamPDF() {
    if (!currentExamData) return alert("No hay examen para descargar.");
    
    currentExamData.nombre = examNameInput.value;
    currentExamData.autor = examAuthorInput.value;

    try {
        const downloadBtn = document.getElementById('downloadExamBtn');
        const originalText = downloadBtn.innerHTML;
        downloadBtn.innerHTML = 'Generando...';
        downloadBtn.disabled = true;

        const response = await fetch(`${URL_EXAMENES}/pdf-preview`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(currentExamData)
        });

        if (!response.ok) throw new Error('Error generando PDF');

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${currentExamData.nombre}.pdf`; 
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();

        downloadBtn.innerHTML = originalText;
        downloadBtn.disabled = false;
    } catch (err) {
        console.error(err);
        alert('Error al descargar el PDF');
        document.getElementById('downloadExamBtn').disabled = false;
        document.getElementById('downloadExamBtn').innerHTML = '⬇ PDF';
    }
}