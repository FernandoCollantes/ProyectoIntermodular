// =============================================================================
//  CONFIGURACIÓN Y ESTADO GLOBAL
// =============================================================================

const URL_ASIGNATURAS = '/api/asignaturas';
const URL_PREGUNTAS = '/api/preguntas';
const URL_EXAMENES = '/api/examenes';
const URL_AI = '/api/ai';

let currentExamData = null;
let currentAiQuestions = [];
let activeExamId = null;
let loadedAttempts = [];

// =============================================================================
//  REFERENCIAS AL DOM
// =============================================================================

// Selectores de Curso (Nuevos)
const searchCursoInput = document.getElementById('searchCursoInput');
const newQuestionCurso = document.getElementById('newQuestionCurso');
const examSearchCurso = document.getElementById('examSearchCurso');
const examGenCurso = document.getElementById('examGenCurso');

// Selectores de Asignatura
const subjectSelect = document.getElementById('subjectInput');
const newAsignaturaSelect = document.getElementById('newAsignatura');
const examSearchSubject = document.getElementById('examSearchSubject');
const examSubjectSelect = document.getElementById('examSubjectInput');
const criterioSubjectSelect = document.getElementById('criterioSubjectSelect'); // Admin

// Selectores de RA (Nuevos)
const searchRAInput = document.getElementById('searchRAInput');
const newRASelect = document.getElementById('newRA');

// Resto de referencias
const searchCriterioSelect = document.getElementById('searchCriterioInput');
const searchDifficultyInput = document.getElementById('searchDifficultyInput');
const resultsContainer = document.getElementById('resultsContainer');
const searchQuestionsSection = document.getElementById('searchQuestionsSection');

const createSubjectForm = document.getElementById('createSubjectForm');
const createCriterioForm = document.getElementById('createCriterioForm');

const aiGenerationForm = document.getElementById('aiGenerationForm');
const pdfFileInput = document.getElementById('pdfFileInput');
const aiCursoInput = document.getElementById('aiCursoInput');
const aiAsignaturaInput = document.getElementById('aiAsignaturaInput');
const btnGenerateAi = document.getElementById('btnGenerateAi');
const aiResultsContainer = document.getElementById('aiResultsContainer');
const aiQuestionsList = document.getElementById('aiQuestionsList');

const criteriosCheckboxContainer = document.getElementById('criteriosCheckboxContainer');
const formContainer = document.getElementById('addQuestionForm');
const incorrectOptionsContainer = document.getElementById('incorrectOptionsContainer');

const createExamForm = document.getElementById('createExamForm');

const searchExamsSection = document.getElementById('searchExamsSection');
const examSearchAuthor = document.getElementById('examSearchAuthor');
const examSearchType = document.getElementById('examSearchType');
const examsListContainer = document.getElementById('examsListContainer');
const btnSearchExams = document.getElementById('btnSearchExams');

const attemptsSection = document.getElementById('attemptsSection');
const attemptsListContainer = document.getElementById('attemptsListContainer');

const examViewContainer = document.getElementById('examViewContainer');
const examQuestionsList = document.getElementById('examQuestionsList');
const examNameInput = document.getElementById('examNameInput');
const examAuthorInput = document.getElementById('examAuthorInput');
const examTypeInput = document.getElementById('examTypeInput');

const toggleFormBtn = document.getElementById('toggleFormBtn');
const toggleExamFormBtn = document.getElementById('toggleExamFormBtn');
const toggleSearchExamsBtn = document.getElementById('toggleSearchExamsBtn');
const toggleAiFormBtn = document.getElementById('toggleAiFormBtn');
const toggleAttemptsBtn = document.getElementById('toggleAttemptsBtn');

const toggleSubjectFormBtn = document.getElementById('toggleSubjectFormBtn');
const toggleCriterioFormBtn = document.getElementById('toggleCriterioFormBtn');

const addOptionBtn = document.getElementById('addOptionBtn');
const saveQuestionBtn = document.getElementById('saveQuestionBtn');
const searchBtn = document.getElementById('searchBtn');
const generateExamBtn = document.getElementById('generateExamBtn');
const downloadExamBtn = document.getElementById('downloadExamBtn');
const saveExamToDbBtn = document.getElementById('saveExamToDbBtn');
const saveSubjectBtn = document.getElementById('saveSubjectBtn');
const saveCriterioBtn = document.getElementById('saveCriterioBtn');


// =============================================================================
//  INYECCIÓN DEL MODAL
// =============================================================================
const modalHTML = `
<div id="reviewModal" class="fixed inset-0 bg-gray-900 bg-opacity-50 hidden flex justify-center items-center z-50 p-4">
    <div class="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        <div class="bg-indigo-600 p-4 flex justify-between items-center text-white">
            <h3 class="font-bold text-lg" id="modalTitle">Revisión de Examen</h3>
            <button onclick="closeModal()" class="text-white hover:text-gray-200 font-bold text-xl">&times;</button>
        </div>
        <div id="modalContent" class="p-6 overflow-y-auto bg-gray-50 flex-grow"></div>
        <div class="p-4 border-t bg-white flex justify-end">
            <button onclick="closeModal()" class="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 font-bold">Cerrar</button>
        </div>
    </div>
</div>`;
document.body.insertAdjacentHTML('beforeend', modalHTML);

