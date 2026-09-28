
window.OASIS_buildWorkerSource = function(level, code) {
  var lines = [
    "try{self.fetch=undefined;self.XMLHttpRequest=undefined;self.WebSocket=undefined;self.importScripts=undefined}catch(_){}",
    "const clone=v=>JSON.parse(JSON.stringify(v));",
    "const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);",
    "const tests=[];",
    "const test=(name,fn)=>{try{tests.push({name,ok:!!fn()})}catch(e){tests.push({name,ok:false,detail:e&&e.message?e.message:String(e)})}};",
    "let x;",
    "try{x=(()=>{",
    code,
    ";return{a:typeof verificarAcesso==='function'?verificarAcesso:null,b:typeof selecionarMissoes==='function'?selecionarMissoes:null,c:typeof processarResultado==='function'?processarResultado:null}})()}catch(e){postMessage({error:'Erro ao carregar o código: '+e.message})}",
    "if(x){try{"
  ];

  if (level === 0) {
    lines.push(
      "const f=x.a;if(!f)throw Error('A função verificarAcesso não foi encontrada.');",
      "test('Autoriza jogador que atende a todos os requisitos',()=>f({nivel:8,energia:70,vivo:true,banido:false},{nivelMinimo:5,custoEnergia:30})===true);",
      "test('Bloqueia personagem sem vida ativa',()=>f({nivel:20,energia:100,vivo:false,banido:false},{nivelMinimo:1,custoEnergia:1})===false);",
      "test('Bloqueia conta banida',()=>f({nivel:20,energia:100,vivo:true,banido:true},{nivelMinimo:1,custoEnergia:1})===false);",
      "test('Bloqueia nível insuficiente',()=>f({nivel:4,energia:100,vivo:true,banido:false},{nivelMinimo:5,custoEnergia:1})===false);",
      "test('Interpreta corretamente o limite de energia',()=>f({nivel:5,energia:30,vivo:true,banido:false},{nivelMinimo:5,custoEnergia:30})===true&&f({nivel:5,energia:29,vivo:true,banido:false},{nivelMinimo:5,custoEnergia:30})===false);",
      "test('Preserva os objetos recebidos',()=>{let j={nivel:8,energia:70,vivo:true,banido:false},d={nivelMinimo:5,custoEnergia:30},a=clone(j),b=clone(d);f(j,d);return same(j,a)&&same(d,b)});"
    );
  }

  if (level === 1) {
    lines.push(
      "const f=x.b;if(!f)throw Error('A função selecionarMissoes não foi encontrada.');",
      "const ms=[{id:'A',nivelMinimo:1,custoEnergia:10},{id:'B',nivelMinimo:5,custoEnergia:40},{id:'C',nivelMinimo:10,custoEnergia:20},{id:'D',nivelMinimo:5,custoEnergia:80}];",
      "test('Retorna somente IDs disponíveis',()=>same(f({nivel:6,energia:50,vivo:true,banido:false},ms),['A','B']));",
      "test('Preserva a ordem original',()=>same(f({nivel:20,energia:100,vivo:true,banido:false},ms),['A','B','C','D']));",
      "test('Retorna [] para jogador banido',()=>same(f({nivel:20,energia:100,vivo:true,banido:true},ms),[]));",
      "test('Retorna [] para personagem morto',()=>same(f({nivel:20,energia:100,vivo:false,banido:false},ms),[]));",
      "test('Aceita requisitos exatamente no limite',()=>same(f({nivel:5,energia:40,vivo:true,banido:false},[{id:'X',nivelMinimo:5,custoEnergia:40}]),['X']));",
      "test('Preserva jogador, array e objetos originais',()=>{let j={nivel:6,energia:50,vivo:true,banido:false},a=clone(j),b=clone(ms);f(j,ms);return same(j,a)&&same(ms,b)});"
    );
  }

  if (level === 2) {
    lines.push(
      "const f=x.c;if(!f)throw Error('A função processarResultado não foi encontrada.');",
      "const d={custoEnergia:30,recompensaXP:200,recompensaMoedas:500,dano:45};",
      "test('Vitória aplica custo e recompensas',()=>{let z=f({nome:'P',nivel:9,vida:100,energia:80,xp:100,moedas:50,vivo:true},d,true);return z&&z.vida===100&&z.energia===50&&z.xp===300&&z.moedas===550&&z.vivo===true});",
      "test('Derrota aplica custo e dano sem recompensa',()=>{let z=f({vida:100,energia:80,xp:100,moedas:50,vivo:true},d,false);return z&&z.vida===55&&z.energia===50&&z.xp===100&&z.moedas===50&&z.vivo===true});",
      "test('Vida e energia nunca ficam negativas',()=>{let z=f({vida:20,energia:10,xp:0,moedas:0,vivo:true},d,false);return z&&z.vida===0&&z.energia===0&&z.vivo===false});",
      "test('Preserva campos adicionais do jogador',()=>{let z=f({nome:'Parzival',nivel:9,vida:70,energia:40,xp:20,moedas:10,vivo:true},d,true);return z&&z.nome==='Parzival'&&z.nivel===9});",
      "test('Retorna um novo objeto',()=>{let j={vida:100,energia:80,xp:100,moedas:50,vivo:true};return f(j,d,true)!==j});",
      "test('Preserva o objeto jogador original',()=>{let j={vida:100,energia:80,xp:100,moedas:50,vivo:true},a=clone(j);f(j,d,true);return same(j,a)});"
    );
  }

  lines.push("postMessage({tests});}catch(e){postMessage({error:e.message})}}");
  return lines.join("\n");
};
