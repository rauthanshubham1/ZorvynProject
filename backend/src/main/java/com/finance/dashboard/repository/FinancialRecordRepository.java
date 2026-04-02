package com.finance.dashboard.repository;

import com.finance.dashboard.entity.FinancialRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;
import java.time.LocalDate;
import org.springframework.data.repository.query.Param;

public interface FinancialRecordRepository extends JpaRepository<FinancialRecord, Long> {

        @Query("SELECT SUM(r.amount) FROM FinancialRecord r WHERE r.type='INCOME' AND r.isDeleted=false")
        Double totalIncome();

        @Query("SELECT SUM(r.amount) FROM FinancialRecord r WHERE r.type='EXPENSE' AND r.isDeleted=false")
        Double totalExpense();

        List<FinancialRecord> findByIsDeletedFalse();

        @Query("SELECT r FROM FinancialRecord r " +
                        "WHERE (:category IS NULL OR r.category = :category) " +
                        "AND (:type IS NULL OR r.type = :type) " +
                        "AND (cast(:startDate as date) IS NULL OR r.date >= :startDate) " +
                        "AND (cast(:endDate as date) IS NULL OR r.date <= :endDate) " +
                        "AND (:search = '' OR LOWER(r.notes) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(r.category) LIKE LOWER(CONCAT('%', :search, '%'))) "
                        +
                        "AND r.isDeleted = false")
        Page<FinancialRecord> findFiltered(
                        @Param("search") String search,
                        @Param("category") String category,
                        @Param("type") String type,
                        @Param("startDate") LocalDate startDate,
                        @Param("endDate") LocalDate endDate,
                        Pageable pageable);

        @Query("SELECT r.category, SUM(r.amount) FROM FinancialRecord r WHERE r.isDeleted = false GROUP BY r.category")
        List<Object[]> getCategoryWiseTotals();

        List<FinancialRecord> findTop5ByIsDeletedFalseOrderByDateDesc();
}