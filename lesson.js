(function () {
  const storageKey = 'algoritmus-madar-progress';
  const steps = ['celok', 'problema', 'kezi', 'algoritmus', 'programozas', 'futasido', 'ellenorzes', 'tovabblepes'];
  let completed = new Set(JSON.parse(localStorage.getItem(storageKey) || '[]'));

  function saveProgress() {
    localStorage.setItem(storageKey, JSON.stringify([...completed]));
    updateProgress();
  }

  function updateProgress() {
    const percent = Math.round((completed.size / steps.length) * 100);
    document.getElementById('progress-bar').style.width = percent + '%';
    document.getElementById('progress-label').textContent = percent + '% kész';
    document.querySelectorAll('[data-complete]').forEach(button => {
      const isDone = completed.has(button.dataset.complete);
      button.classList.toggle('done', isDone);
      if (isDone) button.textContent = 'Teljesítve';
    });
    document.getElementById('completion-message').hidden = completed.size !== steps.length;
  }

  document.querySelectorAll('[data-complete]').forEach(button => {
    button.addEventListener('click', () => {
      completed.add(button.dataset.complete);
      saveProgress();
    });
  });

  document.getElementById('reset-progress').addEventListener('click', () => {
    completed.clear();
    localStorage.removeItem(storageKey);
    document.querySelectorAll('[data-complete]').forEach(button => {
      const labels = {
        celok: 'Elolvastam, kezdhetjük', problema: 'Értem a feladatot', kezi: 'A kézi példát feldolgoztam',
        algoritmus: 'Megértettem az algoritmust', programozas: 'Elkészítettem vagy átnéztem a programot',
        futasido: 'Megértettem a futási időt', ellenorzes: 'Befejeztem az önellenőrzést', tovabblepes: 'Befejeztem a feladatot'
      };
      button.textContent = labels[button.dataset.complete];
    });
    updateProgress();
  });

  document.querySelectorAll('.check-answer').forEach(button => {
    button.addEventListener('click', () => {
      const fieldset = button.closest('fieldset');
      const selected = fieldset.querySelector('input:checked');
      const feedback = document.getElementById(button.dataset.target);
      const explanations = {
        manual: {
          correct: 'A 4-es faj',
          why: 'A 4-es háromszor szerepel. Az 1-es, a 3-as és az 5-ös csak egyszer, a 2-es pedig egyszer sem.'
        },
        tie: {
          correct: '1, mert holtversenynél a kisebb azonosító nyer',
          why: 'Az 1-es és a 2-es faj is kétszer szerepel. Mivel azonos a gyakoriságuk, a kisebb azonosítót, vagyis az 1-est választjuk.'
        },
        q1: {
          correct: 'A 4-es faj megfigyeléseinek számát',
          why: 'A lista indexe a faj azonosítója. Ezért a gyakorisag[4] azt mutatja meg, hányszor szerepel a 4-es faj.'
        },
        q2: {
          correct: 'Hogy az 1–5 azonosító közvetlenül index legyen, a 0. elemet pedig ne használjuk',
          why: 'A faj számát rögtön indexként használjuk. Így például a 3-as faj darabszáma a gyakorisag[3] helyen található.'
        },
        q3: {
          correct: 'Így holtversenynél megmarad a kisebb azonosító',
          why: 'Az eredményt csak nagyobb gyakoriságnál cseréljük le. Egyenlőség esetén a korábban megtalált, kisebb azonosító marad.'
        },
        q4: {
          correct: 'O(n)',
          why: 'A program egyszer végighalad mind az n megfigyelésen. A többi lépés száma nem függ a megfigyelések számától.'
        }
      };
      const explanation = explanations[fieldset.dataset.question || fieldset.dataset.finalQuestion];
      if (!selected) {
        feedback.textContent = 'Először válassz egy lehetőséget!';
        feedback.className = 'feedback incorrect';
        return;
      }
      const correct = selected.value === button.dataset.answer;
      feedback.className = 'feedback ' + (correct ? 'correct' : 'incorrect');
      if (correct) {
        feedback.textContent = 'Helyes válasz.\nMiért? ' + explanation.why;
      } else {
        feedback.textContent = 'Ez most nem jó.\nA te válaszod: ' + selected.parentElement.textContent.trim() +
          '\nHelyes válasz: ' + explanation.correct +
          '\nMiért? ' + explanation.why;
      }
    });
  });

  const birds = [1, 4, 4, 4, 5, 3];
  let simIndex = 0;
  let counts = [0, 0, 0, 0, 0, 0];
  const nextButton = document.getElementById('sim-next');
  const observationItems = document.querySelectorAll('#observation-strip span');

  function renderSimulator(activeBird) {
    document.getElementById('sim-step').textContent = simIndex;
    document.getElementById('current-bird').textContent = activeBird || '–';
    for (let i = 1; i <= 5; i++) {
      const cell = document.getElementById('count-' + i);
      cell.textContent = counts[i];
      cell.classList.toggle('active', i === activeBird);
    }
    observationItems.forEach((item, index) => {
      item.classList.toggle('processed', index < simIndex - 1);
      item.classList.toggle('current', index === simIndex - 1);
    });
  }

  nextButton.addEventListener('click', () => {
    if (simIndex >= birds.length) return;
    const bird = birds[simIndex];
    counts[bird]++;
    simIndex++;
    renderSimulator(bird);
    document.getElementById('sim-explanation').textContent =
      'A ' + bird + '-es faj számlálóját eggyel növeltük: most ' + counts[bird] + '.';
    if (simIndex === birds.length) {
      nextButton.disabled = true;
      nextButton.textContent = 'Feldolgozás kész';
      document.getElementById('sim-explanation').textContent = 'Kész! A 4-es faj számlálója a legnagyobb, ezért az eredmény 4.';
    }
  });

  document.getElementById('sim-reset').addEventListener('click', () => {
    simIndex = 0; counts = [0, 0, 0, 0, 0, 0];
    nextButton.disabled = false; nextButton.textContent = 'Következő megfigyelés';
    document.getElementById('sim-explanation').textContent = 'Kattints a „Következő megfigyelés” gombra!';
    renderSimulator(null);
  });

  document.querySelectorAll('.copy-code').forEach(button => {
    button.addEventListener('click', async () => {
      const source = document.getElementById(button.dataset.copy);
      const code = source.tagName === 'TEXTAREA' ? source.value : source.textContent;
      try {
        await navigator.clipboard.writeText(code);
        const original = button.textContent;
        button.textContent = 'Másolva ✓';
        setTimeout(() => button.textContent = original, 1600);
      } catch (_) {
        button.textContent = 'Jelöld ki kézzel';
      }
    });
  });

  /* Böngészőben futó Python-labor (Pyodide) */
  const editor = document.getElementById('python-editor');
  const output = document.getElementById('python-output');
  const runtimeStatus = document.getElementById('runtime-status');
  const runButton = document.getElementById('run-python');
  const testButton = document.getElementById('run-tests');
  const initialCode = editor ? editor.value : '';
  let pyodideInstance = null;
  let pyodideLoading = null;

  function setLabBusy(busy) {
    [runButton, testButton, document.getElementById('reset-code'), document.getElementById('load-solution')]
      .filter(Boolean).forEach(button => button.disabled = busy);
  }

  async function getPyodideRuntime() {
    if (pyodideInstance) return pyodideInstance;
    if (pyodideLoading) return pyodideLoading;
    runtimeStatus.textContent = 'Python betöltése…';
    runtimeStatus.className = 'runtime-status loading';
    setLabBusy(true);
    pyodideLoading = (async () => {
      if (typeof loadPyodide !== 'function') throw new Error('A Python-környezet nem tölthető be. Ellenőrizd az internetkapcsolatot!');
      const runtime = await loadPyodide({ indexURL: 'https://cdn.jsdelivr.net/pyodide/v314.0.7/full/' });
      runtimeStatus.textContent = 'Python használatra kész';
      runtimeStatus.className = 'runtime-status ready';
      pyodideInstance = runtime;
      return runtime;
    })();
    try {
      return await pyodideLoading;
    } catch (error) {
      pyodideLoading = null;
      runtimeStatus.textContent = 'Betöltési hiba';
      runtimeStatus.className = 'runtime-status error';
      throw error;
    } finally {
      setLabBusy(false);
    }
  }

  async function executePython(code, isTest) {
    output.textContent = 'A Python-környezet előkészítése…';
    output.className = 'python-output';
    setLabBusy(true);
    try {
      const runtime = await getPyodideRuntime();
      let stdout = '';
      let stderr = '';
      runtime.setStdout({ batched: text => { stdout += text + '\n'; } });
      runtime.setStderr({ batched: text => { stderr += text + '\n'; } });
      await runtime.runPythonAsync(code);
      output.textContent = (stdout || 'A program lefutott, de nem írt ki eredményt.').trim();
      if (stderr) {
        output.textContent += '\n' + stderr.trim();
        output.classList.add('has-error');
      }
      if (isTest && !output.textContent.includes('HIBÁS') && !output.textContent.includes('HIBA')) {
        output.classList.add('tests-ok');
      }
    } catch (error) {
      output.textContent = 'Hiba a program futtatásakor:\n' + error.message;
      output.className = 'python-output has-error';
    } finally {
      setLabBusy(false);
    }
  }

  if (runButton) {
    runButton.addEventListener('click', () => executePython(editor.value, false));
    testButton.addEventListener('click', () => {
      const tests = `\n\nprint("--- Automatikus tesztek ---")\ntesztek = [\n    ([1, 4, 4, 4, 5, 3], 4),\n    ([1, 1, 2, 2, 3], 1),\n    ([5, 5, 5, 2, 2], 5),\n]\nfor sorszam, (adat, vart) in enumerate(tesztek, 1):\n    try:\n        kapott = leggyakoribb_madar(adat)\n        allapot = "HELYES" if kapott == vart else "HIBÁS"\n        print(f"{sorszam}. teszt: {allapot} | várt: {vart}, kapott: {kapott}")\n    except Exception as hiba:\n        print(f"{sorszam}. teszt: HIBA | {hiba}")`;
      executePython(editor.value + tests, true);
    });
    document.getElementById('reset-code').addEventListener('click', () => {
      editor.value = initialCode;
      output.textContent = 'A kezdőkódot visszaállítottuk.';
      output.className = 'python-output';
    });
    document.getElementById('load-solution').addEventListener('click', () => {
      editor.value = document.getElementById('solution-code').textContent;
      output.textContent = 'Betöltöttük a mintamegoldást. Most futtasd le vagy indítsd el a teszteket!';
      output.className = 'python-output';
      editor.focus();
    });
    document.getElementById('clear-console').addEventListener('click', () => {
      output.textContent = 'A konzol törölve.';
      output.className = 'python-output';
    });
    editor.addEventListener('keydown', event => {
      if (event.key === 'Tab') {
        event.preventDefault();
        const start = editor.selectionStart;
        editor.value = editor.value.slice(0, start) + '    ' + editor.value.slice(editor.selectionEnd);
        editor.selectionStart = editor.selectionEnd = start + 4;
      }
      if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        event.preventDefault();
        runButton.click();
      }
    });
  }

  updateProgress();
  renderSimulator(null);
})();
