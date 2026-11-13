(function () {
  const storageKey='algoritmus-graf-progress';
  const steps=['celok','problema','kezi','algoritmus','programozas','futasido','ellenorzes','tovabblepes'];
  let completed=new Set(JSON.parse(localStorage.getItem(storageKey)||'[]'));
  function updateProgress(){const p=Math.round(completed.size/steps.length*100);document.getElementById('progress-bar').style.width=p+'%';document.getElementById('progress-label').textContent=p+'% kész';document.querySelectorAll('[data-complete]').forEach(b=>b.classList.toggle('done',completed.has(b.dataset.complete)));document.getElementById('completion-message').hidden=completed.size!==steps.length;}
  document.querySelectorAll('[data-complete]').forEach(b=>b.addEventListener('click',()=>{completed.add(b.dataset.complete);localStorage.setItem(storageKey,JSON.stringify([...completed]));updateProgress();}));
  document.getElementById('reset-progress').addEventListener('click',()=>{completed.clear();localStorage.removeItem(storageKey);updateProgress();});

  const explanations={manual:['Az 1-esből minden város elérhető','Az 1-esből a 2-es és 4-es közvetlenül, a 3-as pedig a 2-esen keresztül elérhető.'],counter:['4 és 2','A 4-es városból egyetlen járat sem indul, ezért onnan nem lehet eljutni a 2-esbe.'],q1:['Minden járatot ellenkező irányban','Az a → b járat a fordított gráfban b → a lesz.'],q2:['Az eredeti gráfban a 4-esből nem jutunk az 1-esbe','A fordított út 1 → 4 az eredeti 4 → 1 elérhetőségét vizsgálná.'],q3:['Mert a számozás 1-től indul, a 0. elemet nem használjuk','Így a város azonosítója közvetlenül használható listaindexként.'],q4:['O(n + m)','Mindkét bejárás legfeljebb minden várost és járatot feldolgoz.']};
  document.querySelectorAll('.check-answer').forEach(button=>button.addEventListener('click',()=>{const f=button.closest('fieldset'),s=f.querySelector('input:checked'),out=document.getElementById(button.dataset.target),key=f.dataset.question;if(!s){out.className='feedback incorrect';out.textContent='Előbb jelölj meg egy választ!';return;}const right=s.value===button.dataset.answer,chosen=s.parentElement.textContent.trim();out.className='feedback '+(right?'correct':'incorrect');out.textContent=right?'Helyes. '+explanations[key][1]:'A választott válasz: '+chosen+'\nA helyes válasz: '+explanations[key][0]+'\nMiért? '+explanations[key][1];}));
  const normalize=v=>v.trim().replace(/\s+/g,' ');
  document.querySelectorAll('.code-check:not(.code-task-check)').forEach(button=>button.addEventListener('click',()=>{const step=button.closest('.coding-step'),out=step.querySelector('.code-feedback'),wrong=[];step.querySelectorAll('.code-blank').forEach(blank=>{const right=normalize(blank.value)===normalize(blank.dataset.answer);blank.classList.toggle('correct',right);blank.classList.toggle('incorrect',!right);if(!right)wrong.push(blank.dataset.label+': a helyes válasz „'+blank.dataset.answer+'”.\nMiért? '+blank.dataset.explain);});out.className='code-feedback '+(wrong.length?'incorrect':'correct');out.textContent=wrong.length?wrong.join('\n\n'):'Minden kitöltés helyes.';}));

  function withoutComments(code){return code.replace(/#.*$/gm,'');}
  function sameIndent(code,firstPattern,secondPattern){
    const lines=code.split(/\r?\n/),first=lines.find(line=>firstPattern.test(line)),second=lines.find(line=>secondPattern.test(line));
    if(!first||!second)return false;
    return (first.match(/^\s*/)||[''])[0].length===(second.match(/^\s*/)||[''])[0].length;
  }
  const codeTaskRules={
    graphs:{
      success:'Rendben. A program m járatot olvas be, és mindegyiket az eredeti és a fordított gráfban is eltárolja.',
      rules:[
        {test:code=>/for\s+_\s+in\s+range\s*\(\s*m\s*\)\s*:/.test(code),message:'Még hiányzik az a ciklus, amely pontosan m járatot dolgoz fel.'},
        {test:code=>/indulas\s*,\s*erkezes\s*=\s*map\s*\(\s*int\s*,\s*input\s*\(\s*\)\s*\.split\s*\(\s*\)\s*\)/.test(code)||(/input\s*\(\s*\)\s*\.split\s*\(\s*\)/.test(code)&&/indulas\s*=/.test(code)&&/erkezes\s*=/.test(code)),message:'Olvasd be minden sorból az indulási és az érkezési várost.'},
        {test:code=>/graf\s*\[\s*indulas\s*\]\s*\.append\s*\(\s*erkezes\s*\)/.test(code),message:'Az eredeti gráfban az érkezést az indulási város listájához kell hozzáadni.'},
        {test:code=>/forditott_graf\s*\[\s*erkezes\s*\]\s*\.append\s*\(\s*indulas\s*\)/.test(code),message:'A fordított gráfban cseréld meg a járat irányát.'}
      ]
    },
    dfs:{
      success:'Rendben. A függvény veremmel bejárja az elérhető városokat, majd visszaadja a jelölőlistát.',
      rules:[
        {test:code=>/while\s+(?:len\s*\(\s*verem\s*\)\s*>\s*0|verem)\s*:/.test(code),message:'A bejárásnak addig kell ismétlődnie, amíg a verem nem üres.'},
        {test:code=>/varos\s*=\s*verem\s*\.pop\s*\(\s*\)/.test(code),message:'Vedd ki az aktuális várost a verem végéről a pop() segítségével.'},
        {test:code=>/if\s+not\s+meglatogatott\s*\[\s*varos\s*\]\s*:/.test(code),message:'Ellenőrizd, hogy az aktuális várost meglátogattuk-e már.'},
        {test:code=>/meglatogatott\s*\[\s*varos\s*\]\s*=\s*True/.test(code),message:'A feldolgozott várost jelöld meg True értékkel.'},
        {test:code=>/for\s+kovetkezo_varos\s+in\s+graf\s*\[\s*varos\s*\]\s*:/.test(code),message:'Járd végig az aktuális város szomszédait.'},
        {test:code=>/if\s+not\s+meglatogatott\s*\[\s*kovetkezo_varos\s*\]\s*:/.test(code),message:'Csak a még nem látogatott következő városokat tedd a verembe.'},
        {test:code=>/verem\s*\.append\s*\(\s*kovetkezo_varos\s*\)/.test(code),message:'A következő várost az append() segítségével tedd a verembe.'},
        {test:code=>/return\s+meglatogatott/.test(code),message:'A függvény végén add vissza a meglátogatott listát.'},
        {test:code=>sameIndent(code,/^\s*while\b/,/^\s*return\s+meglatogatott\b/),message:'A return a while ciklus után, a while sorával azonos behúzási szinten legyen.'}
      ]
    },
    original:{
      success:'Rendben. Megkeresed az első, 1-esből nem elérhető várost, és megfelelő sorrendben írod ki az ellenpéldát.',
      rules:[
        {test:code=>/melysegi_bejaras\s*\(\s*graf\s*,\s*1\s*\)/.test(code),message:'Az első bejárást az eredeti gráfon, az 1-es városból indítsd.'},
        {test:code=>/for\s+varos\s+in\s+range\s*\(\s*1\s*,\s*n\s*\+\s*1\s*\)\s*:/.test(code),message:'Vizsgáld végig az 1-től n-ig számozott városokat.'},
        {test:code=>/if\s+not\s+elerheto\s*\[\s*varos\s*\]\s*:/.test(code),message:'Azt keresd, melyik városnál hamis az elérhetőségi érték.'},
        {test:code=>/hibas_varos\s*=\s*varos/.test(code)&&/\bbreak\b/.test(code),message:'Jegyezd meg az első hibás várost, majd állítsd le a keresést.'},
        {test:code=>/if\s+hibas_varos\s*!=\s*0\s*:/.test(code),message:'A kiírás előtt ellenőrizd, hogy találtál-e hibás várost.'},
        {test:code=>/print\s*\(\s*["']NO["']\s*\)/.test(code),message:'Ellenpélda esetén először a NO választ írd ki.'},
        {test:code=>/print\s*\(\s*1\s*,\s*hibas_varos\s*\)/.test(code),message:'Az első ellenpélda sorrendje: 1, hibas_varos.'}
      ]
    },
    reversed:{
      success:'Rendben. Önállóan alkalmaztad az előző ellenőrzést a fordított gráfra, és a végső választ is helyesen adod meg.',
      rules:[
        {test:code=>/melysegi_bejaras\s*\(\s*forditott_graf\s*,\s*1\s*\)/.test(code),message:'Járd be a fordított gráfot az 1-es városból.'},
        {test:code=>/for\s+varos\s+in\s+range\s*\(\s*1\s*,\s*n\s*\+\s*1\s*\)\s*:/.test(code),message:'Itt is vizsgáld végig az 1-től n-ig számozott városokat.'},
        {test:code=>/if\s+not\s+visszafele_elerheto\s*\[\s*varos\s*\]\s*:/.test(code),message:'Keresd meg az első várost, amelyet a fordított bejárás nem ért el.'},
        {test:code=>/hibas_varos\s*=\s*varos/.test(code)&&/\bbreak\b/.test(code),message:'Jegyezd meg az első hibás várost, majd állítsd le a keresést.'},
        {test:code=>/if\s+hibas_varos\s*!=\s*0\s*:/.test(code),message:'A kiírás előtt ellenőrizd, hogy a második bejárás talált-e hibás várost.'},
        {test:code=>/print\s*\(\s*["']NO["']\s*\)/.test(code),message:'Ha találtál ellenpéldát, írd ki a NO választ.'},
        {test:code=>/print\s*\(\s*hibas_varos\s*,\s*1\s*\)/.test(code),message:'A második ellenpélda sorrendje: hibas_varos, 1.'},
        {test:code=>(code.match(/else\s*:/g)||[]).length>=2&&/print\s*\(\s*["']YES["']\s*\)/.test(code),message:'Ha a második bejárás sem talált hibát, írd ki a YES választ.'}
      ]
    }
  };
  document.querySelectorAll('.code-task-check').forEach(button=>button.addEventListener('click',()=>{
    const task=button.dataset.task,editor=document.querySelector('[data-code-task="'+task+'"]'),out=document.getElementById(task+'-feedback'),definition=codeTaskRules[task],code=withoutComments(editor.value),missing=definition.rules.filter(rule=>!rule.test(code));
    editor.classList.toggle('correct',missing.length===0);editor.classList.toggle('incorrect',missing.length>0);
    out.className='code-feedback '+(missing.length?'incorrect':'correct');
    out.textContent=missing.length?'Még ezeket nézd át:\n\n'+missing.map(item=>'• '+item.message).join('\n'):definition.success;
  }));

  const algorithmSection=document.getElementById('algoritmus');
  const traversalSimulator=algorithmSection.querySelector('.graph-simulator');
  traversalSimulator.insertAdjacentHTML('beforebegin',`<div class="graph-build-intro"><h2>Először építsük fel a két gráfot!</h2><p>Minden beolvasott járat két helyre kerül. Az eredeti gráfban megtartjuk az irányát, a fordított gráfban pedig felcseréljük az indulási és az érkezési várost.</p></div><div class="graph-builder"><div class="builder-heading"><div><span>Aktuális bemeneti sor</span><strong id="build-current">Még egyik járatot sem olvastuk be.</strong></div><div><span>Feldolgozva</span><strong id="build-count">0 / 5</strong></div></div><div class="builder-lists"><div><h3>Eredeti gráf</h3><p id="build-original"></p></div><div><h3>Fordított gráf</h3><p id="build-reversed"></p></div></div><p class="builder-code" id="build-code">A két gráf minden városhoz egyelőre üres listát tartalmaz.</p><p id="build-explanation">Kattints a „Következő járat” gombra!</p><div class="sim-actions"><button class="button primary" id="build-next" type="button">Következő járat</button><button class="button secondary" id="build-complete" type="button">Mutasd a kész gráfokat</button><button class="button secondary" id="build-reset" type="button">Újrakezdés</button></div></div><h3 class="traversal-title">Ezután járjuk be a gráfokat!</h3>`);
  document.querySelector('.graph-build-intro').insertAdjacentHTML('beforeend',`<div class="builder-input"><strong>Kapott bemenet</strong><div><span class="input-count">4 5</span><span id="build-input-0">1 2</span><span id="build-input-1">2 3</span><span id="build-input-2">3 1</span><span id="build-input-3">1 4</span><span id="build-input-4">3 4</span></div><p>Az első sor szerint 4 város és 5 járat van. A további sorok az irányított járatokat adják meg.</p></div>`);
  document.getElementById('route-map').insertAdjacentHTML('beforebegin',`<div class="active-graph-view"><span>Most ezt járjuk be</span><strong id="active-graph-title">Eredeti gráf</strong><pre id="active-graph-list"></pre></div>`);
  const inputEdges=[[1,2],[2,3],[3,1],[1,4],[3,4]];
  let buildIndex=0,buildOriginal,buildReversed;
  function emptyGraph(){return {1:[],2:[],3:[],4:[]};}
  function listText(g,name){return [1,2,3,4].map(city=>name+'['+city+'] = ['+g[city].join(', ')+']').join('\n');}
  function renderBuild(){document.getElementById('build-original').textContent=listText(buildOriginal,'graf');document.getElementById('build-reversed').textContent=listText(buildReversed,'forditott_graf');document.getElementById('build-count').textContent=buildIndex+' / '+inputEdges.length;}
  function resetBuild(){buildIndex=0;buildOriginal=emptyGraph();buildReversed=emptyGraph();document.getElementById('build-current').textContent='Még egyik járatot sem olvastuk be.';document.getElementById('build-code').textContent='A két gráf minden városhoz egyelőre üres listát tartalmaz.';document.getElementById('build-explanation').textContent='Kattints a „Következő járat” gombra!';document.querySelectorAll('.builder-input span:not(.input-count)').forEach(row=>row.classList.remove('input-active','input-done'));renderBuild();}
  function addNextEdge(){if(buildIndex>=inputEdges.length){document.getElementById('build-explanation').textContent='Mind az öt járatot feldolgoztuk. A két gráf elkészült.';return;}document.querySelectorAll('.builder-input span:not(.input-count)').forEach(row=>row.classList.remove('input-active'));const row=document.getElementById('build-input-'+buildIndex);row.classList.add('input-active');const [from,to]=inputEdges[buildIndex];buildOriginal[from].push(to);buildReversed[to].push(from);buildIndex++;document.getElementById('build-current').textContent=from+' '+to+'  vagyis  '+from+' → '+to;document.getElementById('build-code').textContent='graf['+from+'].append('+to+')\nforditott_graf['+to+'].append('+from+')';document.getElementById('build-explanation').textContent='Az eredeti gráfban a '+to+'-es várost a graf['+from+'] listához adjuk. A fordított gráfban megcseréljük az irányt, ezért a '+from+'-es város a forditott_graf['+to+'] listába kerül.';document.querySelectorAll('.builder-input span:not(.input-count)').forEach((item,index)=>item.classList.toggle('input-done',index<buildIndex-1));renderBuild();}
  document.getElementById('build-next').addEventListener('click',addNextEdge);document.getElementById('build-reset').addEventListener('click',resetBuild);document.getElementById('build-complete').addEventListener('click',()=>{resetBuild();while(buildIndex<inputEdges.length)addNextEdge();document.getElementById('build-current').textContent='Az összes járatot feldolgoztuk.';document.getElementById('build-code').textContent='Az eredeti és a fordított gráf elkészült.';document.getElementById('build-explanation').textContent='Most már mindkét szomszédsági listán látszik az összes járat.';});

  const original={1:[2,4],2:[3],3:[1,4],4:[]},reversed={1:[3],2:[1],3:[2],4:[1,3]};let mode='original',stack=[],visited=[];
  function graph(){return mode==='original'?original:reversed;}
  function drawEdges(){const current=graph();document.getElementById('edge-list').textContent=Object.entries(current).flatMap(([a,bs])=>bs.map(b=>a+' → '+b)).join('   ·   ');document.getElementById('active-graph-title').textContent=mode==='original'?'Eredeti gráf':'Fordított gráf';document.getElementById('active-graph-list').textContent=listText(current,mode==='original'?'graf':'forditott_graf');}
  function resetGraph(){stack=[1];visited=[];document.querySelectorAll('#route-map .city-node').forEach(n=>n.classList.remove('visited','current'));document.getElementById('current-city').textContent='–';document.getElementById('stack-state').textContent='[1]';document.getElementById('graph-explanation').textContent=(mode==='original'?'Az eredeti':'A fordított')+' gráfban az 1-es városból indulunk.';drawEdges();}
  function setMode(next){mode=next;document.querySelectorAll('.graph-mode').forEach(b=>{const active=b.id===(mode==='original'?'show-original':'show-reversed');b.classList.toggle('sort-active',active);b.setAttribute('aria-pressed',String(active));});resetGraph();}
  document.getElementById('show-original').addEventListener('click',()=>setMode('original'));document.getElementById('show-reversed').addEventListener('click',()=>setMode('reversed'));document.getElementById('graph-reset').addEventListener('click',resetGraph);
  document.getElementById('graph-next').addEventListener('click',()=>{if(!stack.length){document.getElementById('graph-explanation').textContent='A bejárás véget ért. Elért városok: '+visited.join(', ')+'.';return;}const city=stack.pop();document.querySelectorAll('#route-map .city-node').forEach(n=>n.classList.remove('current'));const node=document.querySelector('#route-map [data-city="'+city+'"]');node.classList.add('current');if(!visited.includes(city)){visited.push(city);node.classList.add('visited');const added=[];graph()[city].forEach(next=>{if(!visited.includes(next)){stack.push(next);added.push(next);}});document.getElementById('graph-explanation').textContent=city+'. várost megjelöljük.'+(added.length?' Verembe kerül: '+added.join(', ')+'.':' Nincs új város, amit a verembe tehetnénk.');}else document.getElementById('graph-explanation').textContent=city+'. várost már korábban meglátogattuk.';document.getElementById('current-city').textContent=city;document.getElementById('stack-state').textContent='['+stack.join(', ')+']';});

  const solution=`def melysegi_bejaras(graf, kezdo_varos):
    meglatogatott = [False] * len(graf)
    verem = [kezdo_varos]

    while len(verem) > 0:
        varos = verem.pop()

        if not meglatogatott[varos]:
            meglatogatott[varos] = True

            for kovetkezo_varos in graf[varos]:
                if not meglatogatott[kovetkezo_varos]:
                    verem.append(kovetkezo_varos)

    return meglatogatott


n, m = map(int, input().split())

graf = []
forditott_graf = []

for _ in range(n + 1):
    graf.append([])
    forditott_graf.append([])

for _ in range(m):
    indulas, erkezes = map(int, input().split())

    graf[indulas].append(erkezes)
    forditott_graf[erkezes].append(indulas)


elerheto = melysegi_bejaras(graf, 1)
hibas_varos = 0

for varos in range(1, n + 1):
    if not elerheto[varos]:
        hibas_varos = varos
        break

if hibas_varos != 0:
    print("NO")
    print(1, hibas_varos)
else:
    visszafele_elerheto = melysegi_bejaras(forditott_graf, 1)

    for varos in range(1, n + 1):
        if not visszafele_elerheto[varos]:
            hibas_varos = varos
            break

    if hibas_varos != 0:
        print("NO")
        print(hibas_varos, 1)
    else:
        print("YES")`;
  const editor=document.getElementById('python-editor'),startCode=editor.value,loadSolutionButton=document.getElementById('load-solution');document.getElementById('full-solution').textContent=solution;let pyodidePromise;
  document.querySelectorAll('.code-task-editor, #python-editor').forEach(area=>area.addEventListener('keydown',event=>{if(event.key!=='Tab')return;event.preventDefault();const start=area.selectionStart,end=area.selectionEnd;area.setRangeText('    ',start,end,'end');}));
  async function getPython(){const status=document.getElementById('runtime-status');if(!pyodidePromise){status.textContent='Python betöltése…';status.className='runtime-status loading';pyodidePromise=loadPyodide().then(py=>{status.textContent='Python használatra kész';status.className='runtime-status ready';return py;});}return pyodidePromise;}
  function wrapped(code,input){return `import builtins, io, contextlib\n_web_input=iter(${JSON.stringify(input.split(/\r?\n/))})\nbuiltins.input=lambda: next(_web_input)\n_web_output=io.StringIO()\nwith contextlib.redirect_stdout(_web_output):\n    exec(${JSON.stringify(code)})\nprint(_web_output.getvalue(),end='')`;}
  async function capture(py,code,input){let text='';py.setStdout({batched:t=>text+=t});py.setStderr({batched:t=>text+=t});await py.runPythonAsync(wrapped(code,input));return text.trim();}
  document.getElementById('run-python').addEventListener('click',async()=>{const out=document.getElementById('python-output');out.className='python-output';out.textContent='Futtatás…';try{const py=await getPython(),text=await capture(py,editor.value,document.getElementById('program-input').value);out.textContent=text||'A program lefutott, de nem írt ki semmit.';}catch(e){out.className='python-output has-error';out.textContent=e.message;}});
  document.getElementById('run-tests').addEventListener('click',async()=>{const out=document.getElementById('python-output');out.className='python-output';out.textContent='Tesztek futtatása…';const tests=[['4 5\n1 2\n2 3\n3 1\n1 4\n3 4',/^NO\s+4\s+1$/m,'nem összefüggő példa'],['3 3\n1 2\n2 3\n3 1',/^YES$/m,'körben elérhető városok'],['3 2\n1 2\n2 3',/^NO\s+2\s+1$/m,'nincs visszaút'],['3 2\n2 1\n3 2',/^NO\s+1\s+2$/m,'az 1-esből nem érhető el minden város']];try{const py=await getPython(),results=[];let allPassed=true;for(const [input,expected,name] of tests){const text=await capture(py,editor.value,input),passed=expected.test(text);allPassed=allPassed&&passed;results.push((passed?'✓ ':'✗ ')+name+' – kapott: '+(text.replace(/\n/g,' ')||'nincs kimenet'));}out.className='python-output '+(allPassed?'tests-ok':'has-error');out.textContent=results.join('\n');}catch(e){out.className='python-output has-error';out.textContent=e.message;}});
  document.getElementById('reset-code').addEventListener('click',()=>editor.value=startCode);loadSolutionButton.addEventListener('click',()=>editor.value=solution);document.getElementById('clear-console').addEventListener('click',()=>document.getElementById('python-output').textContent='A program kimenete itt jelenik meg.');document.querySelectorAll('.copy-code').forEach(b=>b.addEventListener('click',async()=>{await navigator.clipboard.writeText(document.getElementById(b.dataset.copy).textContent);b.textContent='Kimásolva';setTimeout(()=>b.textContent='Kód másolása',1300);}));
  updateProgress();resetBuild();resetGraph();
})();
