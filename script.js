// Máscara de valor (ativa depois que o DOM carrega)
document.addEventListener('DOMContentLoaded', () => {
  const inputCurrency = document.querySelector('.input-currency');

  IMask(inputCurrency, {
    mask: Number,
    scale: 2,
    signed: false,
    thousandsSeparator: '.',
    padFractionalZeros: true,
    normalizeZeros: true,
    radix: ',',
    mapToRadix: ['.']
  });
});

// Função para buscar as taxas de câmbio
async function buscarTaxas() {
  try {
    document.getElementById('loading').style.display = 'block'; // Mostrar spinner

    const resposta = await fetch('https://api.coingecko.com/api/v3/exchange_rates');
    const dados = await resposta.json();

    // Exibir hora da cotação
    const agora = new Date();
    const dataFormatada = agora.toLocaleString('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short'
    });

    document.getElementById('cotacao-hora').innerText = `Cotação atualizada em: ${dataFormatada}`;

    return {
      real: 1,
      dolar: dados.rates.usd.value,
      euro: dados.rates.eur.value,
      bitcoin: dados.rates.btc.value,
      franco: dados.rates.chf.value,
      riyal: dados.rates.sar.value,
      rublo: dados.rates.rub.value
    };
  } catch (erro) {
    alert('⚠️ Erro ao buscar as cotações. Tente novamente mais tarde.');
    console.error('Erro na API:', erro);
    return null;
  } finally {
    document.getElementById('loading').style.display = 'none'; // Esconder spinner
  }
}

// Função principal de conversão
async function converterMoeda() {
  const valorInput = document.querySelector('.input-currency').value;
  const moedaOrigem = document.querySelector('#from-currency').value;
  const moedaDestino = document.querySelector('#to-currency').value;
  const valorReal = parseFloat(valorInput.replace('.', '').replace(',', '.'));

  // Aplica skeleton enquanto carrega
  const elementosSkeleton = [
    document.querySelector('.currency-value-to-convert'),
    document.getElementById('currency-name'),
    document.querySelector('.currency-value'),
    document.getElementById('currency-converted-name')
  ];
  elementosSkeleton.forEach(el => el.classList.add('skeleton'));

  const taxas = await buscarTaxas();
  if (!taxas) return;

  if (isNaN(valorReal) || valorReal <= 0) {
    alert("Por favor, insira um valor válido.");
    elementosSkeleton.forEach(el => el.classList.remove('skeleton'));
    return;
  }

  let valorConvertido;
  if (moedaOrigem === moedaDestino) {
    valorConvertido = valorReal;
  } else {
    const valorEmReais = moedaOrigem === 'real' ? valorReal : valorReal * taxas[moedaOrigem];
    valorConvertido = moedaDestino === 'real' ? valorEmReais : valorEmReais / taxas[moedaDestino];
  }

  const simbolos = {
    real: 'R$',
    dolar: 'US$',
    euro: '€',
    bitcoin: '₿',
    franco: 'CHF',
    riyal: 'SAR',
    rublo: '₽'
  };

  const nomes = {
    real: 'Real',
    dolar: 'Dólar',
    euro: 'Euro',
    bitcoin: 'Bitcoin',
    franco: 'Franco Suíço',
    riyal: 'Riyal Saudita',
    rublo: 'Rublo Russo'
  };

  const imagemMoedas = {
    real: 'real.jpg',
    dolar: 'dolar.jpg',
    euro: 'euro.jpg',
    bitcoin: 'bitcoin.jpg',
    franco: 'franco-suico.jpg',
    riyal: 'riyal-saudita.jpg',
    rublo: 'rublo.jpeg'
  };

  // Atualiza os elementos do DOM
  document.querySelector('.currency-value-to-convert').innerText = `${simbolos[moedaOrigem]} ${valorReal.toFixed(2)}`;
  document.getElementById('currency-name').innerText = nomes[moedaOrigem];
  document.querySelectorAll('.currency-img')[0].src = `./assets/${imagemMoedas[moedaOrigem]}`;

  document.querySelector('.currency-value').innerText = `${simbolos[moedaDestino]} ${valorConvertido.toFixed(2)}`;
  document.getElementById('currency-converted-name').innerText = nomes[moedaDestino];
  document.getElementById('currency-converted-img').src = `./assets/${imagemMoedas[moedaDestino]}`;

  // Remove skeleton
  elementosSkeleton.forEach(el => el.classList.remove('skeleton'));
}

// Ativa o botão de conversão
document.querySelector('.convert-button').addEventListener('click', converterMoeda);

// Também permite converter ao pressionar Enter dentro do campo de valor
document.querySelector('.input-currency').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    converterMoeda();
  }
});


  