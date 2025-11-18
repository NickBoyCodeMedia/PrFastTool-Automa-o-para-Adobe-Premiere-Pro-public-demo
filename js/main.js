// Inicialização da extensão
const csInterface = new CSInterface();

// Aqui está sua função auxiliar de log
function log(message) {
    const logDiv = document.getElementById('log');
    if (logDiv) {
        const timestamp = new Date().toLocaleTimeString();
        logDiv.innerHTML += `<span style='color:#7fffd4'>${timestamp}</span>: ${message}<br>`;
        logDiv.scrollTop = logDiv.scrollHeight;
    }
    console.log('[Pr-FastTool]', message);
}

// Use esta função para mostrar o progresso
function showProgress(show, progress = 0) {
    const progressContainer = document.getElementById('progress-container');
    const progressBar = document.getElementById('progress-bar');
    if (show) {
        progressContainer.style.display = 'block';
        progressBar.style.width = progress + '%';
        progressBar.textContent = progress + '%';
    } else {
        progressContainer.style.display = 'none';
    }
}

// Aqui você pode inspecionar a sequência atual e os clipes selecionados
function debugSequenceStatus() {
    log('Verificando status da sequência e seleção...');
    
    // Vou verificar se CEP está disponível antes de você tentar executar scripts
    if (typeof window.__adobe_cep__ === 'undefined') {
        log('✗ ERRO: window.__adobe_cep__ não está disponível');
        log('Isso indica que a extensão não está rodando no contexto CEP correto');
        return;
    }
    
    // Vou tentar usar uma função simples do seu hostscript.jsx
    const script = `(function(){
        try {
            if (typeof app === 'undefined') return 'app object não disponível';
            if (!app.project) return 'app.project não disponível';
            if (!app.project.activeSequence) return 'Nenhuma sequência ativa';
            
            var seq = app.project.activeSequence;
            var info = [];
            info.push('Sequência: ' + seq.name);
            info.push('Dimensões: ' + seq.frameSizeHorizontal + 'x' + seq.frameSizeVertical);
            info.push('Trilhas de vídeo: ' + seq.videoTracks.numTracks);
            
            var totalClips = 0;
            var selectedClips = 0;
            for (var i = 0; i < seq.videoTracks.numTracks; i++) {
                var track = seq.videoTracks[i];
                totalClips += track.clips.numItems;
                for (var j = 0; j < track.clips.numItems; j++) {
                    if (track.clips[j].isSelected()) {
                        selectedClips++;
                    }
                }
            }
            
            info.push('Total de clipes: ' + totalClips);
            info.push('Clipes selecionados: ' + selectedClips);
            
            return info.join(' | ');
        } catch (e) {
            return 'Erro: ' + e.toString();
        }
    })();`;
    
    csInterface.evalScript(script, function(result) {
        log('Status da sequência:');
        if (result && result !== "EvalScript error.") {
            log('✓ ' + result);
        } else {
            log('✗ Erro no script de debug: ' + result);
            log('');
            log('=== DIAGNÓSTICO AVANÇADO ===');
            log('O ExtendScript engine não está funcionando corretamente.');
            log('Possíveis soluções:');
            log('1. Execute o arquivo enable_debug.bat como administrador');
            log('2. Reinicie completamente o Premiere Pro');
            log('3. Verifique se há outros plugins interferindo');
            log('4. Tente criar um novo projeto para testar');
            log('=== FIM DO DIAGNÓSTICO ===');
        }
    });
}

