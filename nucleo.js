// variáveis globais
  var tabelas;
  var tarefa = 0, aluno = 0, atraso = false;

// - funções -----
function qTabelas(tab){ console.log("qTabelas");
  //console.log(tab);
  var tb = document.getElementById("tbTarefa");
  var t = tarefa; // indice da tarefa
  var qtdLinhas = 0;
  for (var x=tb.rows.length-1;x>0;x--) { tb.deleteRow(x); }; //limpa tabela
  var cel = [];
  for (var x=0;x<tab[t].length;x++) {
   qtdLinhas++;
   var linha = tb.insertRow(qtdLinhas);
   for (var c=0;c<12;c++) { // cria colunas
     cel[c] = linha.insertCell(c);
   };
   //var celProb = linha.insertCell(12);
    if (tab[t][x][11] && document.getElementById('revisão').checked) { //console.log("revisão");
      var notas = tab[t][x][11];
      if (!notas) { alert("Desmarque a opção 'revisão', para carregar uma turma."); return; };
    } else { //console.log("ordinário");
      var notas = tab[t][x];
    };
    if (!Array.isArray(notas)) { notas = notas.split(","); };
    // ------- carrega dados
    cel[0].innerHTML = x+1;
    cel[1].innerHTML = tab[t][x][0];
    for (var c=2;c<10;c++) {
      if (!notas[c-1]) { if (tab[t][x][c-1]) { notas[c-1] = tab[t][x][c-1]; } else { notas[c-1] = ""; }; };
      cel[c].innerHTML = notas[c-1]; cel[c].style = "text-align:center; width: 25px;";
    };
    if (tab[t][x][9]) { var prazo = 0.7; } else { var prazo = 1; };
    var m = 0, med1 = 0, med2 = 0;
    for (var n=1;n<=8;n++) {
      var a = parseFloat(notas[n]);
       if (notas[n] || notas[n] == "0") { med1 += a; m++; };
    };
    med1 = med1 / m;
    med1 = Math.round(med1*10)/10;
    med2 = Math.round(med1*prazo*10)/10;
    if (med1) { cel[10].innerHTML = med1; cel[10].style = "text-align:center;"; tab[t][x][12] = med1; };
    if (med2) { cel[11].innerHTML = med2; cel[11].style = "text-align:center;"; tab[t][x][13] = med2; };
    //celProb.innerHTML = tab[t][x][4];
  };
  marcarLinha(aluno);
}
function carregarArquivo(evt) { console.log("carregarArquivo");
    document.getElementById('revisão').checked = false;
    //Retrieve the first (and only!) File from the FileList object

    var f = evt.target.files[0];

    if (f) {
      var r = new FileReader();
      r.onload = function(e) {
        var contents = e.target.result;
        tabelas = contents.split(";"); // separa tabelas
        tabelas.splice(-1);
         //console.log(tabelas);
        // if (tabelas[0] == "") { tabelas.unshift(); };
      for (var i=0;i<tabelas.length;i++) {
        tabelas[i] = tabelas[i].split("\n"); // separa alunos
        if (i>0) {tabelas[i].shift();};
        //console.log(tabelas[i]);
      //  if (tabelas[i][0] == "") { tabelas[i].unshift(); };
        for (var j=0;j<tabelas[i].length;j++) {
          tabelas[i][j] = tabelas[i][j].split("-"); // separa propriedades
          if (tabelas[i][j][9] == "true") { tabelas[i][j][9] = true; } else { tabelas[i][j][9] = false; };
          //console.log(tabelas[i][j]);
        };
      };

      qTabelas(tabelas);

      }
      r.readAsText(f);
    } else {
      alert("Falha ao ler arquivo");
    };
    var titulo = document.getElementById('fileinput').value;
    var barPos = titulo.lastIndexOf('\\'); titulo = titulo.slice(barPos+1);
    var pontoPos = titulo.lastIndexOf('.'); titulo = titulo.slice(0, pontoPos);
    document.getElementById('titulo').innerHTML = titulo;
    document.getElementById('aluno').value = "";
    document.getElementById('tar').value = "1"; selecionaTarefa();
    limparInputNotas();

  }
