
window.OASIS_exportPdf = function(ctx) {
  if (!(window.jspdf && window.jspdf.jsPDF)) return;

  var jsPDF = window.jspdf.jsPDF;
  var pdf = new jsPDF({ unit: 'mm', format: 'a4' });
  var W = 210, H = 297, M = 18, CW = W - 36, y = 18;
  var RED=[227,6,19], BLACK=[0,0,0], DARK=[51,51,51], MID=[102,102,102], LIGHT=[232,232,232], SOFT=[245,245,245];

  function safe(value) {
    return String(value)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g,'')
      .replace(/[^\x09\x0A\x0D\x20-\x7E\xA0-\xFF]/g,'?');
  }

  function header() {
    pdf.setDrawColor.apply(pdf, LIGHT);
    pdf.line(M,13,W-M,13);
    pdf.setFillColor.apply(pdf, RED);
    pdf.rect(M,8,3,5,'F');
    pdf.setFont('helvetica','bold');
    pdf.setFontSize(7.5);
    pdf.setTextColor.apply(pdf, MID);
    pdf.text('SENAI-SP | TECNICO EM MULTIMIDIA | FDD',M+6,11.6);
  }

  function ensure(height) {
    if (y + height > H - 18) {
      pdf.addPage();
      header();
      y = 20;
    }
  }

  function write(text, size, weight, font, color) {
    size = size || 9;
    weight = weight || 'normal';
    font = font || 'helvetica';
    color = color || DARK;
    pdf.setFont(font,weight);
    pdf.setFontSize(size);
    pdf.setTextColor.apply(pdf,color);
    var lines = pdf.splitTextToSize(safe(text),CW);
    ensure(lines.length * 4.6 + 3);
    pdf.text(lines,M,y);
    y += lines.length * 4.6 + 2;
  }

  var totals = ctx.totals();
  var mins = Math.max(1,Math.round(((ctx.state.finished || Date.now()) - ctx.state.started)/60000));

  header();
  y=26;
  pdf.setFont('helvetica','bold');
  pdf.setTextColor.apply(pdf,BLACK);
  pdf.setFontSize(19);
  pdf.text('CERTIFICADO DE CONCLUSAO DA ATIVIDADE',M,y);
  y+=9;
  pdf.setFontSize(13);
  pdf.text('OASIS CODE QUEST — AS TRES CHAVES',M,y);
  y+=5;
  pdf.setFillColor.apply(pdf,RED);
  pdf.rect(M,y,CW,1.2,'F');
  y+=11;
  pdf.setFontSize(17);
  pdf.text(safe(ctx.name),M,y);
  y+=9;

  write('Concluiu os tres desafios de programacao em JavaScript e teve suas solucoes aprovadas pela bateria automatica de testes da atividade.',10);
  write('Turma: ' + (ctx.className || 'Nao informada'),9,'bold');
  write('Tempo registrado: ' + mins + ' min | Tentativas: ' + totals.attempts + ' | Pistas utilizadas: ' + totals.hints,9);

  pdf.setFillColor.apply(pdf,SOFT);
  pdf.roundedRect(M,y,CW,17,2,2,'F');
  pdf.setTextColor.apply(pdf,MID);
  pdf.setFontSize(8);
  pdf.setFont('helvetica','italic');
  pdf.text(pdf.splitTextToSize('Registro pedagogico da atividade. Nao constitui certificado institucional do SENAI.',CW-8),M+4,y+6);
  y+=24;

  write('RELATORIO DE EVIDENCIAS',14,'bold','helvetica',BLACK);
  write('Capacidade mobilizada: Aplicar logica de programacao para desenvolvimento de projetos de design digital.',9);
  write('Os testes verificam aderencia funcional aos requisitos. Organizacao, clareza, estrategia de resolucao e qualidade do codigo permanecem sob avaliacao docente.',9);

  ctx.missions.forEach(function(mission,index){
    ensure(34);
    pdf.setFillColor.apply(pdf,SOFT);
    pdf.roundedRect(M,y,CW,9,2,2,'F');
    pdf.setFillColor.apply(pdf,RED);
    pdf.rect(M,y,2,9,'F');
    pdf.setFont('helvetica','bold');
    pdf.setFontSize(10);
    pdf.setTextColor.apply(pdf,DARK);
    pdf.text((index+1)+'. CHAVE DE '+safe(mission.key.toUpperCase())+' — '+safe(mission.title),M+5,y+6);
    y+=13;

    var results = ctx.state.results[index] || [];
    write('Tentativas: '+ctx.state.attempts[index]+' | Pistas: '+ctx.state.hints[index]+' | Testes aprovados: '+results.filter(function(item){return item.ok;}).length+'/'+results.length,9);
    results.forEach(function(item){
      write('['+(item.ok?'OK':'FALHA')+'] '+item.name,8);
    });
  });

  write('REGISTRO PARA AVALIACAO DOCENTE',12,'bold','helvetica',BLACK);
  [
    'Funcionamento conforme requisitos',
    'Decomposicao e organizacao da solucao',
    'Uso adequado de funcoes, condicionais, arrays e objetos',
    'Legibilidade e manutencao do codigo',
    'Capacidade de depuracao e revisao'
  ].forEach(function(criterion){
    ensure(16);
    write(criterion,9,'bold');
    pdf.setDrawColor.apply(pdf,LIGHT);
    pdf.rect(M,y,CW,8);
    y+=12;
  });

  ctx.missions.forEach(function(mission,index){
    pdf.addPage();
    header();
    y=20;
    write('CODIGO APROVADO — CHAVE DE '+mission.key.toUpperCase(),13,'bold','helvetica',BLACK);
    write(mission.title,9,'normal','helvetica',MID);

    pdf.setFont('courier','normal');
    pdf.setFontSize(7.3);
    pdf.setTextColor.apply(pdf,DARK);

    safe(ctx.state.approved[index] || '').replace(/\t/g,'  ').split('\n').forEach(function(line,lineNumber){
      var lines = pdf.splitTextToSize(String(lineNumber+1).padStart(3,' ')+' | '+line,CW);
      if (y + lines.length * 3.6 > H - 16) {
        pdf.addPage();
        header();
        y=20;
        pdf.setFont('courier','normal');
        pdf.setFontSize(7.3);
        pdf.setTextColor.apply(pdf,DARK);
      }
      pdf.text(lines,M,y);
      y += lines.length * 3.6;
    });
  });

  var filename = 'FDD_OASIS_Code_Quest_' + safe(ctx.name).replace(/\W+/g,'_') + '.pdf';
  pdf.save(filename);
};
