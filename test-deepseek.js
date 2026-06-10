const { streamText } = require('ai');
const { createOpenAI } = require('@ai-sdk/openai');

async function test() {
  const deepseek = createOpenAI({
    apiKey: 'sk-0ebc93d9dab44827adab72f3cdb88738',
    baseURL: 'https://api.deepseek.com/v1'
  });

  try {
    const result = streamText({
      model: deepseek.chat('deepseek-chat'),
      prompt: 'Hello, world!',
    });

    for await (const chunk of result.textStream) {
      process.stdout.write(chunk);
    }
    console.log('\nDone.');
  } catch (error) {
    console.error('Error:', error);
  }
}

test();
