# Local LLM Toolkit

Provides tools for easier local LLM use

## Test Endpoint

```curl
curl -X POST "http://localhost:8000/v1/chat/completions" \
	-H "Content-Type: application/json" \
	--data '{
		"model": "Qwen/Qwen3-8B-AWQ",
		"messages": [
			{
				"role": "user",
				"content": "What is the capital of France?"
			}
		]
	}'
```