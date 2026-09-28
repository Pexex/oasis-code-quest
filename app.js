
(function(){
  var STORAGE_KEY='oasis-code-quest-fdd-v1';
  var missions=window.OASIS_MISSIONS;
  var buildWorkerSource=window.OASIS_buildWorkerSource;

  function freshState(){
    return {
      current:0,
      done:[false,false,false],
      open:[true,false,false],
      code:missions.map(function(m){return m.starter;}),
      approved:[null,null,null],
      attempts:[0,0,0],
      hints:[0,0,0],
      results:[null,null,null],
      started:Date.now(),
      finished:null,
      name:'',
      className:''
    };
  }

  var state=freshState();
  function $(selector){return document.querySelector(selector);}
  var E={
    progress:$('#progressText'),bar:$('#progressBar'),name:$('#studentName'),className:$('#studentClass'),nav:$('#missionNav'),
    key:$('#missionKey'),title:$('#missionTitle'),status:$('#missionStatus'),story:$('#missionStory'),task:$('#missionTask'),
    signature:$('#missionSignature'),input:$('#missionInput'),ret:$('#missionReturn'),dictionary:$('#dataDictionary'),rules:$('#missionRules'),
    example:$('#missionExample'),checklist:$('#comprehensionChecklist'),dom:$('#domBridge'),editor:$('#codeEditor'),run:$('#runTestsButton'),
    hint:$('#hintButton'),reset:$('#resetCodeButton'),score:$('#testScore'),message:$('#testMessage'),tests:$('#testResults'),hintPanel:$('#hintPanel'),
    hintCounter:$('#hintCounter'),hintText:$('#hintText'),hintExhausted:$('#hintExhausted'),stats:$('#missionStats'),reportInfo:$('#reportInfo'),reportStats:$('#reportStats'),
    pdf:$('#pdfButton'),finish:$('#finishPanel'),restart:$('#restartButton')
  };

  function esc(value){
    return String(value).replace(/[&<>"']/g,function(c){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
    });
  }

  function save(){
    state.name=E.name.value;
    state.className=E.className.value;
    localStorage.setItem(STORAGE_KEY,JSON.stringify(state));
  }

  function load(){
    try{
      var saved=JSON.parse(localStorage.getItem(STORAGE_KEY));
      if(saved&&Array.isArray(saved.code)&&saved.code.length===3){
        state=Object.assign(freshState(),saved);
      }
    }catch(_){
      state=freshState();
    }
  }

  function totals(){
    return {
      attempts:state.attempts.reduce(function(a,b){return a+b;},0),
      hints:state.hints.reduce(function(a,b){return a+b;},0)
    };
  }

  function renderNav(){
    E.nav.innerHTML=missions.map(function(m,i){
      var classes='mission-button'+(i===state.current?' active':'');
      var disabled=state.open[i]?'':' disabled';
      var status=state.done[i]?'Concluída':(state.open[i]?'Disponível':'Bloqueada');
      return '<button type="button" class="'+classes+'" data-index="'+i+'"'+disabled+'>'+
        '<small>CHAVE 0'+(i+1)+'</small><strong>'+m.key+'</strong><span class="mission-state">'+status+'</span></button>';
    }).join('');

    Array.prototype.forEach.call(E.nav.querySelectorAll('button'),function(button){
      button.addEventListener('click',function(){
        var index=Number(button.getAttribute('data-index'));
        if(!state.open[index])return;
        state.code[state.current]=E.editor.value;
        state.current=index;
        save();
        render();
      });
    });
  }

  function renderDictionary(items){
    E.dictionary.innerHTML=items.map(function(item){
      return '<div class="dictionary-row"><code>'+esc(item[0])+'</code><span class="dictionary-type">'+esc(item[1])+
        '</span><span class="dictionary-description">'+esc(item[2])+'</span></div>';
    }).join('');
  }

  function renderChecklist(items){
    E.checklist.innerHTML=items.map(function(item){
      return '<label class="check-item"><input type="checkbox"><span>'+esc(item)+'</span></label>';
    }).join('');
  }

  function updatePdfButton(){
    var ready=!!(window.jspdf&&window.jspdf.jsPDF);
    var all=state.done.every(Boolean);
    var named=E.name.value.trim().length>1;
    E.pdf.disabled=!(ready&&all&&named);
    E.pdf.textContent=!ready?'PDF indisponível':(!all?'Conclua as 3 chaves':(!named?'Informe seu nome':'Exportar PDF de conclusão'));
  }

  function updateStats(){
    var completed=state.done.filter(Boolean).length;
    var all=state.done.every(Boolean);
    var total=totals();
    var minutes=Math.max(1,Math.round(((state.finished||Date.now())-state.started)/60000));

    E.progress.textContent=completed+' / 3 chaves';
    E.bar.style.width=((completed/3)*100)+'%';

    var currentItems=[
      ['Tentativas',state.attempts[state.current]],
      ['Pistas',state.hints[state.current]],
      ['Status',state.done[state.current]?'Aprovado':'Em curso']
    ];
    E.stats.innerHTML=currentItems.map(function(item){
      return '<div class="stat-card"><div class="micro-label">'+item[0]+'</div><b>'+item[1]+'</b></div>';
    }).join('');

    var reportItems=[
      ['Chaves',completed+'/3'],
      ['Tentativas',total.attempts],
      ['Pistas utilizadas',total.hints],
      ['Tempo',minutes+' min']
    ];
    E.reportStats.innerHTML=reportItems.map(function(item){
      return '<div class="stat-card"><div class="micro-label">'+item[0]+'</div><b>'+item[1]+'</b></div>';
    }).join('');

    E.reportInfo.textContent=all
      ?'Atividade concluída. Informe seu nome para exportar o certificado e o relatório com os códigos aprovados.'
      :'Conquiste as três chaves para liberar o documento.';
    E.finish.classList.toggle('visible',all);
    updatePdfButton();
  }

  function setScoreState(kind,text){
    E.score.className='status-pill';
    if(kind)E.score.classList.add('status-'+kind);
    E.score.textContent=text;
  }

  function renderHints(m,exhausted){
    var count=state.hints[state.current];
    E.hintCounter.textContent=count+'/'+m.hints.length;
    E.hintText.innerHTML=m.hints.slice(0,count).map(function(hint,index){
      return '<div class="hint-item"><div class="hint-index">PISTA '+(index+1)+'</div><p>'+esc(hint)+'</p></div>';
    }).join('');

    E.hintPanel.classList.toggle('exhausted',!!exhausted);
    E.hintExhausted.classList.toggle('visible',!!exhausted);
    E.hintExhausted.innerHTML=exhausted
      ? '<strong>Você já consultou todas as pistas desta missão.</strong><span>Agora use os resultados dos testes e as regras do sistema para revisar sua solução.</span>'
      : '';

    E.hint.textContent=count>=m.hints.length
      ? 'Consultar pistas (todas exibidas)'
      : 'Solicitar pista';
  }

  function render(){
    var m=missions[state.current];
    renderNav();

    E.key.textContent='Chave de '+m.key;
    E.title.textContent=m.title;
    E.status.textContent=state.done[state.current]?'CONCLUÍDA':'EM ANDAMENTO';
    E.story.textContent=m.story;
    E.task.textContent=m.task;
    E.signature.textContent=m.signature;
    E.input.textContent=m.input;
    E.ret.innerHTML=m.ret;
    renderDictionary(m.dict);

    E.rules.innerHTML=m.rules.map(function(rule){
      return '<li><span class="rule-dot" aria-hidden="true">•</span><span>'+esc(rule)+'</span></li>';
    }).join('');

    E.example.textContent=m.example;
    renderChecklist(m.checklist);
    E.dom.textContent=m.dom;
    E.editor.value=state.code[state.current];
    E.tests.innerHTML='';
    setScoreState(state.done[state.current]?'success':'',''+(state.done[state.current]?'CHAVE CONQUISTADA':'Aguardando execução'));
    E.message.textContent=state.done[state.current]
      ?'Esta missão possui um código aprovado. Você pode revisá-lo e executar uma nova validação.'
      :'Leia o contrato e as regras. Desenvolva sua solução e execute os testes quando estiver pronto.';

    E.hintPanel.classList.toggle('visible',state.hints[state.current]>0);
    E.hintExhausted.classList.remove('visible');
    E.hintExhausted.innerHTML='';
    E.hintPanel.classList.remove('exhausted');
    if(state.hints[state.current]>0){
      renderHints(m,false);
    }else{
      E.hintCounter.textContent='0/'+m.hints.length;
      E.hintText.innerHTML='';
      E.hint.textContent='Solicitar pista';
    }

    updateStats();
  }

  function runTests(){
    state.code[state.current]=E.editor.value;
    state.attempts[state.current]+=1;
    save();
    updateStats();

    E.run.disabled=true;
    E.tests.innerHTML='<div class="test-running"><span class="test-spinner" aria-hidden="true"></span><span>Executando critérios de validação…</span></div>';
    setScoreState('working','VALIDANDO');
    E.message.textContent='O sistema está avaliando sua função em diferentes cenários, limites e regras de qualidade.';

    if(!window.Worker||!window.Blob||!window.URL){
      E.run.disabled=false;
      setScoreState('danger','INDISPONÍVEL');
      E.tests.innerHTML='';
      E.message.textContent='Este navegador não oferece o executor necessário.';
      return;
    }

    var url=URL.createObjectURL(new Blob([buildWorkerSource(state.current,E.editor.value)],{type:'text/javascript'}));
    var worker=new Worker(url);
    var closed=false;

    function closeWorker(){
      if(closed)return;
      closed=true;
      worker.terminate();
      URL.revokeObjectURL(url);
      E.run.disabled=false;
    }

    var timer=setTimeout(function(){
      closeWorker();
      setScoreState('danger','TEMPO ESGOTADO');
      E.tests.innerHTML='<div class="test-summary partial"><div class="test-summary-icon">!</div><div><strong>O código não terminou a execução.</strong><span>Revise laços e condições que possam impedir o encerramento da função.</span></div></div>';
      E.message.textContent='A validação foi interrompida para proteger a página.';
    },1800);

    worker.addEventListener('message',function(event){
      clearTimeout(timer);
      closeWorker();

      if(event.data.error){
        setScoreState('danger','ERRO');
        E.tests.innerHTML='<div class="test-summary partial"><div class="test-summary-icon">!</div><div><strong>Não foi possível executar sua solução.</strong><span>'+esc(event.data.error)+'</span></div></div>';
        E.message.textContent='Corrija o problema indicado e execute os testes novamente.';
        return;
      }

      var results=event.data.tests||[];
      var passed=results.filter(function(test){return test.ok;}).length;
      state.results[state.current]=results;

      var allPassed=passed===results.length&&results.length>0;
      var summaryHtml='<div class="test-summary '+(allPassed?'pass':'partial')+'">'+
        '<div class="test-summary-icon">'+(allPassed?'✓':'!')+'</div>'+
        '<div><strong>'+(allPassed?'Todos os testes passaram.':'Sua solução ainda precisa de ajustes.')+'</strong>'+
        '<span>'+passed+' de '+results.length+' critérios de validação atendidos.</span></div></div>';

      E.tests.innerHTML=summaryHtml+results.map(function(test,index){
        return '<div class="test-result '+(test.ok?'pass':'fail')+'">'+
          '<span class="test-icon" aria-hidden="true">'+(test.ok?'✓':'!')+'</span>'+
          '<div class="test-copy"><div class="test-label">'+(test.ok?'APROVADO':'REVISAR')+'</div>'+
          '<div class="test-name">'+esc(test.name)+'</div>'+
          (!test.ok&&test.feedback?'<div class="test-feedback"><span class="test-feedback-label">PARA DEPURAR</span><p>'+esc(test.feedback)+'</p></div>':'')+
          (test.detail?'<div class="test-detail">'+esc(test.detail)+'</div>':'')+
          '</div></div>';
      }).join('');

      if(passed===results.length&&results.length>0){
        state.done[state.current]=true;
        state.approved[state.current]=E.editor.value;
        if(state.current<missions.length-1)state.open[state.current+1]=true;
        if(state.done.every(Boolean)&&!state.finished)state.finished=Date.now();

        setScoreState('success','CHAVE CONQUISTADA');
        E.message.textContent=state.current<missions.length-1
          ?'Todos os testes passaram. A próxima chave foi liberada.'
          :'Todos os testes passaram. O núcleo lógico do OASIS foi restaurado.';

        save();
        renderNav();
        updateStats();
      }else{
        setScoreState('danger',passed+'/'+results.length+' TESTES');
        E.message.textContent='Os cartões em vermelho indicam exatamente quais comportamentos ainda precisam ser revistos.';
        save();
      }
    });

    worker.addEventListener('error',function(event){
      clearTimeout(timer);
      closeWorker();
      setScoreState('danger','ERRO DE SINTAXE');
      E.tests.innerHTML='<div class="test-summary partial"><div class="test-summary-icon">!</div><div><strong>O JavaScript não pôde ser interpretado.</strong><span>'+esc(event.message||'Revise a sintaxe do JavaScript.')+'</span></div></div>';
      E.message.textContent='Corrija a sintaxe antes de validar as regras da missão.';
    });
  }

  function showHint(){
    var m=missions[state.current];
    var exhausted=state.hints[state.current]>=m.hints.length;

    if(!exhausted){
      state.hints[state.current]+=1;
      exhausted=state.hints[state.current]>=m.hints.length;
    }

    E.hintPanel.classList.add('visible');
    renderHints(m,exhausted);
    save();
    updateStats();
  }

  function resetCode(){
    state.code[state.current]=missions[state.current].starter;
    E.editor.value=state.code[state.current];
    E.tests.innerHTML='';
    setScoreState(state.done[state.current]?'success':'',state.done[state.current]?'CHAVE CONQUISTADA':'Aguardando execução');
    E.message.textContent='Código inicial restaurado.';
    save();
  }

  function restart(){
    if(!window.confirm('Isso apagará o progresso, os códigos e o histórico de tentativas deste navegador. Deseja continuar?'))return;
    localStorage.removeItem(STORAGE_KEY);
    state=freshState();
    E.name.value='';
    E.className.value='';
    render();
    window.scrollTo({top:0,behavior:'smooth'});
  }

  E.run.addEventListener('click',runTests);
  E.hint.addEventListener('click',showHint);
  E.reset.addEventListener('click',resetCode);
  E.restart.addEventListener('click',restart);

  E.editor.addEventListener('input',function(){
    state.code[state.current]=E.editor.value;
    save();
  });

  E.editor.addEventListener('keydown',function(event){
    if(event.key==='Tab'){
      event.preventDefault();
      var start=E.editor.selectionStart;
      var end=E.editor.selectionEnd;
      var value=E.editor.value;
      E.editor.value=value.slice(0,start)+'  '+value.slice(end);
      E.editor.selectionStart=E.editor.selectionEnd=start+2;
      state.code[state.current]=E.editor.value;
      save();
    }
    if((event.ctrlKey||event.metaKey)&&event.key==='Enter'){
      event.preventDefault();
      runTests();
    }
  });

  E.name.addEventListener('input',function(){
    state.name=E.name.value;
    save();
    updatePdfButton();
  });

  E.className.addEventListener('input',function(){
    state.className=E.className.value;
    save();
  });

  E.pdf.addEventListener('click',function(){
    window.OASIS_exportPdf({
      state:state,
      missions:missions,
      name:E.name.value.trim(),
      className:E.className.value.trim(),
      totals:totals
    });
  });

  load();
  E.name.value=state.name||'';
  E.className.value=state.className||'';
  render();
  window.addEventListener('load',updatePdfButton);
})();
