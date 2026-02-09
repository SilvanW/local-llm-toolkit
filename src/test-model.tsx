import { Form, ActionPanel, Action, showToast, Detail } from "@raycast/api";
import { useState } from "react";
import { extractNonThinkingMessage } from "./parser";

type Values = {
  url: string;
  port: string;
  modelname: string;
  dropdown: string;
};

export default function Command() {
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(values: Values) {
    setSubmitted(true);
    setIsLoading(true);
    showToast({ title: "Submitted form" });

    // Build endpoint from user input
    const endpoint = `${values.url}:${values.port}/v1/chat/completions`;

    const body = {
      model: values.modelname,
      messages: [
        {
          role: "user",
          content: "What is the capital of France?",
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
      <Form.TextField id="url" title="Base URL" placeholder="http://localhost" defaultValue="http://localhost" />
      <Form.TextField id="port" title="Port" placeholder="1234" defaultValue="1234" />
      <Form.TextField id="modelname" title="Model Name" placeholder="Enter model name" defaultValue="qwen/qwen3-1.7b" />
      <Form.Dropdown id="dropdown" title="Model Provider">
        <Form.Dropdown.Item value="openai" title="OpenAI" />
      </Form.Dropdown>
    </Form>
  );
}
