package com.example.backend;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.beans.factory.annotation.Value;

@RestController
public class BookSearchController {
    @Value("${ALADIN_API_KEY}")
    private String aladinApiKey;
    private static final String ALADIN_API_URL = "http://www.aladin.co.kr/ttb/api/ItemSearch.aspx";

    @GetMapping("/api/books/search")
    public ResponseEntity<String> searchBooks(@RequestParam("query") String query) {
        String url = String.format(
            "%s?ttbkey=%s&Query=%s&QueryType=Title&MaxResults=10&start=1&SearchTarget=Book&output=js&Version=20131101",
            ALADIN_API_URL, aladinApiKey, query
        );
        RestTemplate restTemplate = new RestTemplate();
        String response = restTemplate.getForObject(url, String.class);
        return ResponseEntity.ok(response);
    }
} 