const reviewModal = document.getElementById('reviewModal');
const modalTitle = document.getElementById('modalTitle');
const modalContent = document.getElementById('modalContent');


// =============================================================================
//  EVENT LISTENERS
// =============================================================================

document.addEventListener('DOMContentLoaded', async () => {
    setupEventListeners();
    await loadCursos(); // 1. Cargar Cursos
    await loadSubjects(); // 2. Cargar todas las asignaturas por defecto
});

function setupEventListeners() {

    // Navegación
    if (toggleFormBtn) toggleFormBtn.addEventListener('click', () => showMainSection(formContainer));
    if (toggleExamFormBtn) toggleExamFormBtn.addEventListener('click', () => showMainSection(createExamForm));
    if (toggleSearchExamsBtn) toggleSearchExamsBtn.addEventListener('click', () => showMainSection(searchExamsSection));
    if (toggleAiFormBtn) toggleAiFormBtn.addEventListener('click', () => showMainSection(aiGenerationForm));
    if (toggleAttemptsBtn) toggleAttemptsBtn.addEventListener('click', async () => {
        showMainSection(attemptsSection);
        await loadAttempts();
    });

    // Admin
    if (toggleSubjectFormBtn) toggleSubjectFormBtn.addEventListener('click', () => { createSubjectForm.classList.toggle('hidden'); createCriterioForm.classList.add('hidden'); });
    if (toggleCriterioFormBtn) toggleCriterioFormBtn.addEventListener('click', () => { createCriterioForm.classList.toggle('hidden'); createSubjectForm.classList.add('hidden'); });

    // Acciones
    if (addOptionBtn) addOptionBtn.addEventListener('click', addOptionInput);
    if (saveQuestionBtn) saveQuestionBtn.addEventListener('click', submitNewQuestion);
    if (searchBtn) searchBtn.addEventListener('click', searchQuestions);
    if (generateExamBtn) generateExamBtn.addEventListener('click', generateExamPreview);
    if (downloadExamBtn) downloadExamBtn.addEventListener('click', downloadExamPDF);
    if (saveExamToDbBtn) saveExamToDbBtn.addEventListener('click', saveExamToDB);
    if (saveSubjectBtn) saveSubjectBtn.addEventListener('click', submitNewSubject);
    if (saveCriterioBtn) saveCriterioBtn.addEventListener('click', submitNewCriterio);
    if (btnSearchExams) btnSearchExams.addEventListener('click', searchExams);
    if (btnGenerateAi) btnGenerateAi.addEventListener('click', uploadPdfToAi);

    // --- LOGICA DE FILTRADO (CASCADA) ---

    // Al cambiar el curso, recargamos el select de asignaturas correspondiente
    if (searchCursoInput) {
        searchCursoInput.addEventListener('change', (e) => loadSubjects(e.target.value, subjectSelect));
    }

    if (newQuestionCurso) newQuestionCurso.addEventListener('change', (e) => loadSubjects(e.target.value, newAsignaturaSelect));
    if (examSearchCurso) examSearchCurso.addEventListener('change', (e) => loadSubjects(e.target.value, examSearchSubject));
    if (examGenCurso) examGenCurso.addEventListener('change', (e) => loadSubjects(e.target.value, examSubjectSelect));

    // Al cambiar asignatura, cargamos RAs
    if (newAsignaturaSelect) newAsignaturaSelect.addEventListener('change', (e) => loadResultadosAprendizaje(e.target.value, newRASelect));
    if (subjectSelect) subjectSelect.addEventListener('change', (e) => loadResultadosAprendizaje(e.target.value, searchRAInput));

    // Al cambiar RA, cargamos criterios
    if (newRASelect) newRASelect.addEventListener('change', (e) => loadCriteriaCheckboxes(e.target.value, criteriosCheckboxContainer));
    if (searchRAInput) searchRAInput.addEventListener('change', (e) => handleCriteriaLoad(e.target.value, searchCriterioSelect));
}


// =============================================================================
//  FUNCIONES DE CARGA (MODIFICADAS)
// =============================================================================

async function loadCursos() {
    try {
        const res = await fetch(`${URL_ASIGNATURAS}/cursos`);
        const response = await res.json();

        // Selects de cursos
        const cursoSelects = [searchCursoInput, newQuestionCurso, examSearchCurso, examGenCurso];
        cursoSelects.forEach(sel => {
            if (sel) sel.innerHTML = '<option value="">-- Todos --</option>';
        });

        if (response.success && response.cursos) {
            response.cursos.forEach(c => {
                cursoSelects.forEach(sel => {
                    if (sel) sel.appendChild(new Option(c.nombre, c._id));
                });
            });
        }
    } catch (err) { console.error("Error cargando cursos", err); }
}