// Aqui você executa o Back Fill usando seu hostscript.jsx
function executeBackFill(options) {
    log('Iniciando Back Fill...');
    log('Opções: ' + JSON.stringify(options));
    
    // Vou verificar se CEP está disponível
    if (typeof window.__adobe_cep__ === 'undefined') {
        log('✗ ERRO: CEP não está disponível. A extensão precisa rodar dentro do Adobe Premiere Pro.');
        return;
    }
    
    showProgress(true, 10);

    // Vou tentar executar via seu hostscript.jsx
    log('Tentando executar via hostscript.jsx...');
    
    const script = `executeBackFill(${JSON.stringify(options)});`;
    
    csInterface.evalScript(script, function(result) {
        showProgress(true, 100);
        log('Resultado recebido: ' + result);
        
        if (!result || result === "EvalScript error.") {
            log('✗ Falha na execução via hostscript.jsx');
            log('Tentando método de fallback...');
            executeBackFillFallback(options);
        } else {
            try {
                const resultObj = JSON.parse(result);
                if (resultObj.success) {
                    log('✓ ' + resultObj.message);
                } else {
                    log('✗ ' + resultObj.message);
                }
            } catch (e) {
                log('✓ ' + result);
            }
        }
        
        setTimeout(() => {
            showProgress(false);
        }, 1500);
    });
}

// Se o ExtendScript não funcionar, use este método de fallback com instruções manuais
function executeBackFillFallback(options) {
    log('=== MÉTODO MANUAL ===');
    log('Como o ExtendScript não está respondendo, execute os seguintes passos manualmente:');
    log('');
    log('1. Selecione o(s) clipe(s) que deseja aplicar o Back Fill');
    log('2. Certifique-se de que há uma trilha de vídeo livre abaixo');
    log('3. Duplicar o clipe para a trilha abaixo (Ctrl+C, Ctrl+V)');
    
    if (options.addBlur) {
        log('4. Adicionar efeito "Camera Blur" ao clipe duplicado');
        log('   - Configurar "Percent Blur" para ' + options.blurIntensity + '%');
        log('   - Configurar "Quality" para High');
    }
    
    log('5. Ajustar a escala do clipe duplicado para preencher a tela');
    log('   - Ir em Effect Controls > Motion > Scale');
    log('   - Aumentar até cobrir toda a tela');
    
    if (options.addAnimation) {
        log('6. Adicionar animação de escala sutil (opcional)');
    }
    
    if (options.addNest) {
        log('7. Criar nest do clipe de fundo (opcional)');
    }
    
    if (options.addAdjustment) {
        log('8. Adicionar adjustment layer acima (opcional)');
    }
    
    log('');
    log('=== FIM DO MÉTODO MANUAL ===');
}

// Vou verificar o contexto CEP na inicialização pra você
function checkCEPContext() {
    log('=== Diagnóstico do Contexto CEP ===');
    log('window.__adobe_cep__ disponível: ' + (typeof window.__adobe_cep__ !== 'undefined'));
    log('CSInterface disponível: ' + (typeof CSInterface !== 'undefined'));
    
    if (typeof window.__adobe_cep__ !== 'undefined') {
        log('✓ Contexto CEP detectado');
        try {
            const hostEnv = JSON.parse(window.__adobe_cep__.getHostEnvironment());
            log('✓ Host: ' + hostEnv.appName + ' ' + hostEnv.appVersion);
        } catch (e) {
            log('✗ Erro ao obter informações do host: ' + e.message);
        }
    } else {
        log('✗ PROBLEMA: Contexto CEP não encontrado');
        log('A extensão está rodando fora do Adobe Premiere Pro?');
        log('Verifique se:');
        log('1. A extensão está instalada corretamente');
        log('2. O Premiere Pro está executando a extensão');
        log('3. As permissões de debug estão configuradas');
    }
    log('=== Fim do Diagnóstico ===');
}

