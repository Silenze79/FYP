package com.mathgame.util;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.AttributeConverter;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public final class JsonConverter {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    private JsonConverter() {
    }

    public static class StringListConverter implements AttributeConverter<List<String>, String> {

        @Override
        public String convertToDatabaseColumn(List<String> attribute) {
            if (attribute == null) {
                return "[]";
            }
            try {
                return MAPPER.writeValueAsString(attribute);
            } catch (JsonProcessingException e) {
                throw new IllegalStateException(e);
            }
        }

        @Override
        public List<String> convertToEntityAttribute(String dbData) {
            if (dbData == null || dbData.isBlank()) {
                return new ArrayList<>();
            }
            try {
                return MAPPER.readValue(dbData, new TypeReference<>() {});
            } catch (JsonProcessingException e) {
                throw new IllegalStateException(e);
            }
        }
    }

    public static class SkillLevelsConverter implements AttributeConverter<Map<String, Integer>, String> {

        @Override
        public String convertToDatabaseColumn(Map<String, Integer> attribute) {
            if (attribute == null) {
                return "{}";
            }
            try {
                return MAPPER.writeValueAsString(attribute);
            } catch (JsonProcessingException e) {
                throw new IllegalStateException(e);
            }
        }

        @Override
        public Map<String, Integer> convertToEntityAttribute(String dbData) {
            if (dbData == null || dbData.isBlank()) {
                return new HashMap<>();
            }
            try {
                return MAPPER.readValue(dbData, new TypeReference<>() {});
            } catch (JsonProcessingException e) {
                throw new IllegalStateException(e);
            }
        }
    }
}