async function loadSubjects(cursoId = null, targetSelect = null) {
    try {
        // Construimos URL con filtro opcional
        let url = URL_ASIGNATURAS;
        if (cursoId) url += `?curso=${cursoId}`;

        const res = await fetch(url);
        const response = await res.json();

        // Si especificamos un target, solo actualizamos ese. Si no, todos.
        const selectsToUpdate = targetSelect ? [targetSelect] :
            [subjectSelect, examSubjectSelect, newAsignaturaSelect, criterioSubjectSelect, examSearchSubject];

        selectsToUpdate.forEach(sel => {
            if (sel) sel.innerHTML = '<option value="">-- Selecciona --</option>';
        });

        // Excepciones de texto (solo en carga masiva o reset)
        if (!targetSelect || !cursoId) {
            if (subjectSelect) subjectSelect.innerHTML = '<option value="">-- Cualquiera --</option>';
            if (examSearchSubject) examSearchSubject.innerHTML = '<option value="">-- Todas --</option>';
        }

        if (response.success && response.subjects) {
            response.subjects.forEach(subj => {
                selectsToUpdate.forEach(sel => {
                    if (sel) sel.appendChild(new Option(subj.nombre, subj._id));
                });
            });
        }
    } catch (err) { console.error("Error cargando asignaturas", err); }
}

async function loadResultadosAprendizaje(subjectId, targetSelect) {
    try {
        if (!targetSelect) return;
        targetSelect.disabled = true;
        targetSelect.innerHTML = '<option value="">-- Elige Asignatura --</option>';
        if (!subjectId) return;

        targetSelect.innerHTML = '<option>Cargando...</option>';
        const res = await fetch(`${URL_ASIGNATURAS}/resultados-aprendizaje?asignatura=${subjectId}`);
        const response = await res.json();
        targetSelect.innerHTML = '<option value="">-- Selecciona RA --</option>';
        if (response.success && response.results.length > 0) {
            // Filtrar RAs válidos (con nombre no vacío)
            const validRAs = response.results.filter(ra => ra.nombre && ra.nombre.trim() !== '');

            if (validRAs.length > 0) {
                validRAs.forEach(ra => targetSelect.appendChild(new Option(ra.nombre, ra._id)));
                targetSelect.disabled = false;
            } else {
                targetSelect.innerHTML = '<option value="">No hay RAs válidos</option>';
            }
        } else {
            targetSelect.innerHTML = '<option value="">No hay RAs</option>';
        }
    } catch (err) { console.error(err); targetSelect.innerHTML = '<option>Error</option>'; }
}

async function loadCriteria(resultadoId, targetSelect) {
    try {
        if (!targetSelect) return;
        targetSelect.disabled = true;
        targetSelect.innerHTML = '<option>Cargando...</option>';
        const res = await fetch(`${URL_ASIGNATURAS}/criterios?resultado=${resultadoId}`);
        const response = await res.json();
        targetSelect.innerHTML = '<option value="">-- Selecciona --</option>';
        if (response.success && response.criterios.length > 0) {
            response.criterios.forEach(crit => targetSelect.appendChild(new Option(crit.nombre, crit._id)));
            targetSelect.disabled = false;
        } else targetSelect.innerHTML = '<option value="">No hay criterios</option>';
    } catch (err) { console.error(err); targetSelect.innerHTML = '<option>Error</option>'; }
}

async function loadCriteriaCheckboxes(resultadoId, container) {
    container.innerHTML = '<p class="text-gray-400 p-1">Cargando...</p>';
    if (!resultadoId) { container.innerHTML = '<p class="italic text-gray-400 p-1">Selecciona un RA primero...</p>'; return; }
    try {
        console.log('🔍 Loading criterios for RA ID:', resultadoId);
        const res = await fetch(`${URL_ASIGNATURAS}/criterios?resultado=${resultadoId}`);
        const response = await res.json();
        console.log('📦 Response:', response);
        console.log('📊 Criterios count:', response.criterios ? response.criterios.length : 0);

        container.innerHTML = '';
        if (response.success && response.criterios && response.criterios.length > 0) {
            // Filtrar criterios válidos (con nombre no vacío)
            const validCriterios = response.criterios.filter(crit => crit.nombre && crit.nombre.trim() !== '');
            console.log('✅ Valid criterios:', validCriterios.length);

            if (validCriterios.length > 0) {
                validCriterios.forEach(crit => {
                    const div = document.createElement('div');
                    div.className = "flex items-center gap-2 mb-1 p-1 hover:bg-gray-50 rounded";
                    div.innerHTML = `<input type="checkbox" value="${crit._id}" class="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"><label class="text-gray-700 select-none cursor-pointer flex-grow text-xs">${escapeHTML(crit.nombre)}</label>`;
                    container.appendChild(div);
                });
            } else {
                container.innerHTML = '<p class="text-red-400 p-1 text-xs">No hay criterios válidos.</p>';
            }
        } else {
            console.log('❌ No criterios found or error');
            container.innerHTML = '<p class="text-red-400 p-1 text-xs">No hay criterios definidos.</p>';
        }
    } catch (err) {
        console.error('💥 Error loading criterios:', err);
        container.innerHTML = '<p class="text-red-500 text-xs">Error al cargar.</p>';
    }
}


// =============================================================================
//  RESTO DE FUNCIONES (Helpers, Historial, IA, Examen...)
// =============================================================================