// Use esta função para diagnosticar problemas de comunicação com ExtendScript
function testExtendScriptCommunication() {
    log('Iniciando diagnóstico completo do ExtendScript...');
    
    // 1. Vou verificar se o CEP está disponível
    if (typeof window.__adobe_cep__ === 'undefined') {
        log('✗ ERRO CRÍTICO: window.__adobe_cep__ não está disponível');
        log('Isso indica que a extensão não está rodando no contexto CEP correto');
        return;
    }
    
    log('✓ CEP disponível, versão: ' + csInterface.getCurrentApiVersion().major + '.' + 
        csInterface.getCurrentApiVersion().minor);
    
    // 2. Vou testar um script simples (sem acessar o app)
    const simpleScript = `(function(){ return "Teste básico: " + new Date(); })();`;
    
    log('Teste 1: Executando script JavaScript simples...');
    csInterface.evalScript(simpleScript, function(result) {
        if (result && result !== "EvalScript error.") {
            log('✓ Teste 1 OK: ' + result);
            
            // 3. Se o teste simples passou, tente o test_simple.jsx
            log('Teste 2: Carregando test_simple.jsx...');
            const scriptPath = csInterface.getSystemPath(SystemPath.EXTENSION) + '/jsx/test_simple.jsx';
            
            // Criar um script que carrega o arquivo .jsx
            const loaderScript = `(function(){
                try {
                    var scriptFile = new File("${scriptPath.replace(/\\/g, '\\\\')}");
                    if (!scriptFile.exists) {
                        return "✗ Arquivo não encontrado: ${scriptPath}";
                    }
                    scriptFile.open('r');
                    var content = scriptFile.read();
                    scriptFile.close();
                    
                    // Executar o conteúdo
                    var result = eval(content);
                    return result;
                } catch (e) {
                    return "✗ Erro ao carregar/executar script: " + e.toString();
                }
            })();`;
            
            csInterface.evalScript(loaderScript, function(result) {
                if (result && result !== "EvalScript error.") {
                    log('✓ Teste 2 OK:');
                    log(result);
                } else {
                    log('✗ Teste 2 falhou: Não foi possível carregar/executar test_simple.jsx');
                    log('Resultado: ' + result);
                    
                    // 4. Tentar executar o script diretamente
                    log('Teste 3: Executando test_simple.jsx diretamente...');
                    const directScript = `$.evalFile("${scriptPath.replace(/\\/g, '\\\\')}");`;
                    
                    csInterface.evalScript(directScript, function(result) {
                        if (result && result !== "EvalScript error.") {
                            log('✓ Teste 3 OK:');
                            log(result);
                        } else {
                            log('✗ Teste 3 falhou. Não foi possível executar script diretamente.');
                            log('Verifique permissões de arquivo e configurações de sandbox.');
                            
                            // Sugestões finais
                            log('');
                            log('=== SUGESTÕES DE RESOLUÇÃO ===');
                            log('1. Verifique se o ExtendScript está habilitado (executar enable_debug.bat)');
                            log('2. Reinicie completamente o Premiere Pro');
                            log('3. Verifique se as opções de segurança do CEP estão configuradas (CSXS.11/12)');
                            log('4. Verifique se o arquivo .debug está presente no AppData\\Roaming\\Adobe\\CEP');
                        }
                    });
                }
            });
            
        } else {
            log('✗ Teste 1 falhou: Erro no script JavaScript simples');
            log('Isso indica um problema grave com o motor ExtendScript');
            log('Verifique se o Adobe CEP Debug Tool está em execução');
        }
    });
}

// Aqui está seu teste simplificado com timeout explícito
function testExtendScriptBasic() {
    log('Executando teste básico ExtendScript...');
    
    const script = "'Teste básico sem objetos complexos: ' + new Date();";
    
    // Vou definir um timeout para o teste
    const timeoutID = setTimeout(() => {
        log('✗ TIMEOUT: O teste ExtendScript não respondeu em 5 segundos');
        log('Possíveis causas: Motor ExtendScript bloqueado/indisponível');
        log('Tentando método alternativo...');
        testAlternativeMethod();
    }, 5000);
    
    csInterface.evalScript(script, function(result) {
        clearTimeout(timeoutID);
        
        if (result && result !== "EvalScript error.") {
            log('✓ Teste básico OK: ' + result);
            log('Agora testando o arquivo .jsx completo...');
            
            // Agora tenta carregar o arquivo jsx
            const extensionPath = csInterface.getSystemPath(SystemPath.EXTENSION);
            const jsxPath = extensionPath + '/jsx/test_simple.jsx';
            
            testJSXFile(jsxPath.replace(/\\/g, '/'));
        } else {
            log('✗ Teste básico falhou: ' + result);
            log('Tentando método alternativo...');
            testAlternativeMethod();
        }
    });
}

