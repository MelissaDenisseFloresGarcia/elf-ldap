# Nuclei Windows Scan Results

Service: LDAP Authentication HTTP API
Target: http://127.0.0.1:3001
Tool: ProjectDiscovery Nuclei v3.11.1
Templates version: v10.5.0
Date: October 14, 2026
Severity: Medium, High, Critical
Templates loaded: 6607
Duration: 10m 41s
Findings: 1
Execution errors: 44
Status: Completed

## Finding

- Template ID: node-express-dev-env
- Severity: Medium
- Description: Express exposes development-style error details, including an internal stack trace.
- Classification: CWE-209, Information Exposure Through an Error Message.

## Remediation

Configure the application to run with NODE_ENV=production,
rebuild the Docker image, and redeploy the updated container.

The finding applies to the original container scanned on port 3001.
A previous isolated remediation test does not establish that
the original running container has been updated.

## Limitations

The scan covered Nuclei templates with Medium, High, and Critical severity.
Execution errors were recorded and may affect individual checks.
No authentication-based testing was performed.
The results do not prove that the service is free of other vulnerabilities.
This scan evaluated the HTTP authentication API, not the LDAP protocol or TLS service on port 636.