function showMainSection(targetSection) {
    const sections = [
        formContainer, createExamForm, searchExamsSection,
        searchQuestionsSection, resultsContainer, examViewContainer,
        aiGenerationForm, attemptsSection
    ];
    sections.forEach(s => s.classList.add('hidden'));
    if (targetSection) {
        targetSection.classList.remove('hidden');
        if (targetSection === searchQuestionsSection) resultsContainer.classList.remove('hidden');
    }
    if (targetSection === formContainer && incorrectOptionsContainer.children.length === 0) addOptionInput();
}
window.closeModal = () => { reviewModal.classList.add('hidden'); modalContent.innerHTML = ''; };
window.openModal = () => reviewModal.classList.remove('hidden');
function handleCriteriaLoad(resultadoId, targetSelect) { if (resultadoId) loadCriteria(resultadoId, targetSelect); else resetSelect(targetSelect); }
function resetSelect(targetSelect) { targetSelect.innerHTML = '<option value="">-- Elige RA --</option>'; targetSelect.disabled = true; }

// --- HISTORIAL ---
async function loadAttempts() {
    try {
        attemptsListContainer.innerHTML = '<p class="text-center text-gray-500 py-4">Cargando historial...</p>';
        const res = await fetch(`${URL_EXAMENES}/student/attempts`);
        const data = await res.json();
        if (data.success) { loadedAttempts = data.intentos; displayAttempts(data.intentos); }
        else attemptsListContainer.innerHTML = `<p class="text-center text-red-500">Error: ${data.message}</p>`;
    } catch (err) { attemptsListContainer.innerHTML = '<p class="text-center text-red-500">Error de conexión.</p>'; }
}
function displayAttempts(intentos) {
    if (!intentos || intentos.length === 0) { attemptsListContainer.innerHTML = '<p class="text-center text-gray-500 py-4">Sin intentos.</p>'; return; }
    attemptsListContainer.innerHTML = intentos.map((intento) => {
        const notaColor = intento.nota >= 5 ? 'text-green-600' : 'text-red-600';
        const fecha = new Date(intento.fecha_intento).toLocaleDateString() + ' ' + new Date(intento.fecha_intento).toLocaleTimeString();
        const nombreExamen = intento.examen_id ? escapeHTML(intento.examen_id.nombre) : 'Examen Eliminado';
        const nombreAsig = intento.examen_id && intento.examen_id.asignatura ? escapeHTML(intento.examen_id.asignatura.nombre) : '-';
        return `<div class="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded shadow-sm border border-blue-100 hover:shadow-md transition"><div class="mb-2 sm:mb-0"><h4 class="font-bold text-blue-900 text-sm">${nombreExamen}</h4><p class="text-xs text-gray-500"><span class="bg-blue-50 text-blue-600 px-1 rounded">${nombreAsig}</span> • ${fecha}</p></div><div class="flex items-center gap-4"><div class="text-right"><span class="text-xs text-gray-400 block uppercase font-bold tracking-wider">Nota</span><span class="text-2xl font-black ${notaColor}">${intento.nota}</span></div><button onclick="viewAttemptInModal('${intento._id}')" class="text-blue-600 hover:text-blue-800 text-xl p-2 bg-blue-50 rounded-full" title="Ver corrección">👁️</button></div></div>`;
    }).join('');
}
window.viewAttemptInModal = (intentoId) => {
    const intento = loadedAttempts.find(i => i._id === intentoId);
    if (!intento) return;
    const nombreExamen = intento.examen_id ? escapeHTML(intento.examen_id.nombre) : 'Desconocido';
    const notaColor = intento.nota >= 5 ? 'text-green-600' : 'text-red-600';
    modalTitle.innerHTML = `Revisión: ${nombreExamen} <span class="ml-2 text-sm bg-white px-2 py-1 rounded border ${notaColor} text-indigo-900">Nota: ${intento.nota}</span>`;
    modalContent.innerHTML = intento.respuestas.map(resp => {
        const preg = resp.pregunta_id; if (!preg) return `<div class="p-4 border border-red-200 bg-red-50 text-red-600 rounded mb-4">Pregunta eliminada</div>`;
        const esAcierto = resp.es_correcta;
        const colorClase = esAcierto ? 'border-l-8 border-green-500 bg-green-50' : 'border-l-8 border-red-500 bg-red-50';
        return `<div class="bg-white p-6 rounded-lg shadow border border-gray-200 ${colorClase} mb-6"><h3 class="font-bold text-gray-800 mb-3 text-lg"><span class="mr-2">${esAcierto ? '✅' : '❌'}</span> ${escapeHTML(preg.enunciado)}</h3><div class="space-y-2 mb-3">${preg.opciones.map(opcion => {
            let style = "border-gray-200 text-gray-600";
            const marcado = opcion === resp.respuesta_marcada; const correcta = opcion === preg.respuesta_correcta;
            if (marcado) style = esAcierto ? "border-green-500 bg-green-100 text-green-800 font-bold" : "border-red-500 bg-red-100 text-red-800 font-bold";
            if (correcta && !marcado) style = "border-green-500 bg-green-50 text-green-800 font-bold";
            return `<div class="p-3 border rounded ${style} flex items-center"><span class="mr-2">${marcado ? '●' : '○'}</span>${escapeHTML(opcion)}</div>`;
        }).join('')}</div></div>`;
    }).join('');
    openModal();
};