// Use esta função para testar arquivo JSX específico
function testJSXFile(jsxPath) {
    log('Carregando JSX: ' + jsxPath);
    
    const script = `$.evalFile("${jsxPath}");`;
    
    // Vou definir um timeout para o teste do arquivo
    const timeoutID = setTimeout(() => {
        log('✗ TIMEOUT: O carregamento do JSX não respondeu em 5 segundos');
        testAlternativeMethod();
    }, 5000);
    
    csInterface.evalScript(script, function(result) {
        clearTimeout(timeoutID);
        
        if (result && result !== "EvalScript error.") {
            log('✓ Arquivo JSX carregado com sucesso:');
            log(result);
        } else {
            log('✗ Falha ao carregar arquivo JSX: ' + (result || "Erro desconhecido"));
            testAlternativeMethod();
        }
    });
}

// Este método alternativo tenta contornar problemas do ExtendScript
function testAlternativeMethod() {
    log('Tentando método alternativo de comunicação...');
    
    // Vou criar um elemento para comunicação alternativa
    const frame = document.createElement('iframe');
    frame.style.display = 'none';
    document.body.appendChild(frame);
    
    // Vou usar setTimeout para criar um canal de comunicação assíncrono
    setTimeout(() => {
        try {
            // Vou tentar acessar diretamente o objeto __adobe_cep__
            if (window.__adobe_cep__) {
                const nativeVersion = JSON.parse(window.__adobe_cep__.getHostEnvironment()).appVersion;
                log('✓ Comunicação direta funcional! Versão: ' + nativeVersion);
                
                // Vou tentar execução alternativa de script
                try {
                    window.__adobe_cep__.evalScript('"Teste direto: " + new Date();', result => {
                        log('Resultado do teste direto: ' + result);
                    });
                } catch (e) {
                    log('Erro no teste direto: ' + e.toString());
                }
            } else {
                log('✗ Não foi possível acessar __adobe_cep__ diretamente');
            }
        } catch (e) {
            log('✗ Erro no método alternativo: ' + e.toString());
        }
        
        // Vou limpar o frame
        document.body.removeChild(frame);
        
        // Vou exibir instruções para você resolver manualmente
        showManualFix();
    }, 500);
}

// Aqui estão as instruções para você resolver manualmente
function showManualFix() {
    log('');
    log('=== INSTRUÇÕES PARA RESOLUÇÃO MANUAL ===');
    log('1. Feche o Adobe Premiere Pro completamente');
    log('2. Execute o arquivo "fix_extendscript.bat" como administrador');
    log('3. Verifique se existe o arquivo .debug em:');
    log('   C:\\Users\\' + (process.env.USERNAME || 'NICKBOY3D') + '\\AppData\\Roaming\\Adobe\\CEP\\');
    log('4. Reinicie o Adobe Premiere Pro');
    log('');
    
    // Vou criar um botão para você gerar o arquivo .debug
    const fixButton = document.createElement('button');
    fixButton.textContent = 'Criar arquivo .debug';
    fixButton.style.backgroundColor = '#dc3545';
    fixButton.style.color = 'white';
    fixButton.style.padding = '10px';
    fixButton.style.margin = '10px 0';
    fixButton.onclick = createDebugFile;
    
    const logDiv = document.getElementById('log');
    if (logDiv) {
        logDiv.parentNode.insertBefore(fixButton, logDiv);
    }
}

