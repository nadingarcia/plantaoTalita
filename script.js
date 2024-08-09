const listaEmpresas = document.getElementById('lista-empresas');
const btnAdicionarEmpresa = document.getElementById('btn-adicionar-empresa');
const modalEmpresa = document.getElementById('modal-empresa');
const btnSalvarEmpresa = document.getElementById('salvar-empresa');
const selectEmpresaPlantao = document.getElementById('empresa-plantao');
const btnAdicionarPlantao = document.getElementById('btn-adicionar-plantao');
const plantaoesAdicionadosList = document.getElementById('plantoes-adicionados');
const totalMensalElement = document.getElementById('total-mensal');
const modalTitulo = document.getElementById('modal-titulo');
const idEmpresaInput = document.getElementById('id-empresa');
const filtroMesSelect = document.getElementById('filtroMes');

let empresas = JSON.parse(localStorage.getItem('empresas')) || [];
let plantoes = JSON.parse(localStorage.getItem('plantoes')) || [];

const dataPlantaoInput = document.getElementById('data-plantao');
const fp = flatpickr(dataPlantaoInput, {
    mode: "multiple",
    dateFormat: "d/m", // Define o formato de data para exibição
    onChange: function(selectedDates, dateStr, instance) {
      instance.input.value = dateStr; 
    }
  });

// Abre o calendário ao clicar no input
dataPlantaoInput.addEventListener('click', () => {
    fp.open(); // Abre o flatpickr quando o input for clicado
});

// Abre o modal para adicionar uma nova empresa
btnAdicionarEmpresa.addEventListener('click', () => {
    modalTitulo.textContent = 'Adicionar Empresa';
    idEmpresaInput.value = '';
    document.getElementById('nome-empresa').value = '';
    document.getElementById('cnpj-empresa').value = '';
    document.getElementById('valor-empresa').value = '';
    modalEmpresa.style.display = 'block';
});

// Fecha o modal ao clicar fora dele
window.onclick = (event) => {
    if (event.target == modalEmpresa) {
        modalEmpresa.style.display = 'none';
    }
};

// Salva uma nova empresa no Local Storage
btnSalvarEmpresa.addEventListener('click', () => {
    const idEmpresa = idEmpresaInput.value;
    const nomeEmpresa = document.getElementById('nome-empresa').value;
    const cnpjEmpresa = document.getElementById('cnpj-empresa').value;
    const valorEmpresa = parseFloat(document.getElementById('valor-empresa').value);

    if (idEmpresa) {
        // Editando uma empresa existente
        const index = empresas.findIndex(emp => emp.id === idEmpresa);
        empresas[index] = {
            id: idEmpresa,
            nome: nomeEmpresa,
            cnpj: cnpjEmpresa,
            valor: valorEmpresa
        };
    } else {
        // Adicionando uma nova empresa
        const novaEmpresa = {
            id: Date.now().toString(), // Gerando um ID único
            nome: nomeEmpresa,
            cnpj: cnpjEmpresa,
            valor: valorEmpresa
        };
        empresas.push(novaEmpresa);
    }

    if (!(novaEmpresa.id in coresEmpresas)) {
        coresEmpresas[novaEmpresa.id] = gerarCorAleatoria();
      }

    localStorage.setItem('empresas', JSON.stringify(empresas));
    carregarEmpresas();
    atualizarSelectEmpresas();
    modalEmpresa.style.display = 'none';
    atualizarLegendaCalendario(); // Atualiza a legenda
    atualizarCalendario();
});

// Carrega as empresas do Local Storage e exibe na lista
function carregarEmpresas() {
    listaEmpresas.innerHTML = ''; // Limpa a lista existente
    empresas.forEach((empresa) => {
      const li = document.createElement('li');
      li.innerHTML = `
          <div>
            ${empresa.nome} - CNPJ: ${empresa.cnpj} - R$ ${empresa.valor.toFixed(2)}
          </div>
          <div style="display: flex;">
            <button onclick="editarEmpresa('${empresa.id}')">Editar</button>
            <button onclick="excluirEmpresa('${empresa.id}')">Excluir</button>
          </div>
      `;
      listaEmpresas.appendChild(li);
  
      // Gerar cores para empresas que ainda não têm
      if (!(empresa.id in coresEmpresas)) {
        coresEmpresas[empresa.id] = gerarCorAleatoria();
      }
    });
  
    atualizarLegendaCalendario(); // Atualiza a legenda com as novas empresas
  }

// Abre o modal para editar uma empresa
function editarEmpresa(id) {
    const empresa = empresas.find(emp => emp.id === id);
    modalTitulo.textContent = 'Editar Empresa';
    idEmpresaInput.value = empresa.id;
    document.getElementById('nome-empresa').value = empresa.nome;
    document.getElementById('cnpj-empresa').value = empresa.cnpj;
    document.getElementById('valor-empresa').value = empresa.valor;
    modalEmpresa.style.display = 'block';
}