// ... IA ...
async function uploadPdfToAi() { /* ... igual ... */
    const file = pdfFileInput.files[0]; const curso = aiCursoInput.value; const asignatura = aiAsignaturaInput.value;
    if (!file || !curso || !asignatura) return alert("Faltan datos.");
    const originalText = btnGenerateAi.innerHTML; btnGenerateAi.innerHTML = '⏳ ...'; btnGenerateAi.disabled = true; aiResultsContainer.classList.add('hidden');
    const fd = new FormData(); fd.append('pdfFile', file); fd.append('curso', curso); fd.append('asignatura', asignatura);
    try { const res = await fetch(`${URL_AI}/upload-pdf`, { method: 'POST', body: fd }); const d = await res.json(); if (d.success) { currentAiQuestions = d.questions; displayAiResultsInline(); } else alert(d.message); } catch (e) { alert('Error'); } finally { btnGenerateAi.innerHTML = originalText; btnGenerateAi.disabled = false; }
}
function displayAiResultsInline() {
    aiResultsContainer.classList.remove('hidden'); if (!currentAiQuestions.length) { aiQuestionsList.innerHTML = '<p>No hay preguntas.</p>'; return; }
    aiQuestionsList.innerHTML = currentAiQuestions.map((q, i) => `<div id="ai-item-${i}" class="bg-white p-4 rounded border border-purple-200 shadow-sm transition-all"><div id="ai-view-${i}"><p class="font-bold text-purple-900 mb-2">#${i + 1} ${escapeHTML(q.enunciado)}</p><button onclick="openAiEditor(${i})" class="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded font-bold">✏️ Editar</button><button onclick="removeAiItem(${i})" class="text-xs bg-red-50 text-red-600 px-3 py-1 rounded hover:bg-red-100 ml-2">🗑️ Descartar</button></div><div id="ai-edit-${i}" class="hidden mt-2 border-t pt-3 border-purple-100"><div class="grid gap-3"><input type="text" id="edit-enunciado-${i}" value="${escapeHTML(q.enunciado)}" class="p-2 border rounded w-full text-sm font-bold text-gray-800"><div class="flex gap-2"><div class="w-1/2"><label class="text-xs font-bold">Asignatura</label><select id="edit-asignatura-${i}" class="p-1 border rounded w-full text-sm bg-gray-50" onchange="loadCriteriaForInline(${i})"><option value="">-- Selecciona --</option></select></div><div class="w-1/2"><label class="text-xs font-bold">Criterios</label><div id="edit-criterios-box-${i}" class="p-1 border rounded w-full h-20 overflow-y-auto text-xs bg-white"><p class="text-gray-400 italic">Elige asignatura...</p></div></div></div><div class="flex gap-2"><div class="w-1/3"><label class="text-xs font-bold">Dificultad</label><input type="number" id="edit-dificultad-${i}" value="${q.dificultad || 1}" class="p-1 border rounded w-full text-sm"></div><div class="w-2/3"><label class="text-xs font-bold text-green-600">Correcta</label><input type="text" id="edit-correcta-${i}" value="${escapeHTML(q.respuesta_correcta)}" class="p-1 border-2 border-green-100 rounded w-full text-sm"></div></div><div id="edit-incorrectas-box-${i}" class="space-y-1">${q.opciones.filter(o => o !== q.respuesta_correcta).map(opt => `<input type="text" class="edit-incorrecta-${i} w-full p-1 border rounded text-xs text-gray-600" value="${escapeHTML(opt)}">`).join('')}</div><div class="flex justify-end gap-2 mt-2"><button onclick="closeAiEditor(${i})" class="text-xs underline px-2">Cancelar</button><button onclick="saveAiQuestion(${i})" class="text-xs bg-green-600 text-white px-4 py-2 rounded font-bold shadow">💾 Guardar</button></div></div></div></div>`).join('');
}
window.openAiEditor = async (i) => { document.getElementById(`ai-view-${i}`).classList.add('hidden'); document.getElementById(`ai-edit-${i}`).classList.remove('hidden'); const sel = document.getElementById(`edit-asignatura-${i}`); if (sel.options.length <= 1) sel.innerHTML = document.getElementById('newAsignatura').innerHTML; };
window.closeAiEditor = (i) => { document.getElementById(`ai-edit-${i}`).classList.add('hidden'); document.getElementById(`ai-view-${i}`).classList.remove('hidden'); };
window.removeAiItem = (i) => document.getElementById(`ai-item-${i}`).remove();
window.loadCriteriaForInline = (i) => loadCriteriaCheckboxes(document.getElementById(`edit-asignatura-${i}`).value, document.getElementById(`edit-criterios-box-${i}`));
window.saveAiQuestion = async (i) => {
    const enc = document.getElementById(`edit-enunciado-${i}`).value; const asig = document.getElementById(`edit-asignatura-${i}`).value; const dif = document.getElementById(`edit-dificultad-${i}`).value; const corr = document.getElementById(`edit-correcta-${i}`).value;
    const crit = Array.from(document.getElementById(`edit-criterios-box-${i}`).querySelectorAll('input:checked')).map(c => c.value);
    const inc = []; document.querySelectorAll(`.edit-incorrecta-${i}`).forEach(x => { if (x.value.trim()) inc.push(x.value.trim()) });
    if (!enc || !asig || !crit.length || !corr) return alert('Datos');
    try { const res = await fetch(URL_PREGUNTAS, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ enunciado: enc, asignatura: asig, criterios_evaluacion: crit, dificultad: dif, respuesta_correcta: corr, incorrect_options: inc }) }); const d = await res.json(); if (d.success) { document.getElementById(`ai-item-${i}`).remove(); } else alert(d.message); } catch (e) { alert('Error'); }
};