// Use esta função para criar o arquivo .debug
function createDebugFile() {
    log('Tentando criar arquivo .debug...');
    
    try {
        // No ambiente CEP atual, você não pode criar arquivos diretamente
        const debugContent = `<?xml version="1.0" encoding="UTF-8"?>
<ExtensionList>
    <Extension Id="com.prfasttool.panel">
        <HostList>
            <Host Name="PPRO" Port="7777"/>
        </HostList>
    </Extension>
</ExtensionList>`;

        // Vou mostrar o texto para você copiar
        log('Copie o conteúdo abaixo e salve como arquivo .debug em:');
        log('C:\\Users\\' + (process.env.USERNAME || 'NICKBOY3D') + '\\AppData\\Roaming\\Adobe\\CEP\\');
        log('');
        log('---CONTEÚDO DO ARQUIVO .debug---');
        log(debugContent);
        log('---FIM DO CONTEÚDO---');
        
        // Vou tentar copiar para sua área de transferência
        const textArea = document.createElement('textarea');
        textArea.value = debugContent;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        
        log('✓ Conteúdo copiado para a área de transferência!');
    } catch (e) {
        log('✗ Erro ao tentar copiar: ' + e.toString());
    }
}

// Vou adicionar um botão de diagnóstico completo pra você
function createDiagnosticButton() {
    const diagBtn = document.createElement('button');
    diagBtn.textContent = 'Diagnóstico Completo';
    diagBtn.style.marginTop = '10px';
    diagBtn.style.backgroundColor = '#dc3545';
    diagBtn.style.color = 'white';
    diagBtn.style.padding = '10px';
    diagBtn.onclick = runFullDiagnostic;

    const logDiv = document.getElementById('log');
    if (logDiv) {
        logDiv.parentNode.insertBefore(diagBtn, logDiv);
    }
}

// Este é seu diagnóstico completo e detalhado
function runFullDiagnostic() {
    log('=== INICIANDO DIAGNÓSTICO COMPLETO DO EXTENDSCRIPT ===');
    log('User Agent: ' + navigator.userAgent);
    log('Location: ' + window.location.href);

    // 1. Vou verificar CEP e CSInterface
    log('window.__adobe_cep__ existe: ' + (typeof window.__adobe_cep__ !== 'undefined'));
    log('CSInterface existe: ' + (typeof CSInterface !== 'undefined'));
    if (typeof window.__adobe_cep__ === 'undefined') {
        log('✗ ERRO: CEP não disponível. Extensão não está rodando no contexto correto.');
        return;
    }
    if (typeof CSInterface === 'undefined') {
        log('✗ ERRO: CSInterface não carregado.');
        return;
    }

    // 2. Vou verificar os caminhos importantes
    try {
        const cs = new CSInterface();
        const extPath = cs.getSystemPath(SystemPath.EXTENSION);
        log('Caminho da extensão: ' + extPath);
        log('Caminho do usuário: ' + cs.getSystemPath(SystemPath.USER_DATA));
        log('Caminho do host: ' + cs.getSystemPath(SystemPath.HOST_APPLICATION));
    } catch (e) {
        log('✗ ERRO ao obter caminhos: ' + e.message);
    }

    // 3. Vou testar a leitura do arquivo JSX
    try {
        const cs = new CSInterface();
        const jsxPath = cs.getSystemPath(SystemPath.EXTENSION) + '/jsx/test_simple.jsx';
        log('Verificando existência do arquivo test_simple.jsx: ' + jsxPath);
        cs.evalScript(`(function(){
            try {
                var f = new File("${jsxPath.replace(/\\/g, '\\\\')}");
                if (!f.exists) return "✗ Arquivo não encontrado";
                f.open('r');
                var content = f.read();
                f.close();
                return "✓ Arquivo lido com sucesso (" + content.length + " chars)";
            } catch(e) {
                return "✗ Erro ao ler arquivo: " + e.toString();
            }
        })();`, function(result) {
            log('Leitura do arquivo JSX: ' + result);

            // 4. Testar execução simples do ExtendScript
            log('Testando execução básica do ExtendScript...');
            cs.evalScript(`(function(){ try { return "✓ ExtendScript ativo: " + new Date(); } catch(e){ return "✗ Erro: " + e.toString(); } })();`, function(result2) {
                log('Resultado do teste básico: ' + result2);

                // 5. Testar execução do arquivo JSX
                log('Testando execução do test_simple.jsx...');
                cs.evalScript(`$.evalFile("${jsxPath.replace(/\\/g, '\\\\')}");`, function(result3) {
                    log('Resultado da execução do test_simple.jsx: ' + result3);

                    // 6. Diagnóstico final
                    if (
                        result2 && result2.startsWith('✓') &&
                        result3 && result3 !== "EvalScript error." && !result3.startsWith('✗')
                    ) {
                        log('✓ ExtendScript está funcionando normalmente!');
                    } else {
                        log('✗ O ExtendScript NÃO está respondendo corretamente.');
                        log('Possíveis causas:');
                        log('- Permissões de arquivo ou sandbox');
                        log('- Algum erro de sintaxe no JSX');
                        log('- Problema específico nesta extensão');
                        log('Sugestão: Compare com outra extensão que funcione e veja diferenças de estrutura, permissões e manifest.');
                    }
                    log('=== FIM DO DIAGNÓSTICO ===');
                });
            });
        });
    } catch (e) {
        log('✗ ERRO no diagnóstico: ' + e.toString());
    }
}

