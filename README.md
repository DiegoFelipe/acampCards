# AcampCards - Jogo Dinâmico de Cartas (Tema Bíblico/Cyberpunk)

Um jogo de tabuleiro digital interativo onde **4 Equipes** batalham contra **9 Cartas de Pecados** (Inveja, Mentira, Orgulho, etc.) usando **Códigos de Armas Espirituais**. 

O jogo mistura a temática cristã do acampamento com um design estilo "Matrix/Hacker" (`0101%$#@`), oferecendo uma experiência imersiva com efeitos sonoros sintéticos, animações de destruição em 3D, varreduras (scan) na tela e muito mais.

## 🎯 Regras Básicas do Jogo

1. **Equipes**: 
   - 1 = Azul
   - 2 = Vermelho
   - 3 = Verde
   - 4 = Amarelo
2. **Sistema de Combate**:
   As equipes recebem fisicamente cartas de armas. No painel principal do jogo, devem digitar:
   - Número da equipe (1 a 4).
   - Número do pecado alvo (1 a 9).
   - O **código de 7 dígitos** presente na carta da arma.
3. **Tipos de Armas**:
   Diferentes tipos de armas (indicados pelo primeiro número do código) causam efeitos variados:
   - Dano numérico direto (ex: tira 50, 100 de vida).
   - Cortes diretos (ex: reduz a vida máxima da carta pela metade).
   - **Efeito Congelar (❄️)**: Trava o pecado.
   - **Efeito Veneno (☠️)**: O pecado recebe dano passivo ao ser atacado por outras armas.
   - **Lupa da Verdade (🔍 - Arma tipo 6)**: Permite que a equipe veja a "Vida Atual" e os status ocultos (congelado/envenenado) do pecado alvo durante um contador de 15 segundos na tela.
4. **Destruição e Drops**:
   Quando a vida de uma carta de Pecado chega a 0:
   - Ela roda uma animação explosiva de conclusão acompanhada de efeitos sonoros de vitória.
   - A equipe recebe "Drops" de recompensas com base na vida total do monstro (1 drop a cada 50 de HP).
   - Os Drops podem ser de **3 Tipos**:
     - **Tipo 1**: Perguntas Bíblicas/Bônus (surgem na hora na tela).
     - **Tipo 2**: Cartas de Arma (Armazenadas automaticamente para a equipe no BD).
     - **Tipo 3**: Cartas Lupa (Armazenadas automaticamente para a equipe no BD).

## 🧩 Sistema de Perguntas & Jackpot Matrix

**Painel de Perguntas**: 
Quando uma equipe ganha drops do Tipo 1 (Perguntas), um painel lateral se abre.
- **Temporizador**: A equipe tem 30 segundos exatos para responder; nos últimos segundos o texto pisca em vermelho sinalizando urgência. 
- **Respostas**: Devem usar o teclado numérico de `1` a `5`. Se digitarem qualquer outra tecla, um *Alien Toast* (👽) surge informando que a tecla é inválida. Se acabar o tempo, conta como resposta "errada".
- **Efeitos Sonoros**: Arpejo de sucesso maior para respostas certas; zumbido/buzz grave descendente caso errem. Cada acerto concede bônus de pontos!

**Toast de Recompensas (Jackpot Matrix)**: 
Após destruir um pecado (e responder às perguntas, se houver), a equipe vê os drops de materiais que ganhou (Tipos 2 e 3):
- A janela aparece e os dados são "embaralhados" freneticamente no estilo código da Matrix (`!@#01%$`) junto com sons de varredura `ticking/scanner` cyberpunk por 2 segundos.
- Por fim a mensagem "trava" exibindo o resultado real por alguns segundos antes de iniciar o próximo turno (ex: `🎁 RECOMPENSAS: 2x Armas e 1x Lupa`).

---

## 🔐 Painéis de Administração (Senha: `na2626`)

Para organizar o jogo paralelo (CRUD e entregas físicas), a aplicação conta com rotas protegidas no frontend para os organizadores (`/admin/...`). Quando solicitarem, exiba apenas a senha correta acima.

### 1. CRUD de Perguntas (`/admin/questions`)
- Página com uma bela interface que permite Adicionar, Visualizar, Editar e Excluir as questões (prompt, 5 alternativas, alternativa correta).
- Todas salvas no banco de dados local SQLite (`game.db`).

### 2. Entrega de Recompensas (`/admin/rewards`)
- Painel "Dashboard" com a evolução em tempo real das recompensas estocadas pelas 4 equipes.
- Exibe os contadores automáticos de **Armas** e **Lupas** farmadas por equipe após quebrarem os pecados. Funciona em auto-refresh (10s) para o mediador da mesa física ver.
- Um botão **"Entregar Tudo"** libera o estoque daquela cor, informando o organizador a entregar o prêmio físico. Assim que entregue, os números zeram.

---

## 🛠 Como Executar Localmente

### Pré Requisitos: Node.js (v18+)

**1. Instalar as dependências:**
```bash
npm install
```

**2. Criar ou Resetar o Banco de Dados:**
Preenche a base de dados zerada ou reseta as rodadas.
```bash
npm run migrate
```

**3. Iniciar o jogo:**
```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no navegador para jogar!
As telas de admin estão em [http://localhost:3000/admin/questions](http://localhost:3000/admin/questions) e [http://localhost:3000/admin/rewards](http://localhost:3000/admin/rewards).
