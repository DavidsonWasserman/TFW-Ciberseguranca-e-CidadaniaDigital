/**
 * ui.js
 * Módulo de lógica de interface de usuário para o Verificador de Vazamentos.
 * Responsável por toda a manipulação do DOM e renderização de resultados.
 */

document.addEventListener('DOMContentLoaded', () => {
    // 2. Referências de elementos
    const emailInput = document.getElementById('email-input');
    const btnScan = document.getElementById('btn-scan');
    const toggleDemo = document.getElementById('toggle-demo');
    const demoLabel = document.getElementById('demo-label');
    const resultsArea = document.getElementById('results-area');
    const loadingIndicator = document.getElementById('loading-indicator');
    
    // Header h1
    const headerTitle = document.querySelector('header h1');

    /**
     * Formata um número para o formato brasileiro
     * @param {number|string} num O número a ser formatado
     * @returns {string} Número formatado
     */
    function formatNumber(num) {
        const n = Number(num);
        if (isNaN(n)) return '0';
        return n.toLocaleString('pt-BR');
    }

    /**
     * Traduz o nível de risco de senha
     * @param {string} risk O nível de risco em inglês
     * @returns {string} Nível de risco em português
     */
    function translateRisk(risk) {
        if (!risk) return 'Desconhecido';
        switch(risk.toLowerCase()) {
            case 'easytocrack': return 'Fácil de quebrar';
            case 'hardtocrack': return 'Difícil de quebrar';
            case 'plaintext': return 'Texto puro (!)';
            case 'unknown': return 'Desconhecido';
            default: return risk;
        }
    }

    /**
     * Traduz tipos comuns de dados vazados
     * @param {string} type Tipo de dado em inglês
     * @returns {string} Tipo de dado em português
     */
    function translateDataType(type) {
        if (!type) return '';
        const dict = {
            'Email addresses': 'E-mails',
            'Passwords': 'Senhas',
            'Usernames': 'Nomes de usuário',
            'Password hints': 'Dicas de senha',
            'Names': 'Nomes',
            'IP addresses': 'Endereços IP',
            'Phone numbers': 'Telefones',
            'Dates of birth': 'Datas de nascimento',
            'Physical addresses': 'Endereços físicos'
        };
        return dict[type.trim()] || type.trim();
    }

    /**
     * Renderiza mensagem de erro
     * @param {string} message A mensagem de erro
     */
    function renderError(message) {
        resultsArea.innerHTML = `
            <div class="summary-card breached">
                <div class="summary-title">
                    <span class="icon">❌</span>
                    <h2>Erro</h2>
                </div>
                <p style="color: var(--red-alert);">${message}</p>
            </div>
        `;
        resultsArea.style.display = 'block';
    }

    /**
     * Renderiza os resultados da verificação
     * @param {Object} checkData Dados principais da verificação (se encontrou ou não)
     * @param {Object|null} analyticsData Dados detalhados de análise (opcional)
     */
    function renderResults(checkData, analyticsData) {
        resultsArea.innerHTML = '';
        
        if (!checkData || checkData.found === false) {
            resultsArea.innerHTML = `
                <div class="summary-card safe">
                    <div class="summary-title">
                        <span class="icon">🛡️</span>
                        <h2>E-mail Seguro</h2>
                    </div>
                    <p style="color: var(--green-neon);">Este e-mail não foi encontrado em nenhum vazamento de dados público conhecido.</p>
                </div>
                <div class="safe-result">
                    <div class="safe-icon">✅</div>
                    <p class="safe-text">Nenhum vazamento detectado</p>
                </div>
            `;
            resultsArea.style.display = 'block';
            return;
        }

        // É um vazamento
        const count = checkData.breaches ? checkData.breaches.length : 0;
        let totalRecords = 0;
        let riskLabel = 'Desconhecido';
        let breachesList = [];

        // Acessa a estrutura correta da API: ExposedBreaches.breaches_details
        if (analyticsData && analyticsData.ExposedBreaches && analyticsData.ExposedBreaches.breaches_details) {
            breachesList = analyticsData.ExposedBreaches.breaches_details;
            totalRecords = breachesList.reduce((sum, b) => sum + (Number(b.xposed_records) || 0), 0);
        }
        
        // Extrai o rótulo de risco do BreachMetrics
        if (analyticsData && analyticsData.BreachMetrics && analyticsData.BreachMetrics.risk && analyticsData.BreachMetrics.risk.length > 0) {
            const riskObj = analyticsData.BreachMetrics.risk[0];
            riskLabel = riskObj.risk_label || riskObj;
        }

        // Renderiza sumário
        let html = `
            <div class="summary-card breached">
                <div class="summary-title">
                    <span class="icon">⚠️</span>
                    <h2>E-mail Comprometido</h2>
                </div>
                <p style="color: var(--red-alert);">Este e-mail foi encontrado em vazamentos de dados.</p>
                <div class="summary-stats">
                    <div class="stat-item">
                        <span class="stat-value danger">${count}</span>
                        <span class="stat-label">Vazamentos</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value danger">${formatNumber(totalRecords)}</span>
                        <span class="stat-label">Registros Expostos</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value danger">${riskLabel}</span>
                        <span class="stat-label">Nível de Risco</span>
                    </div>
                </div>
            </div>
        `;

        // Renderiza cada vazamento
        if (breachesList.length > 0) {
            breachesList.forEach(breach => {
                const dataTypes = (breach.xposed_data || '').split(';').filter(t => t.trim() !== '');
                const tagsHtml = dataTypes.map(t => `<span class="data-tag">${translateDataType(t)}</span>`).join('');
                
                html += `
                <div class="breach-card">
                    <div class="breach-header">
                        <span class="breach-name">${breach.breach || 'Desconhecido'}</span>
                        <span class="breach-date">📅 ${breach.xposed_date || 'Data desconhecida'}</span>
                    </div>
                    <div class="breach-details">
                        <span class="breach-detail-item">🌐 ${breach.domain || 'N/A'}</span>
                        <span class="breach-detail-item">🏢 ${breach.industry || 'N/A'}</span>
                        <span class="breach-detail-item">👥 ${formatNumber(breach.xposed_records)} registros</span>
                        <span class="breach-detail-item">🔒 Risco: ${translateRisk(breach.password_risk)}</span>
                    </div>
                    <div class="data-tags">
                        ${tagsHtml}
                    </div>
                </div>
                `;
            });
        } else if (checkData.breaches && checkData.breaches.length > 0) {
            // Fallback caso não haja analyticsData, mas temos lista do checkData
            checkData.breaches.forEach(breachName => {
                html += `
                <div class="breach-card">
                    <div class="breach-header">
                        <span class="breach-name">${breachName}</span>
                    </div>
                    <div class="breach-details">
                        <span class="breach-detail-item">Mais detalhes não disponíveis no momento.</span>
                    </div>
                </div>
                `;
            });
        }

        resultsArea.innerHTML = html;
        resultsArea.style.display = 'block';
    }

    // 3. Validação de e-mail em tempo real
    emailInput.addEventListener('input', () => {
        const val = emailInput.value;
        if (!val) {
            emailInput.classList.remove('valid', 'invalid');
            return;
        }
        
        if (typeof validateEmail === 'function' && validateEmail(val)) {
            emailInput.classList.add('valid');
            emailInput.classList.remove('invalid');
        } else {
            emailInput.classList.add('invalid');
            emailInput.classList.remove('valid');
        }
    });

    // 4. Suporte a tecla Enter
    emailInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const val = emailInput.value;
            if (typeof validateEmail === 'function' && validateEmail(val)) {
                btnScan.click();
            }
        }
    });

    // 5. Toggle de modo Demo
    if (toggleDemo) {
        /**
         * Alterna o modo demonstração e sincroniza o estado visual.
         * O rótulo exibe apenas "ON"/"OFF", pois o texto
         * "Modo Demonstração:" já está fixo no HTML.
         */
        const alternarModoDemo = () => {
            if (typeof setDemoMode !== 'function' || typeof isDemoMode !== 'function') return;

            setDemoMode(!isDemoMode());
            const ativo = isDemoMode();

            toggleDemo.classList.toggle('active', ativo);
            toggleDemo.setAttribute('aria-checked', String(ativo));
            if (demoLabel) {
                demoLabel.textContent = ativo ? 'ON' : 'OFF';
            }
        };

        toggleDemo.addEventListener('click', alternarModoDemo);

        // Acessibilidade: permite alternar com Enter ou Espaço
        toggleDemo.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                alternarModoDemo();
            }
        });
    }

    // 6. Clique no botão de Scan
    btnScan.addEventListener('click', async () => {
        const email = emailInput.value.trim();
        
        if (typeof validateEmail === 'function' && !validateEmail(email)) {
            emailInput.classList.add('invalid');
            setTimeout(() => emailInput.classList.remove('invalid'), 500);
            return;
        }

        // Prepara interface para carregamento
        btnScan.disabled = true;
        const originalBtnText = btnScan.textContent;
        btnScan.textContent = 'SCANNING...';
        
        resultsArea.style.display = 'none';
        if (loadingIndicator) loadingIndicator.style.display = 'block';
        
        if (headerTitle) {
            headerTitle.classList.add('glitch');
            setTimeout(() => headerTitle.classList.remove('glitch'), 300);
        }

        try {
            // Executa as requisições, idealmente em paralelo, mas lidando com erros individuais
            let checkData = null;
            let analyticsData = null;
            let checkError = null;
            
            try {
                if (typeof checkEmail === 'function') {
                    checkData = await checkEmail(email);
                }
            } catch (err) {
                checkError = err;
            }

            try {
                if (typeof getBreachAnalytics === 'function') {
                    analyticsData = await getBreachAnalytics(email);
                }
            } catch (err) {
                // Falha no analytics não deve impedir de mostrar o básico se checkData funcionou
                console.warn('Erro ao obter analytics:', err);
            }

            if (checkError) {
                throw checkError;
            }

            renderResults(checkData, analyticsData);
        } catch (error) {
            let errorMsg = 'Ocorreu um erro desconhecido.';
            
            if (error.message === 'RATE_LIMIT') {
                errorMsg = 'Limite de requisições atingido. Tente novamente mais tarde.';
            } else if (error.message === 'NETWORK_ERROR') {
                if (typeof isDemoMode === 'function' && !isDemoMode()) {
                    errorMsg = 'Erro de rede. Sugerimos ativar o Modo Demo para testar a aplicação.';
                } else {
                    errorMsg = 'Erro de rede ou servidor inacessível.';
                }
            } else if (error.message) {
                errorMsg = error.message;
            }
            
            renderError(errorMsg);
        } finally {
            if (loadingIndicator) loadingIndicator.style.display = 'none';
            btnScan.disabled = false;
            btnScan.textContent = originalBtnText || 'VERIFICAR';
        }
    });
});
