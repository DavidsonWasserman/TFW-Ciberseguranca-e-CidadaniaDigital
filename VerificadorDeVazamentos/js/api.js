/**
 * api.js — Módulo de consumo da API XposedOrNot
 *
 * Responsável por toda a comunicação com a API de verificação de
 * vazamentos de e-mail. Inclui modo de demonstração (mock) para
 * funcionamento offline.
 *
 * API utilizada: https://api.xposedornot.com
 * Documentação: https://xposedornot.com/api_doc
 */

// ============================================================
// Configuração do modo de demonstração
// ============================================================

/** @type {boolean} Flag para ativar/desativar o modo demo (dados simulados) */
let DEMO_MODE = false;

/**
 * Define o estado do modo de demonstração.
 * @param {boolean} enabled - true para ativar, false para desativar
 */
function setDemoMode(enabled) {
    DEMO_MODE = !!enabled;
}

/**
 * Retorna se o modo de demonstração está ativo.
 * @returns {boolean}
 */
function isDemoMode() {
    return DEMO_MODE;
}

// ============================================================
// Validação de e-mail
// ============================================================

/**
 * Valida o formato de um endereço de e-mail.
 * Utiliza uma expressão regular razoável para verificação no client-side.
 *
 * @param {string} email - Endereço de e-mail a ser validado
 * @returns {boolean} true se o formato é válido, false caso contrário
 */
function validateEmail(email) {
    if (!email || typeof email !== 'string') return false;
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email.trim());
}

// ============================================================
// Consulta à API — Verificação de e-mail
// ============================================================

/**
 * Verifica se um e-mail foi encontrado em vazamentos de dados.
 * Utiliza o endpoint /v1/check-email/{email} da XposedOrNot.
 *
 * @param {string} email - Endereço de e-mail a ser verificado
 * @returns {Promise<{found: boolean, breaches: string[], email: string}>}
 * @throws {Error} 'RATE_LIMIT' se atingir o limite de requisições
 * @throws {Error} 'NETWORK_ERROR' em caso de falha de rede
 */
async function checkEmail(email) {
    // Modo demonstração: retorna dados simulados
    if (DEMO_MODE) {
        return getMockData(email);
    }

    try {
        const url = 'https://api.xposedornot.com/v1/check-email/' + encodeURIComponent(email.trim());
        const response = await fetch(url);

        // Rate limit atingido
        if (response.status === 429) {
            throw new Error('RATE_LIMIT');
        }

        const data = await response.json();

        // E-mail encontrado em vazamentos
        if (data.status === 'success' && data.breaches) {
            return {
                found: true,
                breaches: Array.isArray(data.breaches[0]) ? data.breaches[0] : data.breaches,
                email: data.email || email
            };
        }

        // E-mail não encontrado (seguro)
        if (data.Error === 'Not found' || response.status === 404) {
            return {
                found: false,
                breaches: [],
                email: email
            };
        }

        // Resposta inesperada — tratar como não encontrado
        return {
            found: false,
            breaches: [],
            email: email
        };

    } catch (error) {
        if (error.message === 'RATE_LIMIT') {
            throw error;
        }
        throw new Error('NETWORK_ERROR');
    }
}

// ============================================================
// Consulta à API — Análise detalhada de vazamentos
// ============================================================

/**
 * Obtém análise detalhada dos vazamentos associados a um e-mail.
 * Utiliza o endpoint /v1/breach-analytics?email={email} da XposedOrNot.
 *
 * Retorna informações como: nome do serviço, domínio, indústria,
 * data do vazamento, quantidade de registros, tipos de dados expostos,
 * nível de risco e força das senhas comprometidas.
 *
 * @param {string} email - Endereço de e-mail a ser analisado
 * @returns {Promise<Object|null>} Dados analíticos ou null se não encontrado
 * @throws {Error} 'RATE_LIMIT' se atingir o limite de requisições
 * @throws {Error} 'NETWORK_ERROR' em caso de falha de rede
 */
async function getBreachAnalytics(email) {
    // Modo demonstração: retorna dados simulados
    if (DEMO_MODE) {
        return getMockAnalytics(email);
    }

    try {
        const url = 'https://api.xposedornot.com/v1/breach-analytics?email=' + encodeURIComponent(email.trim());
        const response = await fetch(url);

        // Rate limit atingido
        if (response.status === 429) {
            throw new Error('RATE_LIMIT');
        }

        // E-mail não encontrado
        if (response.status === 404) {
            return null;
        }

        const data = await response.json();

        // Verificar se contém dados de vazamento
        if (data.Error === 'Not found') {
            return null;
        }

        // Retornar dados estruturados
        return {
            ExposedBreaches: data.ExposedBreaches || null,
            BreachMetrics: data.BreachMetrics || null,
            BreachesSummary: data.BreachesSummary || null,
            ExposedPastes: data.ExposedPastes || null,
            PasteMetrics: data.PasteMetrics || null
        };

    } catch (error) {
        if (error.message === 'RATE_LIMIT') {
            throw error;
        }
        throw new Error('NETWORK_ERROR');
    }
}

// ============================================================
// Dados simulados (modo demonstração / offline)
// ============================================================

/**
 * Retorna dados simulados de verificação de e-mail.
 * Utilizado quando o modo demonstração está ativo ou sem internet.
 *
 * @param {string} email - E-mail utilizado na simulação
 * @returns {{found: boolean, breaches: string[], email: string}}
 */
function getMockData(email) {
    return {
        found: true,
        breaches: ['Adobe', 'LinkedIn', 'Dropbox', 'MySpace', 'Canva'],
        email: email
    };
}