// Exclui uma empresa
function excluirEmpresa(id) {
    if (confirm("Tem certeza que deseja excluir esta empresa?")) {
        empresas = empresas.filter(emp => emp.id !== id);
        localStorage.setItem('empresas', JSON.stringify(empresas));
        carregarEmpresas();
        atualizarSelectEmpresas();
    }
}

// Atualiza as opções do select de empresas no formulário de plantões
function atualizarSelectEmpresas() {
    selectEmpresaPlantao.innerHTML = '';
    empresas.forEach(empresa => {
        const option = document.createElement('option');
        option.value = empresa.id;
        option.textContent = empresa.nome;
        selectEmpresaPlantao.appendChild(option);
    });
}

// Adiciona um novo plantão
btnAdicionarPlantao.addEventListener('click', () => {
    const datasPlantao = fp.selectedDates;
    const empresaId = document.getElementById('empresa-plantao').value;

    const empresa = empresas.find(emp => emp.id === empresaId);

    if (!empresa) {
        alert('Selecione uma empresa válida.');
        return;
    }

    datasPlantao.forEach(dataSelecionada => {
        const dia = dataSelecionada.getDate();
        const mes = dataSelecionada.getMonth() + 1; 
        const ano = dataSelecionada.getFullYear();

        const novoPlantao = {
            data: dataSelecionada.toISOString().slice(0, 10),
            dia: dia,
            mes: mes,
            ano: ano,
            empresaId: empresaId,
            empresaNome: empresa.nome,
            valor: empresa.valor
        };

        plantoes.push(novoPlantao);
    });

    localStorage.setItem('plantoes', JSON.stringify(plantoes));
    carregarPlantoes();
    atualizarTotalMensal();

    document.getElementById('empresa-plantao').selectedIndex = 0; 
    fp.clear(); // Limpa as datas selecionadas no flatpickr
});
// Carrega os plantões do Local Storage e exibe na lista
function carregarPlantoes() {
    plantaoesAdicionadosList.innerHTML = '';

    const mesSelecionado = parseInt(filtroMesSelect.value);

    // Filtra os plantões pelo mês selecionado
    const plantoesFiltrados = plantoes.filter((plantao) => {
        return mesSelecionado === 0 || plantao.mes === mesSelecionado;
    });

    // Função para comparar a data de dois plantões (usado no sort)
    function compararPorData(a, b) {
      const dataA = new Date(a.ano, a.mes - 1, a.dia); // Corrigido: Adicionados ano, mês e dia
      const dataB = new Date(b.ano, b.mes - 1, b.dia); // Corrigido: Adicionados ano, mês e dia

      return dataA - dataB; // Comparação direta entre datas
    }

    // Ordena os plantões filtrados por data
    plantoesFiltrados.sort(compararPorData);

    plantoesFiltrados.forEach((plantao) => {
        const li = document.createElement('li');
        li.style = "flex-direction: row;";
        li.textContent = `Dia ${plantao.dia}/${plantao.mes}/${plantao.ano} - ${plantao.empresaNome} - R$ ${plantao.valor.toFixed(2)}`; // Corrigido: Adicionado o ano

        // Cria um botão de exclusão
        const button = document.createElement('button');
        button.textContent = 'Excluir';
        button.onclick = () => excluirPlantao(plantao.data); 
        button.style = "background-color: red; color: white;";

        // Adiciona o botão à lista
        li.appendChild(button);

        // Adiciona a lista ao HTML
        plantaoesAdicionadosList.appendChild(li);
    });
}

function excluirPlantao(data) {
    if (confirm("Tem certeza que deseja excluir este plantão?")) {
        // Remove o plantão do array de plantões
        plantoes = plantoes.filter(plantao => plantao.data !== data);

        // Atualiza o Local Storage
        localStorage.setItem('plantoes', JSON.stringify(plantoes));

        // Carrega novamente os plantões
        carregarPlantoes();

        // Atualiza o total mensal
        atualizarTotalMensal();
    }
}

// Atualiza o total mensal
function atualizarTotalMensal() {
    const mesSelecionado = parseInt(filtroMesSelect.value);
    let total = 0;

    if (mesSelecionado === 0) {
        // Calcula o total para todos os meses
        total = plantoes.reduce((sum, plantao) => sum + plantao.valor, 0);
    } else {
        // Calcula o total apenas para o mês selecionado
        total = plantoes
            .filter(plantao => plantao.mes === mesSelecionado)
            .reduce((sum, plantao) => sum + plantao.valor, 0);
    }

    totalMensalElement.textContent = total.toFixed(2);
}

const dataAtual = new Date();
const mesAtual = dataAtual.getMonth() + 1; // +1 porque getMonth() retorna de 0 a 11

filtroMesSelect.id = 'filtroMes'; // Define o ID para o select

// Adiciona as opções de meses ao select
const meses = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

for (let i = 0; i < meses.length; i++) {
  const option = document.createElement('option');
  option.value = i + 1; // Define o valor como número do mês (1 a 12)
  option.text = meses[i];
  filtroMesSelect.add(option);

  // Define o mês atual como selecionado
  if (i + 1 === mesAtual) {
    option.selected = true;
  }
}

