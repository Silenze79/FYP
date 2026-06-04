package com.mathgame.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AiService {

    private final String apiKey;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final HttpClient httpClient = HttpClient.newHttpClient();

    public AiService(@Value("${openai.api-key:}") String apiKey) {
        this.apiKey = apiKey == null ? "" : apiKey;
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> chat(String message, List<Map<String, String>> history, Map<String, Object> userProgress)
            throws Exception {

        if (apiKey.isBlank()) {
            throw new IllegalStateException("AI service not configured. Please add your OpenAI API key.");
        }

        List<Map<String, String>> messages = new ArrayList<>();
        messages.add(Map.of("role", "system", "content", buildSystemPrompt(userProgress)));

        if (history != null) {
            int start = Math.max(0, history.size() - 10);
            messages.addAll(history.subList(start, history.size()));
        }
        messages.add(Map.of("role", "user", "content", message));

        Map<String, Object> body = new HashMap<>();
        body.put("model", "gpt-4o-mini");
        body.put("messages", messages);
        body.put("temperature", 0.7);
        body.put("max_tokens", 800);

        String requestBody = objectMapper.writeValueAsString(body);
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://api.openai.com/v1/chat/completions"))
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + apiKey)
                .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        JsonNode root = objectMapper.readTree(response.body());

        if (response.statusCode() != 200) {
            String errorMsg = root.path("error").path("message").asText("Unknown error");
            throw new IllegalStateException("AI service error: " + errorMsg);
        }

        String aiResponse = root.path("choices").path(0).path("message").path("content").asText(null);
        if (aiResponse == null || aiResponse.isBlank()) {
            throw new IllegalStateException("No response content from AI service");
        }

        Map<String, Object> result = new HashMap<>();
        result.put("response", aiResponse);
        if (root.has("usage")) {
            result.put("usage", objectMapper.convertValue(root.get("usage"), Map.class));
        }
        return result;
    }

    @SuppressWarnings("unchecked")
    private String buildSystemPrompt(Map<String, Object> userProgress) {
        String skillInfo = "Not available";
        if (userProgress != null && userProgress.get("skillLevels") instanceof Map<?, ?> skills) {
            StringBuilder sb = new StringBuilder();
            skills.forEach((k, v) -> sb.append(k).append(": ").append(v).append("%, "));
            if (!sb.isEmpty()) {
                skillInfo = sb.substring(0, sb.length() - 2);
            }
        }

        return """
                You are an expert mathematics tutor with a friendly, encouraging personality. You specialize in helping students learn arithmetic, algebra, geometry, and statistics.

                Student's current skill levels: %s

                Keep responses concise and focused (under 250 words unless solving a complex problem).
                """.formatted(skillInfo);
    }
}
