urlBase = 'https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/CotacaoMoedaPeriodo(moeda=@moeda,dataInicial=@dataInicial,dataFinalCotacao=@dataFinalCotacao)?'



function montarString(){
    // Checa se data inicial menor que final
    checaData()
    // Mudando as datas para o formato correto
    inicio = inicio.split('-')
    inicio = inicio[1] + '-' + inicio[2] + '-' + inicio[0]
    final = final.split('-')
    final = final[1] + '-' + final[2] + '-' + final[0]
    console.log(inicio, final)

    // Checando moedas selecionadas
    let moedas = checaCheckbox()
    console.log(moedas)

    // Monta url
    while(moedas.length){
        let moeda = moedas.pop()
        url = urlBase + "@moeda='" + moeda + "'&@dataInicial='" + inicio + "'&@dataFinalCotacao='" + final + "'&$top=10000&$skip=0&$format=json&$select=cotacaoVenda,dataHoraCotacao"
        console.log(url)
        startRequest(url,moeda)
    }
}

function checaData(){
    let dataI = new Date(document.getElementById('tInicial').value)
    let dataF = new Date(document.getElementById('tFinal').value)
    //se o dia inicial for depois do dia final, inverte e dá um alerta
    if(dataI>dataF){
        inicio = document.getElementById('tFinal').value
        final = document.getElementById('tInicial').value
        window.alert('CUIDADO: Data inicial posterior a data final!')
    }
    else{
        inicio = document.getElementById('tInicial').value
        final = document.getElementById('tFinal').value
    }

}

function checaCheckbox(){
    let dolar = document.getElementById('dolar')
    let euro = document.getElementById('euro')
    let libra = document.getElementById('libra')
    let retorno = []
    if(dolar.checked)
        retorno.push(dolar.value)
    if(euro.checked)
        retorno.push(euro.value)
    if(libra.checked)
        retorno.push(libra.value)
    if(!retorno.length)
        window.alert('ERRO: Selecione ao menos 1 moeda!')
    return retorno
}

function startRequest(url,moeda){
    let request = new XMLHttpRequest()
    
    request.open('GET',url)
    request.responseType = 'json'
    request.send()
    request.onload = function(){
        let jsonMsg = request.response.value
        google.charts.load('current',{'packages':['corechart']})
        montarTabela(jsonMsg,moeda)
        console.log(moeda)

        //desenha gráfico
        let array = [['Data','Cotacao']] //prepara vetor de dados
        for (let k = 0;k<jsonMsg.length;k++){
            data = new Date(jsonMsg[k].dataHoraCotacao)
            cotacao = parseFloat(jsonMsg[k].cotacaoVenda)
            array.push([data,cotacao])
        }
        google.charts.load('current',{'packages':['corechart']})
        
        if(moeda == 'USD'){
            dolar = array
            google.charts.setOnLoadCallback(montarDolar)
        }
        if(moeda == 'EUR'){
            euro = array
            google.charts.setOnLoadCallback(montarEuro)
        }
        if(moeda=='GBP'){
            libra = array
            google.charts.setOnLoadCallback(montarLibra)}
        }

}

function montarTabela(jsonData,moeda){
    let area = document.getElementById('areaDeTabelas')
    let span
    let id = moeda+'Table'
    try{
        span = document.getElementById(id)
        span.innerHTML = ''
    }
    catch{
        //cria div para a moeda
        span = document.createElement('span')
    
        span.setAttribute('id', id)
        area.appendChild(span)
    }

    //Adiciona o nome da moeda
    let titulo = document.createElement('h2')
    titulo.innerText = moeda
    span.appendChild(titulo)
    //Cria tabela
    let tabela = document.createElement('table')
    //Cria header
    let tr = document.createElement('tr')
    
    tabela.appendChild(tr)
    let th = document.createElement('th')
    th.classList.add('tableData')
    th.innerText = 'Data/Hora'
    tr.appendChild(th)
    th = document.createElement('th')
    th.classList.add('tableData')
    th.innerText = 'Cotação Venda'
    tr.appendChild(th)

    for (k=0;k<jsonData.length;k++){
        //Insere os valores nas linhas
        let tr = document.createElement('tr')
        tabela.appendChild(tr)
        let td = document.createElement('td')
        td.innerText=jsonData[k].dataHoraCotacao
        td.classList.add('cotacaoData')
        //console.log(jsonData[k].dataHoraCotacao)
        tr.appendChild(td)
        td = document.createElement('td')
        td.innerText=jsonData[k].cotacaoVenda
        td.classList.add('cotacaoData')
        tr.appendChild(td)
    }
    span.appendChild(tabela)
}

function montarDolar(){
    let options = {
        title: 'Cotação do Dólar',
        legend: {position:'bottom'},
        backgroundColor: '#f7e5bf'
    }
    let div = document.createElement('div')
    div.setAttribute('id', 'dolarGraph')
    console.log('cheguei')
    let areaGraph = document.getElementById('areaDeGraficos')
    areaGraph.appendChild(div)
    let chart = new google.visualization.LineChart(document.getElementById('dolarGraph'))
    dadoGC = google.visualization.arrayToDataTable(dolar)
    chart.draw(dadoGC,options)
}

function montarEuro(){
    let options = {
        title: 'Cotação do Euro',
        legend: {position:'bottom'},
        backgroundColor: '#f7e5bf'
    }
    let div = document.createElement('div')
    div.setAttribute('id', 'euroGraph')
    console.log('cheguei')
    let areaGraph = document.getElementById('areaDeGraficos')
    areaGraph.appendChild(div)
    let chart = new google.visualization.LineChart(document.getElementById('euroGraph'))
    dadoGC = google.visualization.arrayToDataTable(euro)
    chart.draw(dadoGC,options)
}

function montarLibra(){
    let options = {
        title: 'Cotação da Libra',
        legend: {position:'bottom'},
        backgroundColor: '#f7e5bf'
    }
    let div = document.createElement('div')
    div.setAttribute('id', 'libraGraph')
    console.log('cheguei')
    let areaGraph = document.getElementById('areaDeGraficos')
    areaGraph.appendChild(div)
    let chart = new google.visualization.LineChart(document.getElementById('libraGraph'))
    dadoGC = google.visualization.arrayToDataTable(libra)
    chart.draw(dadoGC,options)
}