// Use esta função para testar a comunicação básica do ExtendScript
function testSimpleJSX() {
    log('Testing basic JSX communication...');
    
    csInterface.evalScript('testConnection()', function(result) {
        if (result && result !== "EvalScript error.") {
            log('✓ Success! JSX responded: ' + result);
        } else {
            log('✗ JSX test failed: ' + (result || "No response"));
            log('This suggests ExtendScript communication is not working properly.');
        }
    });
}

// Aqui você verifica os detalhes do ambiente host
function debugHost() {
    log('Checking host environment...');
    
    csInterface.evalScript('debugHostEnvironment()', function(result) {
        if (result && result !== "EvalScript error.") {
            try {
                const info = JSON.parse(result);
                log('✓ Host environment check:');
                if (info.success) {
                    info.info.forEach(item => log('  ' + item));
                } else {
                    log('✗ Host check error: ' + info.error);
                }
            } catch (e) {
                log('✗ Error parsing host check result: ' + e.toString());
                log('Raw result: ' + result);
            }
        } else {
            log('✗ Host check failed: ' + result);
        }
    });
}

// Vou garantir que executeBackFill está exposto globalmente no seu hostscript.jsx
function ensureFunctionsExposed() {
    const script = `
        if (typeof executeBackFill === "function") {
            $.global.executeBackFill = executeBackFill;
            "Function executeBackFill successfully exposed to global scope";
        } else {
            "ERROR: executeBackFill function not found in hostscript.jsx";
        }
    `;
    
    csInterface.evalScript(script, function(result) {
        log('Function exposure check: ' + result);
    });
}

// Use esta função para atualizar o valor do slider de blur
function updateBlurValue() {
    const blurSlider = document.getElementById('blurIntensity');
    const blurValue = document.getElementById('blurValue');
    if (blurSlider && blurValue) {
        blurValue.textContent = blurSlider.value;
    }
}

// Aqui você coleta as opções da interface
function getUIOptions() {
    return {
        addBlur: document.getElementById('addBlur').checked,
        addAnimation: document.getElementById('addAnimation').checked,
        addNest: document.getElementById('addNest').checked,
        addAdjustment: document.getElementById('addAdjustment').checked,
        blurIntensity: document.getElementById('blurIntensity').value
    };
}

// Use esta função para executar o Back Fill com opções da sua UI
function executeBackFillFromUI() {
    const options = getUIOptions();
    executeBackFill(options);
}

