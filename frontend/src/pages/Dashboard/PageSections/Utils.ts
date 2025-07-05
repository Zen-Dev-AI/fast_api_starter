// const handleSubmit = async (e: React.FormEvent) => {
//   e.preventDefault();
//   if (!input.trim()) return;
//   setIsLoading(true);
//   setError(null);

//   const userMessage = { id: Date.now(), role: 'user', content: input.trim() };
//   setMessages((prev) => [...prev, userMessage]);
//   setInput('');

//   try {
//     const res = await fetch('http://localhost:8000/langgraph/chat-stream', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({
//         prompt: userMessage.content,
//         model_name: selectedModel,
//         system_message: systemPrompt,
//         temperature: temperature[0],
//         thread_id: 'test1',
//       }),
//       signal: controller.signal,
//     });

//     const reader = res.body?.getReader();
//     const decoder = new TextDecoder('utf-8');
//     let aiResponse = '';

//     if (!reader) throw new Error('No response stream');

//     while (true) {
//       const { value, done } = await reader.read();
//       if (done) break;

//       const chunk = decoder.decode(value, { stream: true });
//       const lines = chunk
//         .split('\n')
//         .filter((line) => line.startsWith('data: '))
//         .map((line) => line.replace('data: ', ''));

//       for (const line of lines) {
//         if (line === '[DONE]') continue;
//         if (line.startsWith('[ERROR]')) {
//           setError(new Error(line.replace('[ERROR]', '').trim()));
//           break;
//         }
//         aiResponse += line;
//         setMessages((prev) => [
//           ...prev.filter((m) => m.id !== 'ai'),
//           { id: 'ai', role: 'assistant', content: aiResponse },
//         ]);
//       }
//     }
//   } catch (err: any) {
//     setError(err);
//   } finally {
//     setIsLoading(false);
//     setAbortController(null);
//   }
// };
