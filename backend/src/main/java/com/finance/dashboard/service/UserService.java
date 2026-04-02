package com.finance.dashboard.service;

import com.finance.dashboard.dto.request.CreateUserRequest;
import com.finance.dashboard.dto.response.UserResponse;
import com.finance.dashboard.entity.Role;
import com.finance.dashboard.entity.User;
import com.finance.dashboard.repository.RoleRepository;
import com.finance.dashboard.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Set;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepo;
    private final RoleRepository roleRepo;
    private final PasswordEncoder encoder;

    public UserResponse createUser(CreateUserRequest req) {

        if (userRepo.findByEmail(req.getEmail()).isPresent()) {
            throw new RuntimeException("User already exists");
        }

        Role role = roleRepo.findByName(req.getRole())
                .orElseThrow(() -> new RuntimeException("Role not found"));

        User user = new User();
        user.setName(req.getName());
        user.setEmail(req.getEmail());
        user.setPassword(encoder.encode(req.getPassword()));
        user.setStatus("ACTIVE");
        user.setRoles(Set.of(role));

        userRepo.save(user);

        return new UserResponse(user.getId(), user.getName(), user.getEmail(), user.getStatus(), user.getRoles());
    }

    public Page<UserResponse> getAllUsers(String search, int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name()) ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return userRepo.searchUsers(search, pageable)
                .map(u -> new UserResponse(u.getId(), u.getName(), u.getEmail(), u.getStatus(), u.getRoles()));
    }

    public void updateStatus(Long id, String status) {
        User user = userRepo.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        user.setStatus(status);
        userRepo.save(user);
    }

    public void assignRoles(Long id, Set<String> roleNames) {
        User user = userRepo.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        Set<Role> roles = roleNames.stream()
                .map(name -> roleRepo.findByName(name)
                        .orElseThrow(() -> new RuntimeException("Role not found: " + name)))
                .collect(Collectors.toSet());
        user.setRoles(roles);
        userRepo.save(user);
    }
}