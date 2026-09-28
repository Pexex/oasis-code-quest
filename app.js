
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
    hintCounter:$('#hintCounter'),hintText:$('#hintText'),stats:$('#missionStats'),reportInfo:$('#reportInfo'),reportStats:$('#reportStats'),
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
    E.score.textContent=state.done[state.current]?'CHAVE CONQUISTADA':'Aguardando execução';
    E.message.textContent=state.done[state.current]
      ?'Esta missão possui um código aprovado. Você pode revisá-lo e executar uma nova validação.'
      :'Leia o contrato e as regras. Desenvolva sua solução e execute os testes quando estiver pronto.';

    E.hintPanel.classList.toggle('visible',state.hints[state.current]>0);
    if(state.hints[state.current]>0){
      E.hintCounter.textContent=state.hints[state.current]+'/'+m.hints.length;
      E.hintText.textContent=m.hints.slice(0,state.hints[state.current]).join(' ');
    }

    updateStats();
  }

  function runTests(){
    state.code[state.current]=E.editor.value;
    state.attempts[state.current]+=1;
    save();
    updateStats();

    E.run.disabled=true;
    E.tests.innerHTML='';
    E.score.textContent='VALIDANDO';
    E.message.textContent='Executando cenários de teste…';

    if(!window.Worker||!window.Blob||!window.URL){
      E.run.disabled=false;
      E.score.textContent='INDISPONÍVEL';
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
      E.score.textContent='TEMPO ESGOTADO';
      E.message.textContent='O código não terminou a execução. Verifique se existe algum laço que nunca é encerrado.';
    },1800);

    worker.addEventListener('message',function(event){
      clearTimeout(timer);
      closeWorker();

      if(event.data.error){
        E.score.textContent='ERRO';
        E.message.textContent=event.data.error;
        return;
      }

      var results=event.data.tests||[];
      var passed=results.filter(function(test){return test.ok;}).length;
      state.results[state.current]=results;

      E.tests.innerHTML=results.map(function(test){
        return '<div class="test-result '+(test.ok?'':'fail')+'"><div>'+(test.ok?'APROVADO':'REVISAR')+
          ' · '+esc(test.name)+'</div>'+(test.detail?'<div class="test-detail">'+esc(test.detail)+'</div>':'')+'</div>';
      }).join('');

      if(passed===results.length&&results.length>0){
        state.done[state.current]=true;
        state.approved[state.current]=E.editor.value;
        if(state.current<missions.length-1)state.open[state.current+1]=true;
        if(state.done.every(Boolean)&&!state.finished)state.finished=Date.now();

        E.score.textContent='CHAVE CONQUISTADA';
        E.message.textContent=state.current<missions.length-1
          ?'Todos os testes passaram. A próxima chave foi liberada.'
          :'Todos os testes passaram. O núcleo lógico do OASIS foi restaurado.';

        save();
        renderNav();
        updateStats();
      }else{
        E.score.textContent=passed+'/'+results.length+' testes';
        E.message.textContent='Alguns cenários ainda falharam. Use os nomes dos testes para descobrir qual requisito precisa ser revisto.';
        save();
      }
    });

    worker.addEventListener('error',function(event){
      clearTimeout(timer);
      closeWorker();
      E.score.textContent='ERRO DE SINTAXE';
      E.message.textContent=event.message||'Revise a sintaxe do JavaScript.';
    });
  }

  function showHint(){
    var m=missions[state.current];
    state.hints[state.current]=Math.min(m.hints.length,state.hints[state.current]+1);
    E.hintPanel.classList.add('visible');
    E.hintCounter.textContent=state.hints[state.current]+'/'+m.hints.length;
    E.hintText.textContent=m.hints.slice(0,state.hints[state.current]).join(' ');
    save();
    updateStats();
  }

  function resetCode(){
    state.code[state.current]=missions[state.current].starter;
    E.editor.value=state.code[state.current];
    E.tests.innerHTML='';
    E.score.textContent=state.done[state.current]?'CHAVE CONQUISTADA':'Aguardando execução';
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