// ... EXAMEN ...
async function generateExamPreview() { /* ... igual ... */
    const s = examSubjectSelect.value; const a = document.getElementById('examAmountInput').value; if (!s) return alert('Selecciona.');
    try { const res = await fetch(`${URL_EXAMENES}/preview`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ subjectId: s, amount: a }) }); const d = await res.json(); if (d.success) { currentExamData = d.exam; showMainSection(examViewContainer); displayExam(d.exam); } else alert(d.message); } catch (e) { alert('Error'); }
}
function displayExam(e) {
    examNameInput.value = e.nombre; examNameInput.disabled = false; examAuthorInput.value = e.autor || 'admin';
    if (activeExamId === null) { document.getElementById('downloadExamBtn').classList.remove('hidden'); document.getElementById('saveExamToDbBtn').classList.remove('hidden'); const b = document.getElementById('submitExamBtn'); if (b) b.classList.add('hidden'); }
    examQuestionsList.innerHTML = e.preguntas.map((q, i) => `<div class="bg-white p-6 rounded-lg shadow border border-indigo-100 question-card" data-id="${q.id}"><h3 class="font-bold text-gray-800 mb-4 text-lg"><span class="bg-indigo-100 text-indigo-800 px-2 py-1 rounded text-sm mr-2">P${i + 1}</span>${escapeHTML(q.enunciado)}</h3><div class="space-y-3">${q.opciones.map(o => `<div class="flex items-center p-3 border border-gray-200 rounded hover:bg-gray-50 cursor-pointer"><div class="w-4 h-4 border-2 border-gray-400 rounded-full mr-3"></div><span class="text-gray-700">${escapeHTML(o)}</span></div>`).join('')}</div></div>`).join('');
}
async function saveExamToDB() {
    if (!currentExamData) return alert('No examen'); const t = document.getElementById('examTypeInput').value;
    try { const res = await fetch(`${URL_EXAMENES}/save`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nombre: examNameInput.value, asignaturaId: currentExamData.asignaturaId, preguntasIds: currentExamData.preguntas.map(q => q.id), autor: examAuthorInput.value, tipo: t }) }); const d = await res.json(); if (d.success) alert(`Guardado`); else alert(d.message); } catch (e) { alert('Error'); }
}
async function downloadExamPDF() {
    if (!currentExamData) return alert('No examen'); currentExamData.nombre = examNameInput.value;
    try { const res = await fetch(`${URL_EXAMENES}/pdf-preview`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(currentExamData) }); if (!res.ok) throw new Error(); const b = await res.blob(); const u = window.URL.createObjectURL(b); const a = document.createElement('a'); a.href = u; a.download = `${currentExamData.nombre}.pdf`; document.body.appendChild(a); a.click(); window.URL.revokeObjectURL(u); a.remove(); } catch (e) { alert('Error PDF'); }
}

