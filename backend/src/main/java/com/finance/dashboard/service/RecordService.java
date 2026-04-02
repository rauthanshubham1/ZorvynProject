package com.finance.dashboard.service;

import com.finance.dashboard.dto.request.RecordRequest;
import com.finance.dashboard.entity.FinancialRecord;
import com.finance.dashboard.entity.User;
import com.finance.dashboard.repository.FinancialRecordRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.time.LocalDate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

@Service
@RequiredArgsConstructor
public class RecordService {

    private final FinancialRecordRepository repo;

    public FinancialRecord create(RecordRequest req, User user) {

        FinancialRecord r = new FinancialRecord();
        r.setAmount(req.getAmount());
        r.setType(req.getType());
        r.setCategory(req.getCategory());
        r.setDate(req.getDate());
        r.setNotes(req.getNotes());
        r.setUser(user);

        return repo.save(r);
    }

    public Page<FinancialRecord> getAll(String search, String category, String type, LocalDate startDate,
            LocalDate endDate, int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name()) ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return repo.findFiltered(search, category, type, startDate, endDate, pageable);
    }

    public FinancialRecord update(Long id, RecordRequest req) {
        FinancialRecord r = repo.findById(id).orElseThrow(() -> new RuntimeException("Record not found"));
        r.setAmount(req.getAmount());
        r.setType(req.getType());
        r.setCategory(req.getCategory());
        r.setDate(req.getDate());
        r.setNotes(req.getNotes());
        return repo.save(r);
    }

    public void delete(Long id) {
        FinancialRecord r = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Record not found"));

        r.setDeleted(true);
        repo.save(r);
    }
}