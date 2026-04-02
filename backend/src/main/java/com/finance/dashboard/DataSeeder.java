package com.finance.dashboard;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.finance.dashboard.entity.Role;
import com.finance.dashboard.entity.User;
import com.finance.dashboard.repository.RoleRepository;
import com.finance.dashboard.repository.UserRepository;

import java.util.Set;

@Component
public class DataSeeder implements CommandLineRunner {

    private final RoleRepository roleRepo;
    private final UserRepository userRepo;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(RoleRepository roleRepo, UserRepository userRepo, PasswordEncoder passwordEncoder) {
        this.roleRepo = roleRepo;
        this.userRepo = userRepo;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {

        // 1. Automatically seed the critical roles if they don't exist
        createRoleIfNotFound("ADMIN");
        createRoleIfNotFound("ANALYST");
        createRoleIfNotFound("VIEWER");

        // 2. Automatically seed a default admin user if one doesn't exist.
        // This is crucial because creating new users requires an ADMIN token!
        if (userRepo.findByEmail("admin@example.com").isEmpty()) {
            User admin = new User();
            admin.setName("Default Admin");
            admin.setEmail("admin@example.com");
            admin.setPassword(passwordEncoder.encode("password")); // Default password
            admin.setStatus("ACTIVE");

            Role adminRole = roleRepo.findByName("ADMIN").orElseThrow();
            admin.setRoles(Set.of(adminRole));

            userRepo.save(admin);
            System.out.println("====== DEFAULT ADMIN USER CREATED ======");
            System.out.println("Email: admin@example.com | Password: password");
        }
    }

    private void createRoleIfNotFound(String name) {
        if (roleRepo.findByName(name).isEmpty()) {
            Role role = new Role();
            role.setName(name);
            roleRepo.save(role);
        }
    }
}
