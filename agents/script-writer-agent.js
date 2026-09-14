import { GoogleGenAI } from '@google/genai';

const SCRIPT_SYSTEM_INSTRUCTION = `
Você é um roteirista sênior e estrategista de retenção para canais de YouTube de alto impacto.
Sua missão é criar narrativas imersivas, densas e magneticamente envolventes, que prendam o espectador do primeiro ao último segundo.

DIRETRIZES DE RETENÇÃO E TONALIDADE:
1. Regra dos Primeiros 5 Segundos (Anti-Fluff):
   - NUNCA comece com saudações ("Olá", "Bem-vindo ao canal", "Hoje vamos falar sobre").
   - Abra diretamente no meio da ação (in media res), com um paradoxo intrigante, uma pergunta existencial incômoda ou uma quebra de expectativa radical.

2. Storytelling Psicológico & Conexão Cotidiana:
   - Não liste apenas fatos históricos ou curiosidades frias.
   - Conecte cada marco narrativo ou arquétipo de personagem a dilemas da mente humana e conflitos do cotidiano moderno (ambição, ansiedade, busca por propósito, solidão, superação).
   - Use contrastes: o micro (sentimento humano cru) versus o macro (grandes eventos, mitologias ou viradas históricas).

3. Estrutura Rítmica (Open Loops):
   - Mantenha ciclos abertos: resolva uma tensão criando imediatamente uma nova interrogação.
   - O clímax deve oferecer uma revelação profunda, não apenas o fim cronológico da história.
   - O encerramento precisa ressoar emocionalmente, deixando uma provocação prática para a vida de quem assistiu.

4. Formato de Saída Obrigatório:
   - Responda EXCLUSIVAMENTE em formato JSON estruturado com o schema requisitado, sem formatação markdown externa desnecessária.
`;

const SCRIPT_SCHEMA = {
  type: 'object',
  properties: {
    hookTitle: { type: 'string', description: 'Título de trabalho hiper-atraente focado em curiosidade e emoção' },
    targetTone: { type: 'string', description: 'Tonalidade emocional predominante' },
    scenes: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          sceneIndex: { type: 'integer' },
          beatRole: { 
            type: 'string', 
            enum: ['cold_hook', 'context_shift', 'tension_build', 'philosophical_bridge', 'climax', 'epilogue_provocation'],
            description: 'Função dramática da cena no vídeo'
          },
          narrationText: { 
            type: 'string', 
            description: 'Texto exato a ser lido pelo TTS, incluindo pausas naturais com pontuação expressiva' 
          },
          estimatedDurationSeconds: { type: 'integer' },
          soundDirection: { 
            type: 'string', 
            description: 'Instruções de ambiência e dinâmica de áudio' 
          },
          visualArtPrompt: { 
            type: 'string', 
            description: 'Prompt cinematográfico em inglês para IA de imagem/vídeo, detalhando iluminação chiaroscuro, lente e enquadramento' 
          }
        },
        required: ['sceneIndex', 'beatRole', 'narrationText', 'estimatedDurationSeconds', 'soundDirection', 'visualArtPrompt']
      }
    }
  },
  required: ['hookTitle', 'targetTone', 'scenes']
};

export class ScriptWriterAgent {
  constructor(apiKey) {
    this.ai = new GoogleGenAI({ apiKey: apiKey || process.env.GEMINI_API_KEY });
  }

  async generateScript({ theme, philosophicalAngle, targetDurationMinutes = 8 }) {
    const userPrompt = `
Desenvolva um roteiro completo de aproximadamente ${targetDurationMinutes} minutos sobre:
- Tema Central: ${theme}
- Ângulo Psicológico / Filosófico: ${philosophicalAngle}

Requisitos do roteiro:
- Divida o conteúdo em cenas coesas de 10 a 25 segundos cada.
- Cada cena deve ter um objetivo claro de retenção.
- O campo 'visualArtPrompt' DEVE ser em inglês técnico de cinema (especificando proporção, iluminação dramática chiaroscuro, lente 85mm f/1.8 ou similar, enquadramento cinematográfico e textura realista, sem visual cartunesco).
- Retorne apenas o JSON correspondente ao schema especificado.
`;

    const response = await this.ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: userPrompt,
      config: {
        systemInstruction: SCRIPT_SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        responseSchema: SCRIPT_SCHEMA,
        temperature: 0.75,
      }
    });

    try {
      return JSON.parse(response.text);
    } catch (err) {
      throw new Error(`Falha ao decodificar JSON do roteiro: ${err.message}\nResposta bruta: ${response.text}`);
    }
  }
}
