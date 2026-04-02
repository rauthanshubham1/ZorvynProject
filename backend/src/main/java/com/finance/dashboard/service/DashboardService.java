package com.finance.dashboard.service;

import java.util.HashMap;
import java.util.Map;
import java.util.List;

import org.springframework.stereotype.Service;

import com.finance.dashboard.repository.FinancialRecordRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final FinancialRecordRepository repo;

    public Map<String, Object> getSummary() {
        Double income = repo.totalIncome();
        Double expense = repo.totalExpense();

        Map<String, Object> map = new HashMap<>();
        map.put("income", income == null ? 0 : income);
        map.put("expense", expense == null ? 0 : expense);
        map.put("net", (income == null ? 0 : income) - (expense == null ? 0 : expense));

        List<Object[]> categoryTotals = repo.getCategoryWiseTotals();
        Map<String, Double> catMap = new HashMap<>();
        for (Object[] row : categoryTotals) {
            catMap.put((String) row[0], row[1] == null ? 0D : ((Number) row[1]).doubleValue());
        }
        map.put("categoryTotals", catMap);

        map.put("recentActivity", repo.findTop5ByIsDeletedFalseOrderByDateDesc());

        return map;
    }
}
