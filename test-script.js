import 'dotenv/config';
import { ScriptWriterAgent } from './agents/script-writer-agent.js'; // Ajuste o nome do arquivo se necessário

async function runTest() {
  console.log('Iniciando teste de geração de roteiro com storytelling...');
  const agent = new ScriptWriterAgent();

  try {
    const resultado = await agent.generateScript({
      theme: 'Marco Aurélio e a peste antonina',
      philosophicalAngle: 'Como lidar com o medo do invisível e manter a lucidez em tempos de crise',
      targetDurationMinutes: 3
    });

    console.log('\n--- SUCESSO! ROTEIRO GERADO ---');
    console.log('Título:', resultado.hookTitle);
    console.log('Total de cenas geradas:', resultado.scenes.length);
    console.log('\nPrimeira Cena (Gancho):');
    console.log('Narração:', resultado.scenes[0].narrationText);
    console.log('Prompt de Imagem:', resultado.scenes[0].visualArtPrompt);
    console.log('Direção Sonora:', resultado.scenes[0].soundDirection);
  } catch (error) {
    console.error('Ocorreu um erro no teste:', error);
  }
}

runTest();
