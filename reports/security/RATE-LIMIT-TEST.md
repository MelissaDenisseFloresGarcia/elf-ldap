# HTTPS Login Rate Limiting Test

## Test environment
- Application: ELF LDAP Authentication API
- Test endpoint: https://127.0.0.1:3636/login
- Middleware: express-rate-limit 8.7.1
- Configured limit: 5 requests per 10 minutes
- Environment: Isolated Docker test container

## Observed results

| Attempt | HTTP status |
|---------|-------------|
| 1 | 401 |
| 2 | 401 |
| 3 | 401 |
| 4 | 401 |
| 5 | 401 |
| 6 | 429 |

## Conclusion
The application successfully rejected invalid credentials and enforced
the configured request limit on the sixth authentication attempt.

The test was performed on the isolated HTTPS test service.
Production deployment and per-client IP identification remain pending.

## HTTP Login Rate Limiting Test

- Test endpoint: http://127.0.0.1:3003/login
- Configured limit: 5 requests per 10 minutes
- Test container restarted before execution

### Observed results

| Attempt | HTTP status |
|---------|-------------|
| 1 | 401 |
| 2 | 401 |
| 3 | 401 |
| 4 | 401 |
| 5 | 401 |
| 6 | 429 |

### Conclusion

Rate limiting was successfully verified on both HTTP and HTTPS
test endpoints. The sixth request was rejected with HTTP 429.

These tests do not establish production readiness.
