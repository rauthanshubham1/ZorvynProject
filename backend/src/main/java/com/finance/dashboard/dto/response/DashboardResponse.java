package com.finance.dashboard.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class DashboardResponse {
    private Double totalIncome;
    private Double totalExpense;
    private Double netBalance;
}