// ... ALUMNO Y BUSQUEDA EXAMEN ...
async function searchExams() {
    try { examsListContainer.innerHTML = '...'; const q = new URLSearchParams(); if (examSearchSubject.value) q.append('subjectId', examSearchSubject.value); if (examSearchAuthor.value) q.append('autor', examSearchAuthor.value); if (examSearchType.value) q.append('tipo', examSearchType.value); const res = await fetch(`${URL_EXAMENES}/search?${q}`); const d = await res.json(); if (d.success) displayExamsList(d.exams); else examsListContainer.innerHTML = 'Error'; } catch (e) { examsListContainer.innerHTML = 'Error'; }
}
function displayExamsList(e) {
    if (!e || e.length === 0) { examsListContainer.innerHTML = 'Sin resultados'; return; }
    examsListContainer.innerHTML = e.map(x => {
        const b = x.tipo === 'OFICIAL' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800';
        const t = x.tipo !== 'OFICIAL' ? `<button onclick="takeExam('${x._id}')" class="text-green-600 text-xs font-bold border border-green-200 px-3 py-1 rounded hover:bg-green-50">✍️ Realizar</button>` : `<span class="text-xs text-gray-400 font-bold px-3 py-1 border border-gray-200 bg-gray-50 rounded cursor-not-allowed">🔒 Oficial</span>`;
        return `<div class="flex flex-col sm:flex-row justify-between items-center bg-white p-3 rounded shadow-sm border border-gray-200"><div class="mb-2 sm:mb-0"><h4 class="font-bold text-gray-800 text-sm flex items-center gap-2">${escapeHTML(x.nombre)} <span class="text-xs px-2 py-0.5 rounded border ${b}">${x.tipo || 'PRACTICA'}</span></h4><p class="text-xs text-gray-500">${escapeHTML(x.asignatura?.nombre)}</p></div><div class="flex gap-2">${t}<a href="${URL_EXAMENES}/${x._id}/pdf" target="_blank" class="text-indigo-600 text-xs font-bold border border-indigo-200 px-3 py-1 rounded hover:bg-indigo-50">📥 PDF</a><a href="${URL_EXAMENES}/${x._id}/export-json" target="_blank" class="text-gray-600 text-xs font-bold border border-gray-300 px-3 py-1 rounded hover:bg-gray-100">JSON</a></div></div>`;
    }).join('');
}
window.takeExam = async (id) => { try { const res = await fetch(`${URL_EXAMENES}/${id}/take`); const d = await res.json(); if (d.success) { activeExamId = id; renderExamInterface(d.exam); } else alert(d.message); } catch (e) { alert('Error'); } };
function renderExamInterface(e) {
    showMainSection(examViewContainer); document.getElementById('downloadExamBtn').classList.add('hidden'); document.getElementById('saveExamToDbBtn').classList.add('hidden');
    const h = examViewContainer.querySelector('.bg-indigo-100');
    if (!document.getElementById('examNameInput') || document.getElementById('modalTitle')) {
        h.innerHTML = `<div class="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4"><h2 class="text-xl font-bold text-indigo-900">Realizar Examen</h2><div class="flex gap-2" id="actionButtonsPlaceholder"></div></div><div class="grid grid-cols-1 sm:grid-cols-2 gap-4"><div><label class="block text-xs font-bold text-indigo-800 uppercase mb-1">Nombre</label><input type="text" id="examNameInput" class="w-full p-2 border border-indigo-300 rounded text-sm" disabled></div><div><label class="block text-xs font-bold text-indigo-800 uppercase mb-1">Autor</label><input type="text" id="examAuthorInput" class="w-full p-2 border border-indigo-300 rounded text-sm bg-indigo-50" readonly></div></div>`;
    }
    let btn = document.getElementById('submitExamBtn'); if (!btn) { btn = document.createElement('button'); btn.id = 'submitExamBtn'; btn.className = "bg-green-600 text-white px-6 py-2 rounded font-bold hover:bg-green-700 transition shadow"; btn.innerHTML = "✅ Entregar"; btn.onclick = submitExamAnswers; const p = document.getElementById('actionButtonsPlaceholder') || examViewContainer.querySelector('.flex.gap-2'); if (p) p.appendChild(btn); } btn.classList.remove('hidden');
    document.getElementById('examNameInput').value = e.nombre; document.getElementById('examAuthorInput').value = e.autor;
    examQuestionsList.innerHTML = e.preguntas.map((q, i) => `<div class="bg-white p-6 rounded-lg shadow border border-indigo-100 question-card" data-id="${q.id}"><h3 class="font-bold text-gray-800 mb-4 text-lg"><span class="bg-indigo-100 text-indigo-800 px-2 py-1 rounded text-sm mr-2">P${i + 1}</span>${escapeHTML(q.enunciado)}</h3><div class="space-y-3">${q.opciones.map(o => `<label class="flex items-center p-3 border border-gray-200 rounded hover:bg-indigo-50 cursor-pointer transition"><input type="radio" name="q_${q.id}" value="${escapeHTML(o)}" class="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500 mr-3"><span class="text-gray-700 select-none">${escapeHTML(o)}</span></label>`).join('')}</div></div>`).join('');
}
async function submitExamAnswers() {
    if (!confirm("¿Entregar?")) return;
    const a = []; document.querySelectorAll('.question-card').forEach(c => { const id = c.getAttribute('data-id'); const sel = c.querySelector(`input[name="q_${id}"]:checked`); if (sel) a.push({ preguntaId: id, valor: sel.value }); });
    try { const res = await fetch(`${URL_EXAMENES}/${activeExamId}/submit`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ answers: a }) }); if (!res.ok) throw new Error((await res.json()).message); const d = await res.json(); if (d.success) showExamResults(d.result); else alert(d.message); } catch (e) { alert('Error: ' + e.message); }
}
function showExamResults(r) {
    window.scrollTo(0, 0); examViewContainer.querySelector('.bg-indigo-100').innerHTML = `<div class="text-center py-4"><h2 class="text-3xl font-bold text-indigo-900 mb-2">Resultados</h2><div class="text-5xl font-black ${r.nota >= 5 ? 'text-green-600' : 'text-red-600'}">${r.nota} <span class="text-xl text-gray-500">/ 10</span></div><p class="text-gray-600 mt-2">Aciertos: ${r.aciertos}</p><button onclick="location.reload()" class="mt-4 text-sm underline text-indigo-600">Inicio</button></div>`;
    r.detalles.forEach(d => { const c = document.querySelector(`.question-card[data-id="${d.pregunta_id}"]`); if (c) { if (d.es_correcta) c.classList.add('border-l-8', 'border-green-500', 'bg-green-50'); else { c.classList.add('border-l-8', 'border-red-500', 'bg-red-50'); const f = document.createElement('div'); f.className = "mt-4 p-2 bg-green-100 text-green-800 text-sm rounded font-bold"; f.innerText = `Solución: ${d.correcta_real}`; c.appendChild(f); } } });
    const b = document.getElementById('submitExamBtn'); if (b) b.remove();
}

