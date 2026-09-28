
window.OASIS_buildWorkerSource = function(level, code) {
  var lines = [
    "try{self.fetch=undefined;self.XMLHttpRequest=undefined;self.WebSocket=undefined;self.importScripts=undefined}catch(_){}",
    "const clone=v=>JSON.parse(JSON.stringify(v));",
    "const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);",
    "const tests=[];",
    "const test=(name,feedback,fn)=>{feedback=typeof feedback==='string'?feedback:'';try{tests.push({name,feedback,ok:!!fn()})}catch(e){tests.push({name,feedback,ok:false,detail:e&&e.message?e.message:String(e)})}};",
    "let x;",
    "try{x=(()=>{",
    code,
    ";return{a:typeof verificarAcesso==='function'?verificarAcesso:null,b:typeof selecionarMissoes==='function'?selecionarMissoes:null,c:typeof processarResultado==='function'?processarResultado:null}})()}catch(e){postMessage({error:'Erro ao carregar o código: '+e.message})}",
    "if(x){try{"
  ];

  if (level === 0) {
    lines.push(
      "const f=x.a;if(!f)throw Error('A função verificarAcesso não foi encontrada.');",
      "test('Decide corretamente em cenários variados','Sua função precisa mudar de decisão conforme os dados. Revise as quatro regras de acesso e teste mentalmente um caso válido e casos em que apenas uma regra falha.',()=>{const cs=[[{nivel:8,energia:70,vivo:true,banido:false},{nivelMinimo:5,custoEnergia:30},true],[{nivel:5,energia:30,vivo:true,banido:false},{nivelMinimo:5,custoEnergia:30},true],[{nivel:20,energia:100,vivo:false,banido:false},{nivelMinimo:1,custoEnergia:1},false],[{nivel:20,energia:100,vivo:true,banido:true},{nivelMinimo:1,custoEnergia:1},false],[{nivel:4,energia:100,vivo:true,banido:false},{nivelMinimo:5,custoEnergia:1},false],[{nivel:20,energia:29,vivo:true,banido:false},{nivelMinimo:5,custoEnergia:30},false],[{nivel:0,energia:0,vivo:false,banido:true},{nivelMinimo:1,custoEnergia:1},false]];return cs.every(c=>f(c[0],c[1])===c[2])});",
      "test('Trata corretamente os casos de fronteira','Revise os operadores de comparação. Valores exatamente iguais aos mínimos devem ser aceitos; valores imediatamente abaixo precisam ser rejeitados.',()=>{const d={nivelMinimo:5,custoEnergia:30};return f({nivel:5,energia:30,vivo:true,banido:false},d)===true&&f({nivel:4,energia:30,vivo:true,banido:false},d)===false&&f({nivel:5,energia:29,vivo:true,banido:false},d)===false});",
      "test('Preserva os objetos recebidos','Esta função deve apenas consultar os dados. Verifique se alguma linha está atribuindo, decrementando ou alterando propriedades de jogador ou desafio.',()=>{let j={nivel:8,energia:70,vivo:true,banido:false},d={nivelMinimo:5,custoEnergia:30},a=clone(j),b=clone(d);f(j,d);return same(j,a)&&same(d,b)});"
    );
  }

  if (level === 1) {
    lines.push(
      "const f=x.b;if(!f)throw Error('A função selecionarMissoes não foi encontrada.');",
      "const ms=[{id:'A',nivelMinimo:1,custoEnergia:10},{id:'B',nivelMinimo:5,custoEnergia:40},{id:'C',nivelMinimo:10,custoEnergia:20},{id:'D',nivelMinimo:5,custoEnergia:80}];",
      "test('Seleciona corretamente em cenários variados','Sua função precisa produzir listas diferentes para jogadores diferentes. Revise as condições gerais do jogador e depois analise cada missão individualmente.',()=>{return same(f({nivel:6,energia:50,vivo:true,banido:false},ms),['A','B'])&&same(f({nivel:20,energia:100,vivo:true,banido:false},ms),['A','B','C','D'])&&same(f({nivel:0,energia:0,vivo:true,banido:false},ms),[])&&same(f({nivel:20,energia:100,vivo:true,banido:true},ms),[])&&same(f({nivel:20,energia:100,vivo:false,banido:false},ms),[])});",
      "test('Respeita limites, ordem e formato do retorno','Confira três pontos: igualdade nos requisitos deve ser válida, a ordem original deve ser preservada e o array retornado deve conter apenas IDs.',()=>{const r=f({nivel:5,energia:40,vivo:true,banido:false},[{id:'X',nivelMinimo:5,custoEnergia:40},{id:'Y',nivelMinimo:6,custoEnergia:1},{id:'Z',nivelMinimo:1,custoEnergia:40}]);return Array.isArray(r)&&same(r,['X','Z'])});",
      "test('Preserva jogador, array e objetos originais','A seleção deve produzir um novo resultado sem modificar as entradas. Procure operações que alterem jogador, o array de missões ou seus objetos.',()=>{let j={nivel:6,energia:50,vivo:true,banido:false},a=clone(j),b=clone(ms);f(j,ms);return same(j,a)&&same(ms,b)});"
    );
  }

  if (level === 2) {
    lines.push(
      "const f=x.c;if(!f)throw Error('A função processarResultado não foi encontrada.');",
      "const d={custoEnergia:30,recompensaXP:200,recompensaMoedas:500,dano:45};",
      "test('Atualiza corretamente vitória e derrota','Separe o que acontece em qualquer tentativa do que depende do resultado. Compare energia, vida, XP e moedas em pelo menos um cenário de vitória e um de derrota.',()=>{let v=f({nome:'P',nivel:9,vida:100,energia:80,xp:100,moedas:50,vivo:true},d,true);let p=f({nome:'P',nivel:9,vida:100,energia:80,xp:100,moedas:50,vivo:true},d,false);return v&&p&&v.vida===100&&v.energia===50&&v.xp===300&&v.moedas===550&&v.vivo===true&&p.vida===55&&p.energia===50&&p.xp===100&&p.moedas===50&&p.vivo===true});",
      "test('Respeita limites e atualiza o estado vivo','Depois dos cálculos, vida e energia não podem ficar negativas. O campo vivo deve representar a vida final, inclusive quando ela chega exatamente a zero.',()=>{let a=f({vida:20,energia:10,xp:0,moedas:0,vivo:true},d,false);let b=f({vida:46,energia:30,xp:0,moedas:0,vivo:true},d,false);return a&&b&&a.vida===0&&a.energia===0&&a.vivo===false&&b.vida===1&&b.energia===0&&b.vivo===true});",
      "test('Cria um novo estado sem destruir o original','O retorno precisa ser um novo objeto, preservar campos adicionais e manter o jogador original intacto. Revise se você está alterando diretamente o parâmetro recebido.',()=>{let j={nome:'Parzival',nivel:9,vida:70,energia:40,xp:20,moedas:10,vivo:true},a=clone(j),z=f(j,d,true);return z&&z!==j&&same(j,a)&&z.nome==='Parzival'&&z.nivel===9});"
    );
  }

  lines.push("postMessage({tests});}catch(e){postMessage({error:e.message})}}");
  return lines.join("\n");
};
