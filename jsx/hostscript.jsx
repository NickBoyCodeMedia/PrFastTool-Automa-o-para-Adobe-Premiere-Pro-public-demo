/**
 * hostscript.jsx - Ponte ExtendScript/CEP (Versão Demo)
 * 
 * Este é o script principal que faz a ponte entre a interface CEP (HTML/JS)
 * e o ExtendScript do Premiere Pro.
 * 
 * VERSÃO DEMO: Contém apenas funcionalidades básicas para demonstração.
 * 
 * @author NickBoy - Code&Media
 * @version 1.0 (Demo)
 */

// ============================================================================
// FUNÇÕES UTILITÁRIAS
// ============================================================================

/**
 * Função de log aprimorada para debugging
 */
function log(message, level) {
    var prefix = "[PrFastTool]";
    if (level) prefix += " [" + level + "]";
    
    var logMsg = prefix + " " + message;
    $.writeln(logMsg);
    
    return logMsg;
}

/**
 * Testa a conexão entre CEP e ExtendScript
 */
function testConnection() {
    log("Teste de conexão executado com sucesso", "INFO");
    return JSON.stringify({
        success: true,
        message: "Conexão ExtendScript OK",
        timestamp: new Date().toString(),
        version: "1.0 Demo"
    });
}

// ============================================================================
// FUNÇÕES DE VALIDAÇÃO
// ============================================================================

/**
 * Valida se existe um projeto ativo no Premiere Pro
 */
function validateProject() {
    if (!app.project) {
        return {
            valid: false,
            message: "Nenhum projeto aberto no Premiere Pro"
        };
    }
    return { valid: true };
}

/**
 * Valida se existe uma sequência ativa
 */
function validateSequence() {
    var projectCheck = validateProject();
    if (!projectCheck.valid) return projectCheck;
    
    if (!app.project.activeSequence) {
        return {
            valid: false,
            message: "Nenhuma sequência ativa. Abra uma sequência na timeline."
        };
    }
    
    return { valid: true };
}

// ============================================================================
// FUNÇÃO: OBTER INFORMAÇÕES DA SEQUÊNCIA
// ============================================================================

/**
 * Retorna informações sobre a sequência ativa
 * Demonstra: Acesso à API do Premiere, manipulação de dados
 */
function getSequenceInfo() {
    log("Obtendo informações da sequência...", "INFO");
    
    try {
        var validation = validateSequence();
        if (!validation.valid) {
            return JSON.stringify({
                success: false,
                message: validation.message
            });
        }
        
        var seq = app.project.activeSequence;
        
        var info = {
            success: true,
            name: seq.name,
            duration: seq.end.seconds,
            frameSizeHorizontal: seq.frameSizeHorizontal,
            frameSizeVertical: seq.frameSizeVertical,
            videoTracks: seq.videoTracks.numTracks,
            audioTracks: seq.audioTracks.numTracks,
            frameRate: seq.framerate || "Unknown"
        };
        
        log("Informações obtidas: " + seq.name, "SUCCESS");
        return JSON.stringify(info);
        
    } catch (e) {
        log("Erro ao obter informações: " + e.toString(), "ERROR");
        return JSON.stringify({
            success: false,
            message: "Erro: " + e.toString()
        });
    }
}

// ============================================================================
// FUNÇÃO: CONTAR CLIPES SELECIONADOS
// ============================================================================

/**
 * Conta quantos clipes estão selecionados na timeline
 * Demonstra: Iteração por tracks, verificação de seleção
 */
function countSelectedClips() {
    log("Contando clipes selecionados...", "INFO");
    
    try {
        var validation = validateSequence();
        if (!validation.valid) {
            return JSON.stringify({
                success: false,
                message: validation.message
            });
        }
        
        var seq = app.project.activeSequence;
        var videoClips = 0;
        var audioClips = 0;
        
        // Contar clipes de vídeo
        for (var v = 0; v < seq.videoTracks.numTracks; v++) {
            var track = seq.videoTracks[v];
            for (var c = 0; c < track.clips.numItems; c++) {
                if (track.clips[c].isSelected()) {
                    videoClips++;
                }
            }
        }
        
        // Contar clipes de áudio
        for (var a = 0; a < seq.audioTracks.numTracks; a++) {
            var track = seq.audioTracks[a];
            for (var c = 0; c < track.clips.numItems; c++) {
                if (track.clips[c].isSelected()) {
                    audioClips++;
                }
            }
        }
        
        var total = videoClips + audioClips;
        log("Clipes selecionados: " + total + " (V:" + videoClips + " A:" + audioClips + ")", "SUCCESS");
        
        return JSON.stringify({
            success: true,
            total: total,
            video: videoClips,
            audio: audioClips
        });
        
    } catch (e) {
        log("Erro ao contar clipes: " + e.toString(), "ERROR");
        return JSON.stringify({
            success: false,
            message: "Erro: " + e.toString()
        });
    }
}

// ============================================================================
// FUNÇÃO DEMO: EXEMPLO DE AUTOMAÇÃO BÁSICA
// ============================================================================

/**
 * Exemplo de função de automação básica
 * NOTA: Esta é uma versão simplificada para demonstração
 */
function demoAutomation() {
    log("Executando automação demo...", "INFO");
    
    try {
        var validation = validateSequence();
        if (!validation.valid) {
            return JSON.stringify({
                success: false,
                message: validation.message
            });
        }
        
        // Simulação de processamento
        $.sleep(500);
        
        return JSON.stringify({
            success: true,
            message: "Automação demo executada com sucesso",
            note: "Esta é uma versão simplificada para demonstração"
        });
        
    } catch (e) {
        log("Erro na automação: " + e.toString(), "ERROR");
        return JSON.stringify({
            success: false,
            message: "Erro: " + e.toString()
        });
    }
}

// ============================================================================
// EXPORTS PARA CEP
// ============================================================================

/**
 * Funções principais disponíveis para o CEP
 * 
 * NOTA PARA RECRUTADORES:
 * Esta versão demo contém apenas funcionalidades básicas.
 * O projeto completo inclui:
 * - Detecção e remoção automática de silêncio
 * - Criação de subclips com nomenclatura inteligente
 * - Randomização de sequências
 * - Análise de áudio com FFmpeg
 * - Sistema de marcadores inteligentes
 * 
 * Entre em contato para mais informações sobre o projeto completo.
 */

// Lista de funções exportadas (comentadas para referência)
/*
FUNÇÕES DISPONÍVEIS NESTA DEMO:
- testConnection()
- getSequenceInfo()
- countSelectedClips()
- demoAutomation()

FUNÇÕES NA VERSÃO COMPLETA (não incluídas nesta demo):
- removeSilenceSegments()
- createSubclipsAdvanced()
- randomizeClipsWithPreservation()
- addBeatsToTimeline()
- executeBackFill()
- executeVerticalStack()
*/

log("=== PrFastTool HostScript (Demo) Carregado ===", "INFO");
log("Versão: 1.0 Demo", "INFO");
log("Funções disponíveis: testConnection, getSequenceInfo, countSelectedClips", "INFO");
