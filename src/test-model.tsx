import { Form, ActionPanel, Action, showToast, Detail } from "@raycast/api";
import { useEffect, useState } from "react";
import { extractNonThinkingMessage } from "./parser";

type Values = {
  url: string;
  port: string;
  model: string;
  dropdown: string;
  prompt: string;
};

export default function Command() {
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Track url and port for model fetching
  const [url, setUrl] = useState("http://localhost");
  const [port, setPort] = useState("1234");
  const [models, setModels] = useState<string[]>([]);

  // Fetch models when url or port changes
  useEffect(() => {
    async function fetchModels() {
      try {
        const endpoint = `${url}:${port}/v1/models`;
        const response = await fetch(endpoint);
        const data = await response.json();
        setModels(data.data?.map((m: any) => m.id) || []);
      } catch {
        setModels([]);
      }
    }
    fetchModels();
  }, [url, port]);

  async function handleSubmit(values: Values) {
    setSubmitted(true);
    setIsLoading(true);
    showToast({ title: "Submitted form" });

    // Build endpoint from user input
    const endpoint = `${values.url}:${values.port}/v1/chat/completions`;

    const body = {
      model: values.model,
      messages: [
        {
          role: "user",
          content: values.prompt,
        },
      ],
    };

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      setResult(extractNonThinkingMessage(data["choices"]?.[0]?.message?.content || "No response"));
    } catch (error: any) {
      setResult(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }

  if (submitted) {
    return (
      <Detail
        isLoading={isLoading}
        markdown={result || ""}
        actions={
          <ActionPanel>
            <Action title="Back" onAction={() => setSubmitted(false)} />
          </ActionPanel>
        }
      />
    );
  }

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.Dropdown id="dropdown" title="Model Provider" storeValue={true}>
        <Form.Dropdown.Item value="openai" title="OpenAI" />
      </Form.Dropdown>
      <Form.TextField
        id="url"
        title="Base URL"
        placeholder="http://localhost"
        defaultValue={url}
        storeValue={true}
        onChange={setUrl}
      />
      <Form.TextField id="port" title="Port" placeholder="1234" defaultValue={port} storeValue={true} onChange={setPort}/>
      <Form.Dropdown id="model" title="Model" storeValue={true}>
{models.length === 0 ? (
          <Form.Dropdown.Item value="" title="No models found" />
        ) : (
          models.map((model) => (
            <Form.Dropdown.Item key={model} value={model} title={model} />
          ))
        )}
      </Form.Dropdown>
      <Form.TextField
        id="prompt"
        title="Prompt"
        placeholder="Enter your prompt here"
        defaultValue="Are you there?"
        storeValue={true}
      />
    </Form>
  );
}
