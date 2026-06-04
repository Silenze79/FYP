package com.mathgame.controller;

import com.mathgame.security.UserPrincipal;
import com.mathgame.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/make-server-769bc21d")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUser(@PathVariable String userId) {
        UserPrincipal principal = requirePrincipal();
        if (principal == null) {
            return unauthorized();
        }
        return ResponseEntity.ok(userService.getUserProfile(userId));
    }

    @PutMapping("/user/{userId}")
    public ResponseEntity<?> updateUser(@PathVariable String userId, @RequestBody Map<String, Object> updates) {
        UserPrincipal principal = requirePrincipal();
        if (principal == null) {
            return unauthorized();
        }
        if (!principal.userId().equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Unauthorized to update this profile"));
        }
        return ResponseEntity.ok(Map.of("user", userService.updateUser(userId, updates)));
    }

    @DeleteMapping("/user/{userId}")
    public ResponseEntity<?> deleteUser(@PathVariable String userId) {
        UserPrincipal principal = requirePrincipal();
        if (principal == null) {
            return unauthorized();
        }
        if (!principal.userId().equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Unauthorized to delete this account"));
        }
        userService.deleteUser(userId);
        return ResponseEntity.ok(Map.of("success", true));
    }

    @GetMapping("/user/{userId}/reward-obtain")
    public ResponseEntity<?> getRewardsObtained(@PathVariable String userId) {
        UserPrincipal principal = requirePrincipal();
        if (principal == null) {
            return unauthorized();
        }
        if (!principal.userId().equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Unauthorized"));
        }
        return ResponseEntity.ok(Map.of("rewardsObtained", userService.loadRewardsObtained(userId)));
    }

    @GetMapping("/progress/{userId}")
    public ResponseEntity<?> getProgress(@PathVariable String userId) {
        UserPrincipal principal = requirePrincipal();
        if (principal == null) {
            return unauthorized();
        }
        if (!principal.userId().equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Unauthorized"));
        }
        return ResponseEntity.ok(userService.getProgress(userId));
    }

    @PutMapping("/progress/{userId}")
    public ResponseEntity<?> updateProgress(@PathVariable String userId, @RequestBody Map<String, Object> updates) {
        UserPrincipal principal = requirePrincipal();
        if (principal == null) {
            return unauthorized();
        }
        if (!principal.userId().equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Unauthorized to update this progress"));
        }
        return ResponseEntity.ok(Map.of("progress", userService.updateProgress(userId, updates)));
    }

    @PostMapping("/progress/{userId}/claim-reward")
    public ResponseEntity<?> claimReward(@PathVariable String userId, @RequestBody Map<String, String> body) {
        UserPrincipal principal = requirePrincipal();
        if (principal == null) {
            return unauthorized();
        }
        if (!principal.userId().equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Unauthorized"));
        }
        String rewardId = body.get("rewardId");
        try {
            return ResponseEntity.ok(Map.of("progress", userService.claimReward(userId, rewardId)));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/leaderboard")
    public ResponseEntity<?> getLeaderboard() {
        if (requirePrincipal() == null) {
            return unauthorized();
        }
        return ResponseEntity.ok(Map.of("leaderboard", userService.getLeaderboard()));
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
}
