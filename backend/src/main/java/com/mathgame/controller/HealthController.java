package com.mathgame.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/make-server-769bc21d")
public class HealthController {

    private final com.mathgame.seed.DataSeeder dataSeeder;

    public HealthController(com.mathgame.seed.DataSeeder dataSeeder) {
        this.dataSeeder = dataSeeder;
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "ok"));
    }

    @PostMapping("/seed")
    public ResponseEntity<?> seed() {
        return ResponseEntity.ok(dataSeeder.seed());
    }
}
