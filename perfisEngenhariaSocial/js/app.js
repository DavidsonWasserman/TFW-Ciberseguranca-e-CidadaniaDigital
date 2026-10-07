const pagina = document.body.dataset.pagina;

// Cria elementos e insere textos sem interpretar HTML.
function criarElemento(tag, classe, texto) {
  const elemento = document.createElement(tag);

  if (classe) elemento.className = classe;
  if (texto !== undefined) elemento.textContent = texto;

  return elemento;
}

function criarAvatar(perfil) {
  const imagem = criarElemento("img", "avatar");
  imagem.src = perfil.foto;
  imagem.alt = `Foto de ${perfil.nome}`;
  return imagem;
}

function enderecoPerfil(rede, id) {
  return `${rede}.html?perfil=${encodeURIComponent(id)}`;
}

function carregarInicio() {
  const lista = document.querySelector("#lista-perfis");

  for (const [id, perfil] of Object.entries(perfis)) {
    const cartao = criarElemento("article", "cartao");
    const acoes = criarElemento("div", "acoes");

    for (const rede of ["instagram", "twitter"]) {
      const nomeRede = rede === "instagram" ? "Instagram" : "Twitter";
      const link = criarElemento("a", "botao", nomeRede);

      link.href = enderecoPerfil(rede, id);
      link.setAttribute("aria-label", `${nomeRede} de ${perfil.nome}`);
      acoes.append(link);
    }

    cartao.append(
      criarAvatar(perfil),
      criarElemento("h2", "", perfil.nome),
      acoes
    );

    lista.append(cartao);
  }
}

function carregarPerfil() {
  const parametros = new URLSearchParams(window.location.search);
  const id = parametros.get("perfil");

  const perfil = Object.hasOwn(perfis, id) ? perfis[id] : null;

  if (!perfil) {
    const aviso = criarElemento("h1", "", "Perfil não encontrado.");
    const voltar = criarElemento("a", "", "Voltar para a seleção");
    voltar.href = "index.html";

    document.querySelector("main").replaceChildren(aviso, voltar);
    return;
  }

  const rede = perfil[pagina];
  const nomeRede = pagina === "instagram" ? "Instagram" : "Twitter";

  document.title = `${perfil.nome} | ${nomeRede} simulado`;

  const informacoes = criarElemento("div");
  const estatisticas = criarElemento("div", "estatisticas");

  const numeros = [
    `${rede.publicacoes.length} publicações`,
    `${rede.seguidores.toLocaleString("pt-BR")} seguidores`,
    `${rede.seguindo.toLocaleString("pt-BR")} seguindo`
  ];

  for (const numero of numeros) {
    estatisticas.append(criarElemento("span", "", numero));
  }

  informacoes.append(
    criarElemento("h1", "", perfil.nome),
    criarElemento("p", "usuario", `@${rede.usuario}`),
    criarElemento("p", "", rede.bio),
    estatisticas
  );

  document.querySelector("#perfil").append(
    criarAvatar(perfil),
    informacoes
  );

  const outraRede = pagina === "instagram" ? "twitter" : "instagram";

  document.querySelector("#outra-rede").href =
    enderecoPerfil(outraRede, id);

  const lista = document.querySelector("#publicacoes");

  for (const postagem of rede.publicacoes) {
    const artigo = criarElemento("article", "publicacao");

    if (pagina === "instagram") {
      const imagem = criarElemento("img");
      imagem.src = postagem.imagem;
      imagem.alt = postagem.alt;
      imagem.loading = "lazy";
      artigo.append(imagem);
    } else {
      artigo.append(
        criarElemento("strong", "", perfil.nome),
        criarElemento("p", "usuario", `@${rede.usuario}`)
      );
    }

    artigo.append(criarElemento("p", "", postagem.texto));

    if (postagem.data) {
      const data = criarElemento("time", "", postagem.dataTexto);
      data.dateTime = postagem.data;
      artigo.append(data);
    }

    lista.append(artigo);
  }
}

if (pagina === "inicio") {
  carregarInicio();
} else if (pagina === "instagram" || pagina === "twitter") {
  carregarPerfil();
}