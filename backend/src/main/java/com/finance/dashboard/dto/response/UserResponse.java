package com.finance.dashboard.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.Set;
import com.finance.dashboard.entity.Role;

@Getter
@AllArgsConstructor
public class UserResponse {
    private Long id;
    private String name;
    private String email;
    private String status;
    private Set<Role> roles;
}