package com.finance.dashboard.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class RecordRequest {

    @Positive
    private Double amount;

    @NotBlank
    private String type; // INCOME / EXPENSE

    private String category;
    private LocalDate date;
    private String notes;
}