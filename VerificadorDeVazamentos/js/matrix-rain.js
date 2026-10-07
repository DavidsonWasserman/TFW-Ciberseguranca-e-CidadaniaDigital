/**
 * matrix-rain.js
 * Efeito visual de chuva digital estilo Matrix em elemento canvas.
 *
 * Funcionalidades:
 * - Caracteres variados: Katakana japonês (0x30A0 a 0x30FF), letras latinas maiúsculas e dígitos (0-9).
 * - Efeito de rastro com desvanecimento suave (fade) em fundo translúcido.
 * - Caractere condutor (líder) em destaque brilhante/ciano com rastro verde neon (#00ff41).
 * - Controle de desempenho limitando a taxa de renderização a ~20 FPS (~50ms por quadro).
 * - Responsividade completa ajustando dimensões e colunas no evento de redimensionamento da janela.
 */

(function () {
    'use strict';

    /**
     * Inicializa o efeito da chuva Matrix no elemento canvas.
     */
    function initMatrixRain() {
        // 1. Busca o elemento canvas existente no documento
        const canvas = document.getElementById('matrix-bg');
        if (!canvas) {
            // Caso o elemento não exista na página, encerra sem disparar erros
            return;
        }

        const ctx = canvas.getContext('2d');
        if (!ctx) {
            return;
        }

        // Configurações principais do efeito
        const fontSize = 16;
        const targetFPS = 20;
        const frameInterval = 1000 / targetFPS; // Intervalo de ~50ms entre quadros

        // 3. Montagem do conjunto de caracteres: Katakana, alfabeto latino maiúsculo e dígitos 0-9
        const katakanaChars = [];
        for (let code = 0x30a0; code <= 0x30ff; code++) {
            katakanaChars.push(String.fromCharCode(code));
        }
        const latinAndDigits = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split('');
        const characters = katakanaChars.concat(latinAndDigits);

        // 4 e 5. Variáveis para colunas e posições das gotas verticais
        let columns = 0;
        let drops = [];

        /**
         * Ajusta a resolução do canvas ao tamanho da janela e recalcula a quantidade de colunas
         */
        function resizeCanvas() {
            // 2. Preenche toda a área visível do navegador (viewport)
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;

            // 4. Calcula o número de colunas com base na largura e no tamanho da fonte
            columns = Math.floor(canvas.width / fontSize);

            // 5. Inicializa as posições Y de cada coluna aleatoriamente para evitar alinhamento estático
            drops = [];
            for (let i = 0; i < columns; i++) {
                drops[i] = Math.floor(Math.random() * (canvas.height / fontSize));
            }
        }

        // Configuração inicial de dimensões
        resizeCanvas();

        // 8. Recalcula dimensões e colunas quando a janela for redimensionada
        window.addEventListener('resize', resizeCanvas);

        let lastTime = 0;

        /**
         * Executa o desenho de um quadro da animação
         */
        function drawFrame() {
            // 6. Preenche o canvas com preto semitransparente para criar o rastro com fade
            ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.font = `${fontSize}px monospace`;
            ctx.textBaseline = 'top';

            // Itera sobre cada coluna para desenhar os caracteres
            for (let i = 0; i < drops.length; i++) {
                const x = i * fontSize;
                const y = drops[i] * fontSize;

                // Caractere anterior do rastro em verde neon (#00ff41) com leve variação de opacidade
                if (drops[i] > 0) {
                    const trailChar = characters[Math.floor(Math.random() * characters.length)];
                    const opacity = (0.7 + Math.random() * 0.3).toFixed(2);
                    ctx.fillStyle = `rgba(0, 255, 65, ${opacity})`;
                    ctx.fillText(trailChar, x, (drops[i] - 1) * fontSize);
                }

                // Caractere líder ligeiramente mais brilhante/ciano para destaque visual
                const leadChar = characters[Math.floor(Math.random() * characters.length)];
                ctx.fillStyle = '#b6ffcc'; // Ciano / verde claro de alto brilho
                ctx.fillText(leadChar, x, y);

                // Reinicia a gota ao atingir o final da tela (ou aleatoriamente para efeito dinâmico)
                if (y > canvas.height && (Math.random() > 0.975 || y > canvas.height * 1.5)) {
                    drops[i] = 0;
                } else {
                    drops[i]++;
                }
            }
        }

        /**
         * Laço de animação controlado por requestAnimationFrame e delta de tempo
         * @param {number} currentTime - Timestamp da execução do quadro
         */
        function animate(currentTime) {
            // 7. Agendamento contínuo com requestAnimationFrame
            requestAnimationFrame(animate);

            // 9. Limitação de desempenho a ~20 FPS via delta de tempo (~50ms)
            const deltaTime = currentTime - lastTime;
            if (deltaTime < frameInterval) {
                return;
            }

            // Atualiza o marcador de tempo ajustando variações acumuladas
            lastTime = currentTime - (deltaTime % frameInterval);

            drawFrame();
        }

        // Inicia o ciclo de animação
        requestAnimationFrame(animate);
    }

    // Executa a inicialização de forma segura assim que o DOM estiver pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMatrixRain);
    } else {
        initMatrixRain();
    }
})();