// Aqui você executa o Vertical Stack
function executeVerticalStack(options) {
    log('Iniciando Vertical Stack...');
    log('Opções: ' + JSON.stringify(options));
    
    // Vou verificar se CEP está disponível
    if (typeof window.__adobe_cep__ === 'undefined') {
        log('✗ ERRO: CEP não está disponível. A extensão precisa rodar dentro do Adobe Premiere Pro.');
        return;
    }
    
    // Vou mostrar o progresso
    showProgress(true, 10);
    
    // Vou executar a função via seu hostscript.jsx
    const script = `executeVerticalStack(${JSON.stringify(options)});`;
    
    csInterface.evalScript(script, function(result) {
        showProgress(true, 100);
        log('Resultado recebido: ' + result);
        
        if (!result || result === "EvalScript error.") {
            log('✗ Falha na execução via hostscript.jsx');
            log('Verificando projetos e seleção...');
            
            csInterface.evalScript(`(function(){
                try {
                    if (!app.project) return "Projeto não está aberto";
                    if (!app.project.activeSequence) return "Nenhuma sequência ativa";
                    
                    var viewIDs = app.getProjectViewIDs();
                    if (!viewIDs || viewIDs.length === 0) return "Não foi possível acessar o painel Project";
                    
                    var viewID = viewIDs[0];
                    var sel = app.getProjectViewSelection(viewID);
                    if (!sel || sel.length === 0) return "Nenhum clip selecionado no painel Project";
                    
                    return "Seleção detectada: " + sel.length + " item(s)";
                } catch (e) {
                    return "Erro: " + e.toString();
                }
            })();`, function(checkResult) {
                log('Diagnóstico: ' + checkResult);
                log('');
                log('Para usar o Vertical Stack:');
                log('1. Selecione clips no painel Project (não na timeline)');
                log('2. Certifique-se que há uma sequência aberta');
                log('3. Tente novamente');
            });
        } else {
            try {
                const resultObj = JSON.parse(result);
                if (resultObj.success) {
                    log('✓ ' + resultObj.message);
                } else {
                    log('✗ ' + resultObj.message);
                }
                
                // Mostrar erros
                if (resultObj.errors && resultObj.errors.length > 0) {
                    resultObj.errors.forEach(function(error) {
                        log('⚠️ ' + error);
                    });
                }
            } catch (e) {
                log('✓ ' + result);
            }
        }
        
        // Esconder barra de progresso após um tempo
        setTimeout(() => {
            showProgress(false);
        }, 1500);
    });
}

// Use esta função para coletar opções da interface para Vertical Stack
function getVerticalStackOptions() {
    return {
        scale: document.getElementById('vsScaleSlider').value,
        gap: document.getElementById('gapValue').value,
        maintainAspectRatio: document.getElementById('maintainAspectRatio').checked
    };
}

// Aqui você executa o Vertical Stack com opções da sua UI
function executeVerticalStackFromUI() {
    const options = getVerticalStackOptions();
    executeVerticalStack(options);
}

// Vou atualizar a função initializeUI para incluir o botão Vertical Stack
function initializeUI() {
    // Vou adicionar event listener para o slider de blur
    const blurSlider = document.getElementById('blurIntensity');
    if (blurSlider) {
        blurSlider.addEventListener('input', updateBlurValue);
    }

    // Vou adicionar event listener para o botão principal
    const backFillBtn = document.getElementById('backFillBtn');
    if (backFillBtn) {
        backFillBtn.addEventListener('click', executeBackFillFromUI);
    }

    // Vou adicionar event listener para o botão de Vertical Stack
    const verticalStackBtn = document.getElementById('verticalStackBtn');
    if (verticalStackBtn) {
        verticalStackBtn.addEventListener('click', executeVerticalStackFromUI);
    }
    
    // Vou adicionar event listener para o slider de escala de Vertical Stack
    const vsScaleSlider = document.getElementById('vsScaleSlider');
    if (vsScaleSlider) {
        vsScaleSlider.addEventListener('input', function() {
            document.getElementById('vsScaleValue').textContent = this.value;
        });
    }

    // Vou carregar seu arquivo JSX hostscript.jsx na inicialização
    loadHostScript();
}

