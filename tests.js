
window.OASIS_buildWorkerSource = function(level, code) {
  var lines = [
    "try{self.fetch=undefined;self.XMLHttpRequest=undefined;self.WebSocket=undefined;self.importScripts=undefined}catch(_){}",
    "const clone=v=>JSON.parse(JSON.stringify(v));",
    "const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);",
    "const tests=[];",
    "const test=(name,feedback,fn)=>{if(typeof feedback==='function'){fn=feedback;feedback='';}feedback=typeof feedback==='string'?feedback:'';try{tests.push({name,feedback,ok:!!fn()})}catch(e){tests.push({name,feedback,ok:false,detail:e&&e.message?e.message:String(e)})}};",
    "let x;",
    "try{x=(()=>{",
    code,
    ";return{a:typeof verificarAcesso==='function'?verificarAcesso:null,b:typeof selecionarMissoes==='function'?selecionarMissoes:null,c:typeof processarResultado==='function'?processarResultado:null}})()}catch(e){postMessage({error:'Erro ao carregar o código: '+e.message})}",
    "if(x){try{"
  ];

  if (level === 0) {
    lines.push(
      "const f=x.a;if(!f)throw Error('A função verificarAcesso não foi encontrada.');",
      "test('Autoriza jogador que atende a todos os requisitos','Sua função está negando uma entrada que deveria ser válida. Revise se alguma comparação foi invertida ou se você criou uma restrição que não aparece nas regras.',()=>f({nivel:8,energia:70,vivo:true,banido:false},{nivelMinimo:5,custoEnergia:30})===true);",
      "test('Bloqueia personagem sem vida ativa','Revise a propriedade que representa se o personagem está ativo. Mesmo com nível e energia suficientes, esse estado deve participar da decisão de acesso.',()=>f({nivel:20,energia:100,vivo:false,banido:false},{nivelMinimo:1,custoEnergia:1})===false);",
      "test('Bloqueia conta banida','Há uma restrição de acesso ligada ao estado da conta. Confira se sua função está considerando essa propriedade antes de autorizar a missão.',()=>f({nivel:20,energia:100,vivo:true,banido:true},{nivelMinimo:1,custoEnergia:1})===false);",
      "test('Bloqueia nível insuficiente','Compare novamente o nível atual com o requisito mínimo. Observe a direção da comparação e o que deve acontecer quando o jogador ainda não alcançou o requisito.',()=>f({nivel:4,energia:100,vivo:true,banido:false},{nivelMinimo:5,custoEnergia:1})===false);",
      "test('Interpreta corretamente o limite de energia','Este teste verifica um caso de fronteira. Energia exatamente igual ao custo deve ser tratada de forma diferente de energia abaixo do custo. Revise seu operador de comparação.',()=>f({nivel:5,energia:30,vivo:true,banido:false},{nivelMinimo:5,custoEnergia:30})===true&&f({nivel:5,energia:29,vivo:true,banido:false},{nivelMinimo:5,custoEnergia:30})===false);",
      "test('Preserva os objetos recebidos','Esta função deve apenas consultar os dados. Verifique se alguma linha está atribuindo, decrementando ou alterando propriedades de jogador ou desafio.',()=>{let j={nivel:8,energia:70,vivo:true,banido:false},d={nivelMinimo:5,custoEnergia:30},a=clone(j),b=clone(d);f(j,d);return same(j,a)&&same(d,b)});"
    );
  }

  if (level === 1) {
    lines.push(
      "const f=x.b;if(!f)throw Error('A função selecionarMissoes não foi encontrada.');",
      "const ms=[{id:'A',nivelMinimo:1,custoEnergia:10},{id:'B',nivelMinimo:5,custoEnergia:40},{id:'C',nivelMinimo:10,custoEnergia:20},{id:'D',nivelMinimo:5,custoEnergia:80}];",
      "test('Retorna somente IDs disponíveis','Revise duas coisas: quais missões realmente atendem aos requisitos do jogador e qual dado de cada missão deve entrar no array retornado. O contrato pede somente os identificadores.',()=>same(f({nivel:6,energia:50,vivo:true,banido:false},ms),['A','B']));",
      "test('Preserva a ordem original','As missões aprovadas devem manter a mesma sequência em que chegaram. Verifique se sua solução está ordenando, invertendo ou reconstruindo a lista em outra ordem.',()=>same(f({nivel:20,energia:100,vivo:true,banido:false},ms),['A','B','C','D']));",
      "test('Retorna [] para jogador banido','Antes de avaliar cada missão, existe uma condição geral do jogador que pode impedir qualquer oferta de desafio. Revise o estado da conta.',()=>same(f({nivel:20,energia:100,vivo:true,banido:true},ms),[]));",
      "test('Retorna [] para personagem morto','Antes de percorrer as missões, verifique se o jogador está em condição de participar. Um personagem inativo não deve receber opções de missão.',()=>same(f({nivel:20,energia:100,vivo:false,banido:false},ms),[]));",
      "test('Aceita requisitos exatamente no limite','Este cenário verifica igualdade nos requisitos. Revise se seus operadores consideram válido um jogador cujo nível e energia sejam exatamente iguais aos mínimos exigidos.',()=>same(f({nivel:5,energia:40,vivo:true,banido:false},[{id:'X',nivelMinimo:5,custoEnergia:40}]),['X']));",
      "test('Preserva jogador, array e objetos originais','A seleção deve produzir um novo resultado sem modificar as entradas. Procure operações que alterem jogador, o array de missões ou seus objetos.',()=>{let j={nivel:6,energia:50,vivo:true,banido:false},a=clone(j),b=clone(ms);f(j,ms);return same(j,a)&&same(ms,b)});"
    );
  }

  if (level === 2) {
    lines.push(
      "const f=x.c;if(!f)throw Error('A função processarResultado não foi encontrada.');",
      "const d={custoEnergia:30,recompensaXP:200,recompensaMoedas:500,dano:45};",
      "test('Vitória aplica custo e recompensas','Na vitória, diferencie o que acontece em qualquer tentativa do que acontece somente quando venceu. Revise energia, XP e moedas sem alterar campos que deveriam permanecer iguais.',()=>{let z=f({nome:'P',nivel:9,vida:100,energia:80,xp:100,moedas:50,vivo:true},d,true);return z&&z.vida===100&&z.energia===50&&z.xp===300&&z.moedas===550&&z.vivo===true});",
      "test('Derrota aplica custo e dano sem recompensa','Na derrota, confira quais campos realmente devem mudar e quais recompensas não devem ser concedidas. Compare sua regra com o contrato antes de alterar XP ou moedas.',()=>{let z=f({vida:100,energia:80,xp:100,moedas:50,vivo:true},d,false);return z&&z.vida===55&&z.energia===50&&z.xp===100&&z.moedas===50&&z.vivo===true});",
      "test('Vida e energia nunca ficam negativas','Depois dos cálculos, os valores finais precisam respeitar um limite mínimo. Revise também se o campo vivo representa corretamente o estado resultante da vida.',()=>{let z=f({vida:20,energia:10,xp:0,moedas:0,vivo:true},d,false);return z&&z.vida===0&&z.energia===0&&z.vivo===false});",
      "test('Preserva campos adicionais do jogador','O novo estado não deve conter apenas os campos usados no cálculo. Verifique se propriedades existentes, como nome e nível, continuam presentes no objeto retornado.',()=>{let z=f({nome:'Parzival',nivel:9,vida:70,energia:40,xp:20,moedas:10,vivo:true},d,true);return z&&z.nome==='Parzival'&&z.nivel===9});",
      "test('Retorna um novo objeto','O resultado precisa representar um novo estado independente. Se sua função devolve exatamente o mesmo objeto recebido, este requisito não é atendido.',()=>{let j={vida:100,energia:80,xp:100,moedas:50,vivo:true};return f(j,d,true)!==j});",
      "test('Preserva o objeto jogador original','Compare o jogador antes e depois da chamada. A função deve produzir o novo estado sem escrever diretamente nas propriedades do objeto recebido.',()=>{let j={vida:100,energia:80,xp:100,moedas:50,vivo:true},a=clone(j);f(j,d,true);return same(j,a)});"
    );
  }

  lines.push("postMessage({tests});}catch(e){postMessage({error:e.message})}}");
  return lines.join("\n");
};