/**
 * Retorna dados analíticos simulados de vazamentos.
 * Baseado em vazamentos reais conhecidos para maior realismo
 * na demonstração educacional.
 *
 * @param {string} email - E-mail utilizado na simulação
 * @returns {Object} Estrutura compatível com a resposta da API XposedOrNot
 */
function getMockAnalytics(email) {
    return {
        ExposedBreaches: {
            breaches_details: [
                {
                    breach: 'Adobe',
                    details: 'Em outubro de 2013, 153 milhões de contas da Adobe foram expostas. ' +
                        'Os dados incluíam IDs internos, nomes de usuário, e-mails, senhas criptografadas ' +
                        'de forma inadequada e dicas de senha em texto puro.',
                    domain: 'adobe.com',
                    industry: 'Technology',
                    logo: 'Adobe.png',
                    password_risk: 'easytocrack',
                    references: '',
                    searchable: 'Yes',
                    verified: 'Yes',
                    xposed_data: 'Email addresses;Password hints;Passwords;Usernames',
                    xposed_date: '2013',
                    xposed_records: 152445165
                },
                {
                    breach: 'LinkedIn',
                    details: 'Em 2012, o LinkedIn sofreu um vazamento massivo que expôs ' +
                        '164 milhões de endereços de e-mail e senhas armazenadas com hash SHA-1 ' +
                        'sem salt, tornando-as facilmente recuperáveis.',
                    domain: 'linkedin.com',
                    industry: 'Professional',
                    logo: 'LinkedIn.png',
                    password_risk: 'plaintext',
                    references: '',
                    searchable: 'Yes',
                    verified: 'Yes',
                    xposed_data: 'Email addresses;Passwords',
                    xposed_date: '2012',
                    xposed_records: 164611595
                },
                {
                    breach: 'Dropbox',
                    details: 'Em 2012, o Dropbox sofreu um vazamento que expôs ' +
                        '68 milhões de credenciais. As senhas estavam armazenadas ' +
                        'com bcrypt e SHA-1.',
                    domain: 'dropbox.com',
                    industry: 'Technology',
                    logo: 'Dropbox.png',
                    password_risk: 'hardtocrack',
                    references: '',
                    searchable: 'Yes',
                    verified: 'Yes',
                    xposed_data: 'Email addresses;Passwords',
                    xposed_date: '2012',
                    xposed_records: 68648009
                },
                {
                    breach: 'MySpace',
                    details: 'Em aproximadamente 2008, o MySpace sofreu um vazamento ' +
                        'que expôs 360 milhões de contas. Os dados incluíam endereços ' +
                        'de e-mail, nomes de usuário e senhas armazenadas com SHA-1 sem salt.',
                    domain: 'myspace.com',
                    industry: 'Social',
                    logo: 'MySpace.png',
                    password_risk: 'easytocrack',
                    references: '',
                    searchable: 'Yes',
                    verified: 'Yes',
                    xposed_data: 'Email addresses;Passwords;Usernames',
                    xposed_date: '2008',
                    xposed_records: 359420698
                },
                {
                    breach: 'Canva',
                    details: 'Em maio de 2019, o serviço de design gráfico Canva ' +
                        'sofreu um vazamento que expôs 137 milhões de contas, incluindo ' +
                        'e-mails, nomes, nomes de usuário e senhas com hash bcrypt.',
                    domain: 'canva.com',
                    industry: 'Technology',
                    logo: 'Canva.png',
                    password_risk: 'hardtocrack',
                    references: '',
                    searchable: 'Yes',
                    verified: 'Yes',
                    xposed_data: 'Email addresses;Names;Passwords;Usernames',
                    xposed_date: '2019',
                    xposed_records: 137272116
                }
            ]
        },
        BreachMetrics: {
            risk: [
                {
                    risk_label: 'High',
                    risk_score: 8
                }
            ],
            passwords_strength: [
                {
                    EasyToCrack: 2,
                    PlainText: 1,
                    StrongHash: 2,
                    Unknown: 0
                }
            ],
            yearwise_details: [
                {
                    y2007: 0,
                    y2008: 1,
                    y2009: 0,
                    y2010: 0,
                    y2011: 0,
                    y2012: 2,
                    y2013: 1,
                    y2014: 0,
                    y2015: 0,
                    y2016: 0,
                    y2017: 0,
                    y2018: 0,
                    y2019: 1,
                    y2020: 0,
                    y2021: 0,
                    y2022: 0,
                    y2023: 0
                }
            ],
            xposed_data: [
                {
                    children: [
                        {
                            colname: 'level2',
                            name: '👤 Identificação Pessoal',
                            children: [
                                { colname: 'level3', group: 'A', name: 'data_Usernames', value: 3 },
                                { colname: 'level3', group: 'A', name: 'data_Names', value: 1 }
                            ]
                        },
                        {
                            colname: 'level2',
                            name: '🔒 Práticas de Segurança',
                            children: [
                                { colname: 'level3', group: 'D', name: 'data_Passwords', value: 5 },
                                { colname: 'level3', group: 'D', name: 'data_Password hints', value: 1 }
                            ]
                        },
                        {
                            colname: 'level2',
                            name: '📞 Comunicação',
                            children: [
                                { colname: 'level3', group: 'F', name: 'data_Email addresses', value: 5 }
                            ]
                        }
                    ]
                }
            ]
        },
        BreachesSummary: {
            site: 'Adobe, LinkedIn, Dropbox, MySpace, Canva'
        },
        ExposedPastes: null,
        PasteMetrics: null
    };
}
