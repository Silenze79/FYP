package com.mathgame.controller;

import com.mathgame.security.UserPrincipal;
import com.mathgame.service.RewardService;
import com.mathgame.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/make-server-769bc21d/rewards")
public class RewardController {

    private final RewardService rewardService;
    private final UserService userService;

    public RewardController(RewardService rewardService, UserService userService) {
        this.rewardService = rewardService;
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<?> getRewards() {
        if (requirePrincipal() == null) {
            return unauthorized();
        }
        return ResponseEntity.ok(Map.of("rewards", rewardService.getAllRewards()));
    }

    @PostMapping
    public ResponseEntity<?> addReward(@RequestBody Map<String, Object> body) {
        UserPrincipal principal = requirePrincipal();
        if (principal == null) {
            return unauthorized();
        }
        if (!userService.isAdmin(principal.userId())) {
            return forbidden();
        }
        return ResponseEntity.ok(Map.of("reward", rewardService.addReward(body)));
    }

    @PutMapping("/{rewardId}")
    public ResponseEntity<?> updateReward(@PathVariable String rewardId, @RequestBody Map<String, Object> body) {
        UserPrincipal principal = requirePrincipal();
        if (principal == null) {
            return unauthorized();
        }
        if (!userService.isAdmin(principal.userId())) {
            return forbidden();
        }
        return ResponseEntity.ok(Map.of("reward", rewardService.updateReward(rewardId, body)));
    }

    @DeleteMapping("/{rewardId}")
    public ResponseEntity<?> deleteReward(@PathVariable String rewardId) {
        UserPrincipal principal = requirePrincipal();
        if (principal == null) {
            return unauthorized();
        }
        if (!userService.isAdmin(principal.userId())) {
            return forbidden();
        }
        rewardService.deleteReward(rewardId);
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
