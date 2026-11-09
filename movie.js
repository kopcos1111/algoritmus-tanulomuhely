(function () {
  const storageKey = 'algoritmus-film-progress';
  const steps = ['celok', 'problema', 'kezi', 'algoritmus', 'programozas', 'futasido', 'ellenorzes', 'tovabblepes'];
  let completed = new Set(JSON.parse(localStorage.getItem(storageKey) || '[]'));
  const progressBar = document.getElementById('progress-bar');
  const progressLabel = document.getElementById('progress-label');

  function updateProgress() {
    const percent = Math.round(completed.size / steps.length * 100);
    progressBar.style.width = percent + '%';
    progressLabel.textContent = percent + '% kész';
    document.querySelectorAll('[data-complete]').forEach(button => button.classList.toggle('done', completed.has(button.dataset.complete)));
    document.getElementById('completion-message').hidden = completed.size !== steps.length;
  }
  document.querySelectorAll('[data-complete]').forEach(button => button.addEventListener('click', () => { completed.add(button.dataset.complete); localStorage.setItem(storageKey, JSON.stringify([...completed])); updateProgress(); }));
  document.getElementById('reset-progress').addEventListener('click', () => { completed.clear(); localStorage.removeItem(storageKey); updateProgress(); });

  const explanations = {
    manual: ['2 film', 'A 3–5 film után az 5–8 film következhet. A 4–9 film átfedné ezeket.'],
    choice: ['Amelyik a leghamarabb véget ér', 'A korábbi befejezés után több idő marad a további filmekre.'],
    q1: ['Befejezési idő szerint', 'Így mindig azt a filmet vizsgáljuk előbb, amelyik a leghamarabb felszabadítja az időnket.'],
    q2: ['Ha a kezdése legalább az előző befejezése', 'Az egyenlőség is jó: az új film kezdődhet pontosan az előző befejezésekor.'],
    q3: ['Mert egyetlen rövid film több másik vetítést is kizárhat az átfedés miatt', 'A film hossza önmagában nem elég. Az 5–7 közötti rövid film átfedi az 1–6 és a 6–12 filmet, ezért csak egy film fér bele; az 1–6 és a 6–12 együtt viszont kettő.'],
    q4: ['O(n log n)', 'A rendezés O(n log n), az utána következő egyszeri bejárás O(n). A rendezés határozza meg a teljes futási időt.']
  };
  document.querySelectorAll('.check-answer').forEach(button => button.addEventListener('click', () => {
    const fieldset = button.closest('fieldset');
    const selected = fieldset.querySelector('input:checked');
    const feedback = document.getElementById(button.dataset.target);
    const key = fieldset.dataset.question;
    if (!selected) { feedback.className = 'feedback incorrect'; feedback.textContent = 'Előbb jelölj meg egy választ!'; return; }
    const right = selected.value === button.dataset.answer;
    const selectedText = selected.parentElement.textContent.trim();
    feedback.className = 'feedback ' + (right ? 'correct' : 'incorrect');
    feedback.textContent = right ? 'Helyes. ' + explanations[key][1] : 'A választott válasz: ' + selectedText + '\nA helyes válasz: ' + explanations[key][0] + '\nMiért? ' + explanations[key][1];
  }));

  function normalizeCode(value) {
    return value.trim().replace(/\s+/g, ' ');
  }
  document.querySelectorAll('.code-check').forEach(button => button.addEventListener('click', () => {
    const step = button.closest('.coding-step');
    const blanks = [...step.querySelectorAll('.code-blank')];
    const feedback = step.querySelector('.code-feedback');
    const wrong = [];
    blanks.forEach(blank => {
      const right = normalizeCode(blank.value) === normalizeCode(blank.dataset.answer);
      blank.classList.toggle('correct', right);
      blank.classList.toggle('incorrect', !right);
      if (!right) wrong.push(blank.dataset.label + ': a helyes válasz „' + blank.dataset.answer + '”.\nMiért? ' + blank.dataset.explain);
    });
    if (wrong.length === 0) {
      feedback.className = 'code-feedback correct';
      feedback.textContent = 'Minden kitöltés helyes.';
    } else {
      feedback.className = 'code-feedback incorrect';
      feedback.textContent = wrong.join('\n\n');
    }
  }));

  const originalMovies = [[1, 10], [2, 3], [3, 4], [4, 5]];
  let movies = [...originalMovies];
  let movieIndex = 0, lastEnd = 0, count = 0;
  let movieButtons = [];
  let sortMode = '';
  function renderMovies() {
    const schedule = document.getElementById('movie-schedule');
    schedule.innerHTML = movies.map(([start, end]) => `<button type="button">Kezdés: ${start} → Befejezés: ${end}</button>`).join('');
    movieButtons = [...schedule.querySelectorAll('button')];
  }
  function resetSimulation(message) {
    movieIndex = 0; lastEnd = 0; count = 0; renderMovies();
    document.getElementById('current-movie').textContent = '–';
    document.getElementById('movie-count').textContent = '0';
    document.getElementById('sim-explanation').textContent = message || 'Válassz rendezési módot, majd kattints a „Következő film” gombra!';
  }
  function chooseSort(mode) {
    sortMode = mode;
    document.querySelectorAll('.sort-choice').forEach(button => {
      const active = button.id === (mode === 'start' ? 'sort-start' : 'sort-end');
      button.classList.toggle('sort-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    movies = [...originalMovies].sort(mode === 'start' ? (a, b) => a[0] - b[0] : (a, b) => a[1] - b[1]);
    resetSimulation(mode === 'start' ? 'Kezdési idő szerint rendeztünk. Figyeld meg, mi történik az 1–10 filmmel!' : 'Befejezési idő szerint rendeztünk. Most a 2–3 film kerül előre.');
  }
  document.getElementById('sort-start').addEventListener('click', () => chooseSort('start'));
  document.getElementById('sort-end').addEventListener('click', () => chooseSort('end'));
  document.getElementById('sim-next').addEventListener('click', () => {
    if (!sortMode) { document.getElementById('sim-explanation').textContent = 'Előbb válaszd ki, mi alapján rendezzük a filmeket!'; return; }
    if (movieIndex >= movies.length) return;
    const [start, end] = movies[movieIndex];
    const previousEnd = lastEnd;
    const accepted = start >= lastEnd;
    movieButtons[movieIndex].classList.add(accepted ? 'selected' : 'rejected');
    document.getElementById('current-movie').textContent = start + '–' + end;
    if (accepted) { count++; lastEnd = end; document.getElementById('sim-explanation').textContent = 'Kiválasztjuk, mert ' + start + ' ≥ ' + previousEnd + '. Az új befejezési idő: ' + end + '.'; }
    else document.getElementById('sim-explanation').textContent = 'Kihagyjuk, mert ' + start + ' < ' + lastEnd + ', ezért átfedné az előző filmet.';
    document.getElementById('movie-count').textContent = count; movieIndex++;
  });
  document.getElementById('sim-reset').addEventListener('click', () => {
    sortMode = ''; movies = [...originalMovies];
    document.querySelectorAll('.sort-choice').forEach(button => { button.classList.remove('sort-active'); button.setAttribute('aria-pressed', 'false'); });
    resetSimulation();
  });

  const startCode = document.getElementById('python-editor').value;
  const solution = `def befejezesi_ido(film):
    return film[1]


def legtobb_film(filmek):
    filmek.sort(key=befejezesi_ido)

    megnezett_filmek = 0
    elozo_befejezes = 0

    for film in filmek:
        kezdes = film[0]
        befejezes = film[1]

        if kezdes >= elozo_befejezes:
            megnezett_filmek += 1
            elozo_befejezes = befejezes

    return megnezett_filmek


n = int(input())
filmek = []

for _ in range(n):
    adatok = input().split()
    kezdes = int(adatok[0])
    befejezes = int(adatok[1])
    filmek.append((kezdes, befejezes))

eredmeny = legtobb_film(filmek)

print(eredmeny)`;
  let pyodidePromise;
  async function getPython() {
    const status = document.getElementById('runtime-status');
    if (!pyodidePromise) { status.textContent = 'Python betöltése…'; status.className = 'runtime-status loading'; pyodidePromise = loadPyodide().then(py => { status.textContent = 'Python használatra kész'; status.className = 'runtime-status ready'; return py; }); }
    return pyodidePromise;
  }
  async function run(code) {
    const output = document.getElementById('python-output'); output.className = 'python-output'; output.textContent = 'Futtatás…';
    try { const py = await getPython(); py.setStdout({batched: text => output.textContent = text}); py.setStderr({batched: text => { output.textContent += text; }}); await py.runPythonAsync(code); if (!output.textContent.trim() || output.textContent === 'Futtatás…') output.textContent = 'A program lefutott, de nem írt ki semmit.'; }
    catch (error) { output.className = 'python-output has-error'; output.textContent = error.message; }
  }
  function codeWithInput(code) {
    const lines = document.getElementById('program-input').value.split(/\r?\n/);
    return `import builtins\n_web_input = iter(${JSON.stringify(lines)})\nbuiltins.input = lambda: next(_web_input)\n` + code;
  }
  document.getElementById('run-python').addEventListener('click', () => run(codeWithInput(document.getElementById('python-editor').value)));
  document.getElementById('run-tests').addEventListener('click', () => run(codeWithInput(document.getElementById('python-editor').value) + `\n\n_tesztek = [([(3,5),(4,9),(5,8)],2), ([(1,3),(2,5),(4,7),(7,8)],3), ([(1,10),(2,3),(3,4),(4,5)],3)]\nfor _adat, _vart in _tesztek:\n    _kapott = legtobb_film(_adat.copy())\n    print(('✓' if _kapott == _vart else '✗') + f' várt: {_vart}, kapott: {_kapott}')`));
  document.getElementById('reset-code').addEventListener('click', () => document.getElementById('python-editor').value = startCode);
  document.getElementById('load-solution').addEventListener('click', () => document.getElementById('python-editor').value = solution);
  document.getElementById('clear-console').addEventListener('click', () => document.getElementById('python-output').textContent = 'A program kimenete itt jelenik meg.');
  document.querySelectorAll('.copy-code').forEach(button => button.addEventListener('click', async () => { const target = document.getElementById(button.dataset.copy); await navigator.clipboard.writeText(target.value || target.textContent); button.textContent = 'Kimásolva'; setTimeout(() => button.textContent = 'Kód másolása', 1300); }));
  updateProgress(); resetSimulation();
})();
