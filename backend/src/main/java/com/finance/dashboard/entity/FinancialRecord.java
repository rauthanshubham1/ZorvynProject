package com.finance.dashboard.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.time.LocalDate;

@Entity
@Getter
@Setter
public class FinancialRecord {

    @Id
    @GeneratedValue
    private Long id;

    private Double amount;

    private String type; // INCOME / EXPENSE

    private String category;

    private LocalDate date;

    private String notes;

    private boolean isDeleted = false;

    @ManyToOne
    @JsonIgnore
    private User user;
}