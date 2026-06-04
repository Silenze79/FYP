package com.mathgame.controller;

import com.mathgame.security.UserPrincipal;
import com.mathgame.service.QuestionService;
import com.mathgame.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/make-server-769bc21d/questions")
public class QuestionController {

    private final QuestionService questionService;
    private final UserService userService;

    public QuestionController(QuestionService questionService, UserService userService) {
        this.questionService = questionService;
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<?> getQuestions() {
        if (requirePrincipal() == null) {
            return unauthorized();
        }
        return ResponseEntity.ok(Map.of("questions", questionService.getAllQuestions()));
    }

    @PostMapping
    public ResponseEntity<?> addQuestion(@RequestBody Map<String, Object> body) {
        UserPrincipal principal = requirePrincipal();
        if (principal == null) {
            return unauthorized();
        }
        if (!userService.isAdmin(principal.userId())) {
            return forbidden();
        }
        return ResponseEntity.ok(Map.of("question", questionService.addQuestion(body)));
    }

    @PutMapping("/{questionId}")
    public ResponseEntity<?> updateQuestion(
            @PathVariable String questionId,
            @RequestBody Map<String, Object> body) {
        UserPrincipal principal = requirePrincipal();
        if (principal == null) {
            return unauthorized();
        }
        if (!userService.isAdmin(principal.userId())) {
            return forbidden();
        }
        return ResponseEntity.ok(Map.of("question", questionService.updateQuestion(questionId, body)));
    }

    @DeleteMapping("/{questionId}")
    public ResponseEntity<?> deleteQuestion(@PathVariable String questionId) {
        UserPrincipal principal = requirePrincipal();
        if (principal == null) {
            return unauthorized();
        }
        if (!userService.isAdmin(principal.userId())) {
            return forbidden();
        }
        questionService.deleteQuestion(questionId);
        return ResponseEntity.ok(Map.of("success", true));
    }

    private UserPrincipal requirePrincipal() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserPrincipal principal) {
            return principal;
        }
        return null;
    }

    private ResponseEntity<Map<String, String>> unauthorized() {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Not authenticated"));
    }

    private ResponseEntity<Map<String, String>> forbidden() {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Unauthorized - admin only"));
    }
}
