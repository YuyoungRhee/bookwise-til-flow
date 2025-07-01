package com.example.backend;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import static org.assertj.core.api.Assertions.assertThat;

import java.util.Map;
import java.util.List;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
public class BookSearchControllerTest {
    @LocalServerPort
    private int port;

    @Autowired
    private TestRestTemplate restTemplate;

    @Test
    void searchBooks_returns10ItemsAnd200OK() {
        String query = "스프링";
        String url = "http://localhost:" + port + "/api/books/search?query=" + query;
        ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);

        // 200 OK 확인
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);

        // item이 10개인지 확인
        Map<String, Object> body = response.getBody();
        assertThat(body).isNotNull();
        List<?> items = (List<?>) body.get("item");
        assertThat(items).hasSize(10);
    }
} 