// ... ADMIN MANUAL ...
function addOptionInput() { const w = document.createElement('div'); w.className = 'flex items-center gap-2'; w.innerHTML = `<input type="text" class="incorrect-option flex-grow p-2 border rounded focus:ring-2 focus:ring-gray-200 outline-none" placeholder="Opción incorrecta"><button type="button" class="delete-option-btn text-gray-400 hover:text-red-500 px-2 font-bold" title="Eliminar">✕</button>`; w.querySelector('button').onclick = () => w.remove(); incorrectOptionsContainer.appendChild(w); }
async function submitNewQuestion() {
    const enunciado = document.getElementById('newEnunciado').value;
    const asignatura = newAsignaturaSelect.value;
    const checkedBoxes = criteriosCheckboxContainer.querySelectorAll('input[type="checkbox"]:checked');
    const criteriosSelected = Array.from(checkedBoxes).map(cb => cb.value);
    const dificultad = document.getElementById('newDificultad').value;
    const correcta = document.getElementById('newCorrecta').value;
    const incorrectInputs = document.querySelectorAll('.incorrect-option');
    const opcionesIncorrectas = [];
    incorrectInputs.forEach(input => { if (input.value.trim()) opcionesIncorrectas.push(input.value.trim()); });
    if (!enunciado || !asignatura || criteriosSelected.length === 0 || !correcta) return alert("Rellena todo.");
    try {
        const res = await fetch(URL_PREGUNTAS, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                enunciado, asignatura, criterios_evaluacion: criteriosSelected,
                dificultad, respuesta_correcta: correcta, incorrect_options: opcionesIncorrectas
            })
        });
        const data = await res.json();
        if (data.success) {
            alert('Guardado');
            document.getElementById('newEnunciado').value = '';
            document.getElementById('newCorrecta').value = '';
            newAsignaturaSelect.value = "";
            if (newRASelect) {
                newRASelect.value = "";
                newRASelect.disabled = true;
                newRASelect.innerHTML = '<option value="">-- Elige Asignatura --</option>';
            }
            criteriosCheckboxContainer.innerHTML = '<p class="italic text-gray-400 p-1">Elige RA...</p>';
            incorrectOptionsContainer.innerHTML = '';
            addOptionInput();
        } else alert(data.message);
    } catch (err) { alert('Error.'); }
}

async function searchQuestions() {
    const subjectName = subjectSelect.selectedIndex > 0 ? subjectSelect.options[subjectSelect.selectedIndex].text : '';
    const raId = searchRAInput ? searchRAInput.value : '';
    const criterionId = searchCriterioSelect.value;
    const difficulty = searchDifficultyInput.value;

    if (!subjectName && !difficulty && !raId && !criterionId) return alert("Elige algún filtro.");

    showMainSection(searchQuestionsSection);
    resultsContainer.innerHTML = '<p class="text-center text-blue-500">Cargando...</p>';

    const params = new URLSearchParams();
    if (subjectName) params.append('subject', subjectName);
    if (raId) params.append('resultadoId', raId);
    if (criterionId) params.append('criterioId', criterionId);
    if (difficulty) params.append('difficulty', difficulty);

    try {
        const res = await fetch(`${URL_PREGUNTAS}/search?${params.toString()}`);
        const d = await res.json();
        displaySearchResults(d.questions);
    } catch (e) { resultsContainer.innerHTML = 'Error'; }
}

async function submitNewSubject() {
    const codigo = document.getElementById('newSubjectCode').value;
    const nombre = document.getElementById('newSubjectName').value;
    if (!codigo || !nombre) return alert("Rellena todos los campos.");
    try {
        const res = await fetch(URL_ASIGNATURAS, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ codigo, nombre })
        });
        const d = await res.json();
        if (d.success) {
            alert("Asignatura creada");
            document.getElementById('newSubjectCode').value = '';
            document.getElementById('newSubjectName').value = '';
            await loadSubjects(); // Recargar selectores
        } else {
            alert(d.message);
        }
    } catch (e) {
        alert("Error al guardar asignatura");
    }
}

async function submitNewCriterio() {
    const nombre = document.getElementById('newCriterioName').value;
    const asignaturaId = criterioSubjectSelect.value;
    const descripcion = document.getElementById('newCriterioDesc').value;
    if (!nombre || !asignaturaId) return alert("Rellena nombre y elige asignatura.");
    try {
        const res = await fetch(`${URL_ASIGNATURAS}/criterios`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, descripcion, asignaturaId })
        });
        const d = await res.json();
        if (d.success) {
            alert("Criterio creado");
            document.getElementById('newCriterioName').value = '';
            document.getElementById('newCriterioDesc').value = '';
        } else {
            alert(d.message);
        }
    } catch (e) {
        alert("Error al guardar criterio");
    }
}

function escapeHTML(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}
