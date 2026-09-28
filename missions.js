
window.OASIS_MISSIONS = [
  {
    key: 'Cobre',
    title: 'Firewall de Acesso',
    story: 'O primeiro módulo corrompido permite que jogadores entrem em desafios mesmo quando não possuem condições para participar. Isso quebra a progressão do OASIS e pode comprometer itens, energia e recompensas. Você foi designado para reconstruir a função responsável por autorizar ou negar cada tentativa de entrada.',
    task: 'Crie uma função chamada verificarAcesso. Ela receberá um objeto com os dados do jogador e outro com os requisitos do desafio. Sua função deverá analisar todos os requisitos e informar ao restante do sistema se a entrada deve ser autorizada.',
    signature: 'verificarAcesso(jogador, desafio)',
    input: 'jogador  → objeto com informações do jogador\ndesafio → objeto com requisitos de entrada',
    ret: 'Retorne <strong>true</strong> quando o jogador puder entrar no desafio. Retorne <strong>false</strong> quando qualquer regra obrigatória impedir o acesso.',
    dict: [
      ['jogador.nivel','number','Nível atual do jogador.'],
      ['jogador.energia','number','Energia disponível antes da missão.'],
      ['jogador.vivo','boolean','Indica se o personagem está ativo.'],
      ['jogador.banido','boolean','Indica se a conta está impedida de acessar desafios.'],
      ['desafio.nivelMinimo','number','Menor nível aceito pelo desafio.'],
      ['desafio.custoEnergia','number','Quantidade mínima de energia necessária para entrar.']
    ],
    rules: [
      'O personagem precisa estar vivo.',
      'A conta não pode estar banida.',
      'O nível atual precisa ser igual ou superior ao nível mínimo exigido.',
      'A energia disponível precisa ser igual ou superior ao custo do desafio.',
      'A função apenas verifica acesso: não gaste energia e não altere os objetos recebidos.'
    ],
    example: 'const jogador = {\n  nivel: 8,\n  energia: 70,\n  vivo: true,\n  banido: false\n};\n\nconst desafio = {\n  nivelMinimo: 5,\n  custoEnergia: 30\n};',
    checklist: [
      'Sei quais dois objetos a função recebe.',
      'Sei que o retorno precisa ser true ou false.',
      'Consigo identificar as situações que devem impedir o acesso.',
      'Entendi que a função não deve alterar os dados recebidos.'
    ],
    dom: 'Mais tarde, um botão “Entrar na missão” poderá consultar essa função. O DOM cuidará da interação e da apresentação, mas a regra continuará dentro do JavaScript.',
    hints: [
      'Antes de escrever código, identifique todas as condições obrigatórias para que uma entrada seja válida.',
      'Pense se a autorização pode acontecer quando apenas parte das regras é atendida.',
      'A função precisa devolver um booleano. Mostrar uma mensagem no console não cumpre o contrato.'
    ],
    starter: 'function verificarAcesso(jogador, desafio) {\n  // Analise os dados recebidos.\n  // Retorne true para acesso autorizado ou false para acesso negado.\n\n}'
  },
  {
    key: 'Jade',
    title: 'Filtro de Missões',
    story: 'O firewall voltou a funcionar, mas o catálogo do OASIS continua corrompido. O menu está exibindo missões incompatíveis com o perfil atual do jogador. O sistema precisa gerar uma lista personalizada de desafios realmente disponíveis.',
    task: 'Crie uma função chamada selecionarMissoes. Ela receberá os dados de um jogador e um array contendo várias missões. Sua função deverá analisar a coleção inteira e devolver somente os identificadores das missões às quais aquele jogador pode ter acesso.',
    signature: 'selecionarMissoes(jogador, missoes)',
    input: 'jogador → objeto com o estado atual do jogador\nmissoes → array contendo objetos de missão',
    ret: 'Retorne um <strong>novo array</strong> contendo apenas os valores da propriedade <strong>id</strong> das missões liberadas. Quando nenhuma missão estiver disponível, retorne <strong>[]</strong>.',
    dict: [
      ['jogador.nivel','number','Nível atual do jogador.'],
      ['jogador.energia','number','Energia disponível.'],
      ['jogador.vivo','boolean','Indica se o personagem está ativo.'],
      ['jogador.banido','boolean','Indica se a conta possui restrição.'],
      ['missao.id','string','Identificador incluído no retorno quando a missão for liberada.'],
      ['missao.nivelMinimo','number','Nível mínimo exigido pela missão.'],
      ['missao.custoEnergia','number','Energia mínima necessária para iniciar a missão.']
    ],
    rules: [
      'Jogadores mortos não recebem nenhuma missão.',
      'Jogadores banidos não recebem nenhuma missão.',
      'Cada missão precisa ser analisada individualmente.',
      'O jogador precisa possuir nível suficiente para a missão analisada.',
      'O jogador precisa possuir energia suficiente para a missão analisada.',
      'O retorno deve conter apenas IDs, mantendo a ordem original das missões.',
      'O array original e seus objetos não podem ser modificados.'
    ],
    example: 'const jogador = {\n  nivel: 6,\n  energia: 50,\n  vivo: true,\n  banido: false\n};\n\nconst missoes = [\n  { id: "A-01", nivelMinimo: 1, custoEnergia: 10 },\n  { id: "B-07", nivelMinimo: 5, custoEnergia: 40 },\n  { id: "C-12", nivelMinimo: 10, custoEnergia: 20 }\n];',
    checklist: [
      'Entendi que preciso analisar uma coleção de missões.',
      'Sei que devo devolver IDs e não objetos completos.',
      'Sei o que deve ser retornado quando nenhuma missão é válida.',
      'Entendi que os dados recebidos precisam permanecer intactos.'
    ],
    dom: 'O resultado desta função poderá ser usado pelo DOM para decidir quais cards de missão aparecerão na tela. O motor define os dados; a interface apenas os representa.',
    hints: [
      'O problema possui uma decisão sobre o jogador e outra decisão que precisa acontecer para cada missão.',
      'Você precisará percorrer uma coleção e selecionar apenas os elementos que atendem aos critérios.',
      'O resultado final precisa conter IDs, não os objetos inteiros.'
    ],
    starter: 'function selecionarMissoes(jogador, missoes) {\n  // Analise o jogador e todas as missões recebidas.\n  // Retorne um novo array contendo apenas os IDs liberados.\n\n}'
  },
  {
    key: 'Cristal',
    title: 'Motor de Estado',
    story: 'Dois módulos foram recuperados. O último erro é o mais crítico: ao terminar uma missão, vida, energia, experiência e moedas estão sendo atualizadas incorretamente. Alguns jogadores aparecem com valores negativos e outros perdem informações do perfil. Você precisa reconstruir o módulo que gera o novo estado do jogador.',
    task: 'Crie uma função chamada processarResultado. Ela receberá o jogador atual, os dados do desafio e um booleano indicando vitória ou derrota. Sua função deverá produzir um novo objeto representando o estado final do jogador.',
    signature: 'processarResultado(jogador, desafio, venceu)',
    input: 'jogador → objeto com o estado atual\ndesafio → objeto com custo, recompensa e dano\nvenceu → boolean que informa vitória ou derrota',
    ret: 'Retorne um <strong>novo objeto jogador</strong>. Preserve todos os campos existentes e atualize corretamente vida, energia, XP, moedas e vivo. O objeto original não pode ser modificado.',
    dict: [
      ['jogador.vida','number','Vida antes da missão.'],
      ['jogador.energia','number','Energia antes da missão.'],
      ['jogador.xp','number','Experiência acumulada.'],
      ['jogador.moedas','number','Saldo de moedas.'],
      ['jogador.vivo','boolean','Representa a condição final do personagem.'],
      ['desafio.custoEnergia','number','Energia consumida pela tentativa.'],
      ['desafio.recompensaXP','number','XP concedido em uma vitória.'],
      ['desafio.recompensaMoedas','number','Moedas concedidas em uma vitória.'],
      ['desafio.dano','number','Vida perdida em uma derrota.'],
      ['venceu','boolean','true representa vitória; false representa derrota.']
    ],
    rules: [
      'O custo de energia ocorre tanto na vitória quanto na derrota.',
      'A energia final nunca pode ser menor que zero.',
      'Em caso de vitória, adicione XP e moedas de recompensa.',
      'Em caso de derrota, desconte o dano da vida.',
      'A vida final nunca pode ser menor que zero.',
      'vivo deve ser true quando a vida final for maior que zero e false quando chegar a zero.',
      'Campos adicionais, como nome e nível, precisam continuar existindo.',
      'A função deve retornar um novo objeto sem modificar jogador.'
    ],
    example: 'const jogador = {\n  nome: "Parzival",\n  nivel: 9,\n  vida: 100,\n  energia: 80,\n  xp: 100,\n  moedas: 50,\n  vivo: true\n};\n\nconst desafio = {\n  custoEnergia: 30,\n  recompensaXP: 200,\n  recompensaMoedas: 500,\n  dano: 45\n};\n\nconst venceu = true;',
    checklist: [
      'Consigo separar o que acontece sempre do que depende do resultado.',
      'Sei quais valores possuem limite mínimo.',
      'Entendi que campos extras precisam ser preservados.',
      'Entendi que o retorno deve ser um novo objeto.'
    ],
    dom: 'Esse objeto é o estado da aplicação. Depois, o DOM poderá transformar esses valores em barras de vida, textos, inventário, indicadores e feedback visual.',
    hints: [
      'Separe as mudanças que acontecem sempre das mudanças exclusivas de vitória ou derrota.',
      'Você precisa criar um novo estado a partir do jogador existente, preservando campos que não foram citados para alteração.',
      'Depois dos cálculos, verifique limites de vida e energia antes de definir o campo vivo.'
    ],
    starter: 'function processarResultado(jogador, desafio, venceu) {\n  // Produza um NOVO estado do jogador.\n  // Preserve os dados que não precisam ser alterados.\n\n}'
  }
];
