# Nuclei Host-Port Security Scan

## Service
LDAP HTTP Authentication API

## Target
http://host.docker.internal:3001

The service is published on localhost:3001 on the Windows host.

Because Nuclei runs inside Docker, host.docker.internal is used to access the host's published port.

## Scan Details
- Date: October 14, 2026
- Tool: Nuclei v3.11.1
- Scan type: Targeted scan
- Template: node-express-dev-env
- Severity: Medium
- Result: 1 finding
- Scan status: Completed

## Finding
Node.js Express NODE_ENV Development Mode

The application exposes an internal stack trace when malformed JSON is submitted.

## Evidence
ldap-localhost-summary.json

## Remediation
The remediation is documented separately in REMEDIATION.md.

The corrected image was successfully retested in an isolated Docker container. The original running container has not yet been replaced.

## Limitations
This scan evaluates the HTTP API on port 3001, not the LDAP protocol or the TLS service on port 636.

This targeted scan does not replace a comprehensive vulnerability assessment.