function salvarArquivo() { console.log("salvarArquivo");
    atualizaProblemas(); atualizaAtraso();
  	// cria string com presets
    var	dados = "";
    for (var i=0;i<tabelas.length;i++) { // loop para concatenar dados da tabela
      for (var j=0;j<tabelas[i].length;j++) {
        for (var k=0;k<tabelas[i][j].length;k++) {
          if (k != tabelas[i][j].length-1) { dados += tabelas[i][j][k] + "-"; } else { dados += tabelas[i][j][k]; };
        };
        if (j != tabelas[i].length-1) { dados += "\n"; };
      };
      if (i != tabelas.length-1) { dados += ";\n" } else { dados += ";" };
    };

  	var blob = new Blob([dados], {type: "text/plain;charset=utf-8"});
    //var nome = prompt("nome do arquivo");
  	saveAs(blob, "nome.txt");

  };
function criarComentarios(){ console.log("criarComentarios");
  if (tabelas[tarefa].length < 1) { alert("Nenhum aluno(a) cadastrado(a). \nAbra uma turma com alunos cadastrados!"); return; };
  var texto = "";
  var tab = tabelas, t = tarefa, a = aluno - 1;
  var m = 0, med1 = 0, med2 = 0;
  if (tab[t][a][9]) { var prazo = 0.7; } else { var prazo = 1; };
  for (var n=1;n<=8;n++) {
    var soma = parseFloat(tab[t][a][n]);
     if (tab[t][a][n] || tab[t][a][n] == "0") { med1 += soma; m++; };
  };
  med1 = med1 / m;
  med1 = Math.round(med1*10)/10;
  med2 = Math.round(med1*prazo*10)/10;
  if (med1 == med2) { texto += "Tarefa entregue no prazo. É possível reenviar após revisão.\n"; } else
                   { texto += "Tarefa entregue com atraso: nota = " + med2 + " (70% de " + med1 + ")\n"; };
  texto += "\nProblemas encontrados e que precisam ser revisados:\n\n";
  var form = document.getElementById("fComentarios");
  for (var x=0;x<form.length;x++) {
    if (form[x].checked) {
      texto += value2text(form[x].value) + "\n";
    };
  };
  texto += "\nBons estudos!";
  atualizaProblemas(); atualizaAtraso();

  var copiaTexto = document.getElementById("comentarios");
  copiaTexto.size = texto.length;
  copiaTexto.value = texto;
  copiaTexto.select();
  copiaTexto.setSelectionRange(0, 99999); /*For mobile devices*/
  document.execCommand("copy");

  //console.log(texto);
  //console.log("aluno", num, nota1, nota2, media, media2);
}
function value2text(val) { console.log("value2text");
  switch (val) {
    case "TVMD": return "A independência das vozes é prejudicada quando todas as vozes se movem na mesma direção";
    case "inv2": return "Os acordes em 2ª inversão são instáveis e a voz do baixo deve ser preparada e resolvida por grau conjunto ou mantendo a mesma nota.";
    case "DD": return "A(s) nota(s) dissonante(s) em um acorde não podem resolver em outra dissonância, na mesma voz.";
    case "S3": return "Acorde sem a terça (em texturas de 3 ou mais vozes não se deve omitir a 3ª).";
    case "3PCs": return "Acordes com menos de 3 classes de notas (em texturas de 4 ou mais vozes, os acordes devem ter pelo menos 3 notas diferentes).";
    case "3D": return "Dobramento da terça. Em tríades consonantes, não é aconselhável repetir a terça do acorde.";
    case "7D": return "Dobramento da sétima. Não se deve repetir a sétima do acorde.";
    case "5D": return "Dobramento da 5ª diminuta. Em tríades dissonantes (diminuta ou aumentada), não é aconselhável repetir a quinta do acorde.";
    case "NNA": return "Uso de notas que não correspondem ao acorde da cifra.";
    case "SF": return "Acordes sem a fundamental. É indispensável, para a caracterização do acorde, a presença da fundamental.";
    case "S7": return "Acordes sem a sétima. Quando a cifra corresponde a um acorde de sétima, é indispensável a presença da sétima.";
    case "IA": return "Intervalo melódico aumentado ou diminuto.";
    case "ATm": return "Tonalidade menor sem a alteração do 7º grau melódico (sensível).";
    case "PF": return "Repetição de Ponto Focal superior (agudo).";
    case "DC": return "Dissonância composta (dois saltos melódicos que geram uma 7ª ou 9ª).";
    case "MMD": return "Excesso de movimentos na mesma direção e em sequência.";
    case "SMD": return "Mais de 2 saltos seguidos na mesma direção.";
    case "IIF": return "Intervalo Inicial e final diferente de Uníssono e 8J.";
    case "NPGC": return "Não prioriza grau conjunto ou terças.";
    case "CZ": return "Cruzamento de vozes.";
    case "D": return "Dissonância – uso não permitido ou sem tratamento.";
    case "NPCI": return "Não prioriza consonância imperfeita.";
    case "8ªO": return "Quintas ou oitavas ocultas.";
    case "8ªP": return "Quintas ou oitavas paralelas.";
    case "8ªI": return "Quintas ou oitavas intermitentes.";
    case "I>8": return "Intervalo melódico maior do que a oitava (não é permitido).";
    case "I>5": return "intervalo melódico maior do que a quinta, sem compensação.";
    case "I": return "Erro na indicação ou compreensão de intervalos ou sem indicação de intervalos.";
    case "RN": return "Repetição de notas (sem mudança na nota do CF).";
    case "PD": return "Usou poucas dissonâncias.";
    case "Arp": return "Excesso de arpejos na melodia.";
    case "Rit": return "Ritmo não característico da espécie.";
    case "Amm": return "Problemas no uso de alterações no modo menor.";
    case "RF": return "Ritmo errado na finalização.";
    case "2SMD": return "Dois saltos seguidos na mesma direção sem formar uma tríade ou 5J+4J ou 4J+5J.";
    case "col1": return "Colcheias em tempo forte (deve ser somente em tempo fraco).";
    case "col2": return "Colcheias não usadas em par ou sincopadas.";
    case "col3": return "Excesso de colcheias (deve ser somente um par por compasso).";
    case "sens": return "Cadência final sem a sensível ou sem a resolução da sensível.";
    case "col4": return "Colcheias movimentando por salto (deve ser por grau conjunto).";
    case "RV": return "Ritmo com pouca variação e/ou segmentado.";
    case "Afas": return "Distância/afastamento entre as vozes está muito amplo. Nos nossos exercícios serão permitidos no máximo uma 8ª entre as vozes superiores e uma 15ª entre tenor e baixo.";
    case "DRit": return "Duração da dissonância é muito maior do que a da preparação ou da resolução.";
  };
}
function selecionaTarefa() { console.log("selecionaTarefa");
  if (!tabelas) { return; };
  tarefa = parseFloat(document.getElementById('tar').value)-1;
  if (tarefa < 0) { document.getElementById('tar').value = 1; tarefa = 0; } else
  if (tarefa > tabelas.length-1) { tarefa = tabelas.length-1 ; document.getElementById('tar').value = tabelas.length;  }
  if (!tabelas[tarefa]) { return; };
  atualizaProblemas(); atualizaAtraso(); qTabelas(tabelas);
  document.getElementById('aluno').value = ""; aluno = 0;
  limparInputNotas();
  document.getElementById("comentarios").value = "";
}
function selecionaAluno() { console.log("selecionaAluno");
  if (!tabelas[tarefa]) { return; };
  document.getElementById('revisão').checked = false;
  atualizaProblemas(); //atualizaAtraso();
  aluno = parseFloat(document.getElementById('aluno').value);
  if (aluno > tabelas[tarefa].length) { aluno = tabelas[tarefa].length; document.getElementById('aluno').value = aluno; } else
  if (aluno < 1) { document.getElementById('aluno').value = 1; aluno = 1; };
  //console.log("seleciona aluno", tabelas[tarefa].length, aluno);
  if (!tabelas[tarefa][aluno-1]) { return; };  //console.log(tarefa);
  marcarLinha(aluno);
  limparInputNotas();
  limparProblemas();
  document.getElementById("comentarios").value = "";
  atualizaRevisão();
}
function marcarLinha(i) { console.log("marcarLinha", i);
  var tb = document.getElementById("tbTarefa");
  for (var x=1;x<tb.rows.length;x++)  { //console.log("marca",x, i);
    if (x == i) { tb.rows[x].style = "background-color: #bebfbd;"; } else
                { tb.rows[x].style = "background-color: #dedfdd;"; }
   };
}
function limparInputNotas() { console.log("limparInputNotas");
  if (!tabelas || !tabelas[tarefa][aluno-1]) { return; };
  if (tabelas[tarefa][aluno-1][11] && document.getElementById('revisão').checked) { console.log("revisão");
    var notas = tabelas[tarefa][aluno-1][11];
  } else { console.log("ordinário");
    var notas = tabelas[tarefa][aluno-1];
  };
  if (!Array.isArray(notas)) { notas = notas.split(","); };
  if (notas[1]) { document.getElementById('notaA1').value = notas[1]; }
                            else { document.getElementById('notaA1').value = ""; };
  if (notas[2]) { document.getElementById('notaA2').value = notas[2]; }
                            else { document.getElementById('notaA2').value = ""; };
  if (notas[3]) { document.getElementById('notaB1').value = notas[3]; }
                            else { document.getElementById('notaB1').value = ""; };
  if (notas[4]) { document.getElementById('notaB2').value = notas[4]; }
                            else { document.getElementById('notaB2').value = ""; };
  if (notas[5]) { document.getElementById('notaC1').value = notas[5]; }
                            else { document.getElementById('notaC1').value = ""; };
  if (notas[6]) { document.getElementById('notaC2').value = notas[6]; }
                            else { document.getElementById('notaC2').value = ""; };
  if (notas[7]) { document.getElementById('notaD1').value = notas[7]; }
                            else { document.getElementById('notaD1').value = ""; };
  if (notas[8]) { document.getElementById('notaD2').value = notas[8]; }
                            else { document.getElementById('notaD2').value = ""; };
  if (notas[9]) { document.getElementById('atrasado').checked = notas[9]; }
                            else { document.getElementById('atrasado').checked = false; };
}
function atualizaNota(i) { console.log("atualizaNota");
  if (!tabelas) { return; };
  aluno = parseFloat(document.getElementById('aluno').value);
  if (!aluno || aluno < 1 || aluno > tabelas[tarefa].length) { alert("selecione aluna(o) válido!"); return; };
  var n1 = parseFloat(document.getElementById('notaA1').value);
    if (n1 < 0) { n1 = 0; document.getElementById('notaA1').value = n1; } else
    if (n1 > 10) { n1 = 10; document.getElementById('notaA1').value = n1; };
  var n2 = parseFloat(document.getElementById('notaA2').value);
    if (n2 < 0) { n2 = 0; document.getElementById('notaA2').value = n2; } else
    if (n2 > 10) { n2 = 10; document.getElementById('notaA2').value = n2; };
  var n3 = parseFloat(document.getElementById('notaB1').value);
    if (n3 < 0) { n3 = 0; document.getElementById('notaB1').value = n3; } else
    if (n3 > 10) { n3 = 10; document.getElementById('notaB1').value = n3; };
  var n4 = parseFloat(document.getElementById('notaB2').value);
    if (n4 < 0) { n4 = 0; document.getElementById('notaB2').value = n4; } else
    if (n4 > 10) { n4 = 10; document.getElementById('notaB2').value = n4; };
  var n5 = parseFloat(document.getElementById('notaC1').value);
    if (n5 < 0) { n5 = 0; document.getElementById('notaC1').value = n5; } else
    if (n5 > 10) { n5 = 10; document.getElementById('notaC1').value = n5; };
  var n6 = parseFloat(document.getElementById('notaC2').value);
    if (n6 < 0) { n6 = 0; document.getElementById('notaC2').value = n6; } else
    if (n6 > 10) { n6 = 10; document.getElementById('notaC2').value = n6; };
  var n7 = parseFloat(document.getElementById('notaD1').value);
    if (n7 < 0) { n7 = 0; document.getElementById('notaD1').value = n7; } else
    if (n7 > 10) { n7 = 10; document.getElementById('notaD1').value = n7; };
  var n8 = parseFloat(document.getElementById('notaD2').value);
    if (n8 < 0) { n8 = 0; document.getElementById('notaD2').value = n8; } else
    if (n8 > 10) { n8 = 10; document.getElementById('notaD2').value = n8; };
  if (document.getElementById('revisão').checked) {
    atualizaRevisão();
    if (!Array.isArray(tabelas[tarefa][aluno-1][11])) { tabelas[tarefa][aluno-1][11] = tabelas[tarefa][aluno-1][11].split(","); };
    //console.log(tabelas[tarefa][aluno-1][11]);
    switch (i) {
      case 1: if (isNaN(n1)) { tabelas[tarefa][aluno-1][11][1] = ""; } else
                             { tabelas[tarefa][aluno-1][11][1] = n1; }; qTabelas(tabelas); break;
      case 2: if (isNaN(n2)) { tabelas[tarefa][aluno-1][11][2] = ""; } else
                             { tabelas[tarefa][aluno-1][11][2] = n2; }; qTabelas(tabelas); break;
      case 3: if (isNaN(n3)) { tabelas[tarefa][aluno-1][11][3] = ""; } else
                             { tabelas[tarefa][aluno-1][11][3] = n3; }; qTabelas(tabelas); break;
      case 4: if (isNaN(n4)) { tabelas[tarefa][aluno-1][11][4] = ""; } else
                             { tabelas[tarefa][aluno-1][11][4] = n4; }; qTabelas(tabelas); break;
      case 5: if (isNaN(n5)) { tabelas[tarefa][aluno-1][11][5] = ""; } else
                             { tabelas[tarefa][aluno-1][11][5] = n5; }; qTabelas(tabelas); break;
      case 6: if (isNaN(n6)) { tabelas[tarefa][aluno-1][11][6] = ""; } else
                             { tabelas[tarefa][aluno-1][11][6] = n6; }; qTabelas(tabelas); break;
      case 7: if (isNaN(n7)) { tabelas[tarefa][aluno-1][11][7] = ""; } else
                             { tabelas[tarefa][aluno-1][11][7] = n7; }; qTabelas(tabelas); break;
      case 8: if (isNaN(n8)) { tabelas[tarefa][aluno-1][11][8] = ""; } else
                             { tabelas[tarefa][aluno-1][11][8] = n8; }; qTabelas(tabelas); break;
    };
  } else {
    switch (i) {
      case 1: if (isNaN(n1)) { tabelas[tarefa][aluno-1][1] = ""; } else
                             { tabelas[tarefa][aluno-1][1] = n1; };  qTabelas(tabelas); break;
      case 2: if (isNaN(n2)) { tabelas[tarefa][aluno-1][2] = ""; } else
                             { tabelas[tarefa][aluno-1][2] = n2; }; qTabelas(tabelas); break;
      case 3: if (isNaN(n3)) { tabelas[tarefa][aluno-1][3] = ""; } else
                             { tabelas[tarefa][aluno-1][3] = n3; }; qTabelas(tabelas); break;
      case 4: if (isNaN(n4)) { tabelas[tarefa][aluno-1][4] = ""; } else
                             { tabelas[tarefa][aluno-1][4] = n4; }; qTabelas(tabelas); break;
      case 5: if (isNaN(n5)) { tabelas[tarefa][aluno-1][5] = ""; } else
                             { tabelas[tarefa][aluno-1][5] = n5; }; qTabelas(tabelas); break;
      case 6: if (isNaN(n6)) { tabelas[tarefa][aluno-1][6] = ""; } else
                             { tabelas[tarefa][aluno-1][6] = n6; }; qTabelas(tabelas); break;
      case 7: if (isNaN(n7)) { tabelas[tarefa][aluno-1][7] = ""; } else
                             { tabelas[tarefa][aluno-1][7] = n7; }; qTabelas(tabelas); break;
      case 8: if (isNaN(n8)) { tabelas[tarefa][aluno-1][8] = ""; } else
                             { tabelas[tarefa][aluno-1][8] = n8; }; qTabelas(tabelas); break;
    };
  }
}
function atualizaAtraso() { console.log("atualizaAtraso"); // da interface para o array
  if (!tabelas || !tabelas[tarefa] || !tabelas[tarefa][aluno-1]) { return; };
  tabelas[tarefa][aluno-1][9] = document.getElementById('atrasado').checked;
}
function atualizaRevisão() { console.log("atualiza revisão");
  if (document.getElementById('revisão').checked) { document.getElementById('revisão').checked = false } else // inverte status do botão revisão
                                                  { document.getElementById('revisão').checked = true; };
  atualizaProblemas();
  if (document.getElementById('revisão').checked) { document.getElementById('revisão').checked = false } else // reverte status do botão revisão
                                                  { document.getElementById('revisão').checked = true; };

  if (!tabelas || !tabelas[tarefa] || !tabelas[tarefa][aluno-1] || !document.getElementById('revisão').checked) {
                                    qTabelas(tabelas); limparProblemas(); return; };
  //console.log(tabelas[tarefa][aluno-1][11]);
  var testaNotas = false;
  for (var x=1;x<9;x++) {
    //console.log(typeof tabelas[tarefa][aluno-1][x]);
    if (tabelas[tarefa][aluno-1][x] != "") { testaNotas = true; };
  };
  if (!testaNotas) {
    alert("Discente não possui notas sem atraso!\nA opção revisão será desmarcada.");
    document.getElementById('revisão').checked = false; qTabelas(tabelas); return;
  };
  if (document.getElementById('atrasado').checked) {
    alert("Discente entregou com atraso.\nA opção revisão será desmarcada.");
    document.getElementById('revisão').checked = false; qTabelas(tabelas); return;
  };
  if (!tabelas[tarefa][aluno-1][11]) {
    tabelas[tarefa][aluno-1][11] = [];
    tabelas[tarefa][aluno-1][11][1] = parseFloat(document.getElementById('notaA1').value);
    tabelas[tarefa][aluno-1][11][2] = parseFloat(document.getElementById('notaA2').value);
    tabelas[tarefa][aluno-1][11][3] = parseFloat(document.getElementById('notaB1').value);
    tabelas[tarefa][aluno-1][11][4] = parseFloat(document.getElementById('notaB2').value);
    tabelas[tarefa][aluno-1][11][5] = parseFloat(document.getElementById('notaC1').value);
    tabelas[tarefa][aluno-1][11][6] = parseFloat(document.getElementById('notaC2').value);
    tabelas[tarefa][aluno-1][11][7] = parseFloat(document.getElementById('notaD1').value);
    tabelas[tarefa][aluno-1][11][8] = parseFloat(document.getElementById('notaD2').value);
    tabelas[tarefa][aluno-1][11][9] = false;
  } else if (!Array.isArray(tabelas[tarefa][aluno-1][11])) {
    tabelas[tarefa][aluno-1][11] = tabelas[tarefa][aluno-1][11].split(",");
  };
  for (var r=1;r<9;r++) {
    if (isNaN(tabelas[tarefa][aluno-1][11][r])) { tabelas[tarefa][aluno-1][11][r] = ""; };
  };
  qTabelas(tabelas);
  limparProblemas();
}
function atualizaProblemas() { console.log("atualizaProblemas"); // do formulário para o array
  if (!tabelas || !tabelas[tarefa] || aluno < 1) { return; };
  var form = document.getElementById("fComentarios");
  var prob = [];
  for (var x=0;x<form.length;x++) {
    if (form[x].checked) {
      prob.push(form[x].value);
    };
  };
  //console.log("problemas aluno",aluno, tabelas[tarefa][aluno-1][11]);
  if (!tabelas[tarefa][aluno-1][11]) { tabelas[tarefa][aluno-1][11] = []; };
  if (document.getElementById('revisão').checked) { tabelas[tarefa][aluno-1][11][10] = prob; } else { tabelas[tarefa][aluno-1][10] = prob; };
}
function limparProblemas() { console.log("limparProblemas"); // do Array para o formulário
  var form = document.getElementById("fComentarios");
  if (document.getElementById('revisão').checked && tabelas[tarefa][aluno-1][11]) { //console.log("revisão");
    //if (!tabelas[tarefa][aluno-1][11][10])
    var prob = tabelas[tarefa][aluno-1][11][10];
  } else { //console.log("ordinário");
    var prob = tabelas[tarefa][aluno-1][10];
  };
  if (!Array.isArray(prob)) { prob = prob.split(","); };
  for (var x=0;x<form.length;x++) {
    if (prob.indexOf(form[x].value) != -1) { form[x].checked = true; } else { form[x].checked = false; };
  };
}
function criarTarefa() { console.log("criarTarefa");
  if (!tabelas) {
    var insere = true;
    tabelas = []; tabelas[0] = [];
    while (insere) {
      var disc = window.prompt("Nome da(o) aluna(o)?");
      if (!disc) { insere = false; break; };
      disc = [disc,"","","","","","","","",false,"",[]];
      tabelas[0].push(disc);
    };
  } else {
    var ultima = tabelas.length;
    var totAlunos = tabelas[ultima-1].length;
    tabelas[ultima] = [];
    for (var x=0;x<totAlunos;x++) {
      var disc = [tabelas[ultima-1][x][0],"","","","","","","","",false,"",[]];
      tabelas[ultima].push(disc);
    };
  };
//  tarefa = ultima;
  document.getElementById('tar').value = ultima+1; selecionaTarefa();
  document.getElementById('aluno').value = 1; selecionaAluno();
//  qTabelas(tabelas);
}