// Use esta função para carregar o arquivo JSX
function loadHostScript() {
    log('Carregando hostscript.jsx...');
    
    const extensionPath = csInterface.getSystemPath(SystemPath.EXTENSION);
    const jsxPath = extensionPath + '/jsx/hostscript.jsx';
    
    csInterface.evalScript(`$.evalFile("${jsxPath.replace(/\\/g, '\\\\')}")`, function(result) {
        if (result && result !== "EvalScript error.") {
            log('✓ hostscript.jsx carregado com sucesso');
        } else {
            log('✗ Erro ao carregar hostscript.jsx: ' + result);
            log('Funcionalidade pode estar limitada');
        }
    });
}

// Vou modificar o event listener de load para incluir inicialização da sua UI
window.addEventListener('load', function() {
    createDiagnosticButton();
    
    // Vou criar botões de teste
    const testJSXBtn = document.createElement('button');
    testJSXBtn.textContent = 'Test JSX Communication';
    testJSXBtn.style.backgroundColor = '#28a745';
    testJSXBtn.style.color = 'white';
    testJSXBtn.style.padding = '10px';
    testJSXBtn.style.margin = '10px 5px';
    testJSXBtn.onclick = testSimpleJSX;
    
    const hostBtn = document.createElement('button');
    hostBtn.textContent = 'Check Host Environment';
    hostBtn.style.backgroundColor = '#17a2b8';
    hostBtn.style.color = 'white';
    hostBtn.style.padding = '10px';
    hostBtn.style.margin = '10px 5px';
    hostBtn.onclick = debugHost;
    
    const exposeBtn = document.createElement('button');
    exposeBtn.textContent = 'Ensure Functions Exposed';
    exposeBtn.style.backgroundColor = '#ffc107';
    exposeBtn.style.color = 'black';
    exposeBtn.style.padding = '10px';
    exposeBtn.style.margin = '10px 5px';
    exposeBtn.onclick = ensureFunctionsExposed;
    
    const logDiv = document.getElementById('log');
    if (logDiv) {
        const btnContainer = document.createElement('div');
        btnContainer.style.display = 'flex';
        btnContainer.style.flexWrap = 'wrap';
        btnContainer.appendChild(testJSXBtn);
        btnContainer.appendChild(hostBtn);
        btnContainer.appendChild(exposeBtn);
        logDiv.parentNode.insertBefore(btnContainer, logDiv);
    }
    
    // Vou inicializar sua interface do usuário
    initializeUI();
    
    setTimeout(() => log('✓ Extensão inicializada'), 300);
});

// Aqui está um exemplo de uso de Node.js
const fs = require('fs');
const path = require('path');

// Exemplo: você pode ler um arquivo local
function lerArquivoLocal(nomeArquivo) {
    const caminho = path.join(__dirname, nomeArquivo);
    fs.readFile(caminho, 'utf8', (err, data) => {
        if (err) {
            log('Erro ao ler arquivo: ' + err.message);
        } else {
            log('Conteúdo do arquivo: ' + data);
        }
    });
}

// Vou adicionar suas novas funções ao escopo global para acesso aos botões
window.testSimpleJSX = testSimpleJSX;
window.debugHost = debugHost;
window.ensureFunctionsExposed = ensureFunctionsExposed;

// Vou exportar suas funções para uso global
window.executeBackFill = executeBackFill;
window.log = log;
window.debugSequenceStatus = debugSequenceStatus;
window.executeVerticalStack = executeVerticalStack;

const pulsemark = require('../node/pulsemark.js');
const voidtrim = require('../node/voidtrim.js');

// exemplo de uso:
pulsemark.analyzeAudioAndAddMarkers('caminho/do/audio.wav', 120, (result) => {
    log('PulseMark:', JSON.stringify(result));
});
