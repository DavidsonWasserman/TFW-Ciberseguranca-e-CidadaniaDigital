//oq falta: montar gabarito ajustar perfis 
//exibir a tela de resposta mostrando a pontuacao, oq a pessoa errou e acertou, e o tempo parar quando for clicado o botao de enviar



//variaveis
let tempoRestante  = 180;
let intervalo = null;
let tempoAcabou = false;

//cuida do cronometro
function contagem(){
    if (tempoRestante > 0){
        tempoRestante--;
        const minutos = Math.floor(tempoRestante / 60);
        const segundos = tempoRestante % 60;

        const minFormatado = minutos < 10 ? `0${minutos}` : minutos;
        const segFormatado = segundos < 10 ? `0${segundos}` : segundos;

        tempo.innerText = `${minFormatado}:${segFormatado}`;
    }else{
        clearInterval(intervalo);
        intervalo = null;
        alert("O tempo acabou! Envie suas respostas");
        tempoAcabou = true;
        BloquearSelecao();
    }
    
}

//submit da resposta (incompleto)
function CompararResposta(){
    const gabarito = {
        "Marina" : {
            nome: "Marina",
            idade: 17,
            localizacao: "Rio das ostras",
            hobby: "Volei",
            time: "Flamengo",
            profissao: "Estudante"
        }

    };
    const campos = [
    "nome",
    "idade",
    "localizacao",
    "hobbie",
    "time",
    "ocupacao"
    ];
    
    const perfis = document.querySelectorAll(".perfil-container")
    const marina = perfis[0];
    const paiDoDuck = perfis[1];
    const bia = perfis[2];
    const lucas = perfis[3];
    const catia = perfis[4];

}

//bloqueia as opcoes quando o tempo acaba
function BloquearSelecao(){
    document.querySelectorAll("select").forEach(select => {  
            select.disabled = true
        });
    
}


//pega os botoes
const btnIniciar = document.getElementById("iniciar");
const btnEnviar = document.getElementById("enviar");

//pega o tempo
const tempo = document.getElementById("cronometro");



btnIniciar.addEventListener("click", () =>{
    if (tempoRestante == 0 || intervalo !== null) return;
    
    intervalo = setInterval(contagem,1000);
});



btnEnviar.addEventListener("click",()=>{
    if (tempoAcabou){
        CompararResposta();
    }

    const confirmou = confirm(
        "Tem certeza de que deseja enviar suas respostas?"
    )
    if (confirmou) CompararResposta();
})

