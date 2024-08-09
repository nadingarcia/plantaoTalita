const listaEmpresas = document.getElementById('lista-empresas');
const btnAdicionarEmpresa = document.getElementById('btn-adicionar-empresa');
const modalEmpresa = document.getElementById('modal-empresa');
const fecharModal = document.querySelector('.fechar-modal');
const btnSalvarEmpresa = document.getElementById('salvar-empresa');
const selectEmpresaPlantao = document.getElementById('empresa-plantao');
const btnAdicionarPlantao = document.getElementById('btn-adicionar-plantao');
const plantaoesAdicionadosList = document.getElementById('plantoes-adicionados');
const totalMensalElement = document.getElementById('total-mensal');
const modalTitulo = document.getElementById('modal-titulo');
const idEmpresaInput = document.getElementById('id-empresa');
const filtroMesSelect = document.getElementById('filtroMes'); // Substitua 'filtroMes' pelo ID do seu select

let empresas = JSON.parse(localStorage.getItem('empresas')) || [];
let plantoes = JSON.parse(localStorage.getItem('plantoes')) || [];

const dataPlantaoInput = document.getElementById('data-plantao');
const fp = flatpickr(dataPlantaoInput, { // Passa o elemento como primeiro argumento
    mode: "multiple", 
    dateFormat: "Y-m-d", 
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

// Fecha o modal
fecharModal.addEventListener('click', () => {
    modalEmpresa.style.display = 'none';
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

    localStorage.setItem('empresas', JSON.stringify(empresas));
    carregarEmpresas();
    atualizarSelectEmpresas();
    modalEmpresa.style.display = 'none';
});

// Carrega as empresas do Local Storage e exibe na lista
function carregarEmpresas() {
    listaEmpresas.innerHTML = '';
    empresas.forEach((empresa) => {
        const li = document.createElement('li');
        li.innerHTML = `
            ${empresa.nome} - CNPJ: ${empresa.cnpj} - R$ ${empresa.valor.toFixed(2)}
            <div style="display: flex";>
                <button onclick="editarEmpresa('${empresa.id}')">Editar</button>
                <button onclick="excluirEmpresa('${empresa.id}')">Excluir</button>
            </div>
        `;
        listaEmpresas.appendChild(li);
    });
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

atualizarSelectEmpresas();
atualizarTotalMensal();
carregarEmpresas();
carregarPlantoes();