// Adiciona um evento de mudança ao filtro de mês
filtroMesSelect.addEventListener('change', () => {
    carregarPlantoes(); // Recarrega a lista de plantões
    atualizarTotalMensal(); // Atualiza o total
});

const adicionaPlanBtn = document.getElementById('adicionaPlan');
// Captura o modal de plantão
const modalPlantao = document.getElementById('modal-plantao');

// Adiciona um evento de clique ao botão
adicionaPlanBtn.addEventListener('click', () => {
  modalPlantao.style.display = 'block';
});

// Função para fechar o modal de plantão
function fecharModalPlantao() {
  modalPlantao.style.display = 'none';
}

// Função para fechar o modal de empresa
function fecharModalEmpresa() {
    modalEmpresa.style.display = 'none';
  }

  const calendario = document.getElementById('calendario');
  const calendarioInstance = flatpickr(calendario, {
    inline: true, 
    onDayCreate: function(dObj, dStr, fp, dayElem) {
      // Verifica se o dia tem plantão
      const plantaoDoDia = plantoes.find(p => p.data === fp.formatDate(dayElem.dateObj, "Y-m-d"));
  
      // Se tiver plantão, adiciona a classe e o nome da empresa ao elemento do dia
      if (plantaoDoDia) {
        dayElem.classList.add('tem-plantao');
        dayElem.dataset.empresa = plantaoDoDia.empresaNome; 
      }
    }
  });
  
  // Função para atualizar o calendário (chame sempre que os plantões mudarem)
  function atualizarCalendario() {
    calendarioInstance.redraw(); // Redesenha o calendário para aplicar as mudanças
  }

  function criarGraficoPizza(dados) {
    const canvas = document.getElementById('graficoPizza');
    canvas.width = 390; // Largura em pixels
    canvas.height = 150; 
    const ctx = canvas.getContext('2d');
  
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: dados.map(item => item.mes), // Nomes dos meses
            datasets: [{
                label: 'Faturamento por Mês',
                data: dados.map(item => item.total), // Valores de faturamento
                options: {
                    maintainAspectRatio: false, // Desativa a proporção de aspecto fixa
                    responsive: true, // Torna o gráfico responsivo
                    // ... outras opções
                  },
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)', // Cor para o primeiro mês
                    'rgba(54, 162, 235, 0.2)', // Cor para o segundo mês
                    'rgba(255, 206, 86, 0.2)', // Cor para o terceiro mês
                    // ... adicione mais cores se necessário
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    // ... adicione mais cores se necessário
                ],
                borderWidth: 1
            }]
        },
    });
  }
  
  // Função para calcular o faturamento por mês
  function calcularFaturamentoPorMes() {
    const faturamentoPorMes = {};
  
    plantoes.forEach(plantao => {
      const mes = plantao.mes; 
      if (faturamentoPorMes[mes]) {
        faturamentoPorMes[mes] += plantao.valor;
      } else {
        faturamentoPorMes[mes] = plantao.valor;
      }
    });
  
    // Converter o objeto em um array de objetos
    const dadosDoGrafico = Object.keys(faturamentoPorMes).map(mes => ({
      mes: mes, // Nome do mês (ex: "1", "2", "3"...)
      total: faturamentoPorMes[mes] // Valor total do mês
    }));
  
    return dadosDoGrafico;
  }
  
  // Chame a função para criar o gráfico após carregar seus dados
  const dadosDoGrafico = calcularFaturamentoPorMes();
  criarGraficoPizza(dadosDoGrafico);

  const coresEmpresas = {};

// Função para gerar uma cor hexadecimal aleatória
function gerarCorAleatoria() {
  const letras = '0123456789ABCDEF';
  let cor = '#';
  for (let i = 0; i < 6; i++) {
    cor += letras[Math.floor(Math.random() * 16)];
  }
  return cor;
}

// Função para atualizar a legenda do calendário
function atualizarLegendaCalendario() {
  const legendaContainer = document.querySelector('.legenda-calendario'); // Seleciona a div da legenda
  legendaContainer.innerHTML = ''; // Limpa a legenda existente

  for (const empresaId in coresEmpresas) {
    const legendaItem = document.createElement('div');
    legendaItem.classList.add('legenda-item');

    const legendaCor = document.createElement('div');
    legendaCor.classList.add('legenda-cor');
    legendaCor.style.backgroundColor = coresEmpresas[empresaId];

    const legendaTexto = document.createElement('span');
    const empresa = empresas.find(emp => emp.id === empresaId);
    legendaTexto.textContent = empresa.nome; // Exibe o nome da empresa

    legendaItem.appendChild(legendaCor);
    legendaItem.appendChild(legendaTexto);
    legendaContainer.appendChild(legendaItem);
  }
}

const calendarioContainer = document.getElementById('calendario-container');
const legendaContainer = document.createElement('div');
legendaContainer.classList.add('legenda-calendario');
calendarioContainer.appendChild(legendaContainer);

atualizarSelectEmpresas();
atualizarTotalMensal();
carregarEmpresas();
carregarPlantoes();