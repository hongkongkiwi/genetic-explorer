# GDPR & Global Data Protection Compliance

This document outlines Genetic Explorer's compliance with GDPR (EU), CCPA/CPRA (California), LGPD (Brazil), and other global data protection regulations.

## Table of Contents

1. [Overview](#overview)
2. [Data Subject Rights](#data-subject-rights)
3. [Consent Management](#consent-management)
4. [Data Retention](#data-retention)
5. [Security Measures](#security-measures)
6. [International Data Transfers](#international-data-transfers)
7. [Data Breach Procedures](#data-breach-procedures)
8. [Jurisdiction-Specific Requirements](#jurisdiction-specific-requirements)
9. [Compliance Checklist](#compliance-checklist)

---

## Overview

Genetic Explorer processes genetic data, which is classified as **special category data** under GDPR and similar regulations. We implement enhanced protections including:

- **Encryption at rest and in transit** (AES-256-GCM)
- **Granular consent management** for each processing purpose
- **Data minimization** - only collect what's necessary
- **Purpose limitation** - data only used for specified purposes
- **Storage limitation** - automatic deletion after retention period
- **Privacy by design** - privacy built into architecture

### Legal Basis for Processing

| Processing Activity | Legal Basis | Jurisdiction |
|-------------------|-------------|--------------|
| Account creation | Contract | All |
| Genetic analysis | Consent | GDPR, LGPD |
| Health reports | Consent | GDPR, LGPD, PIPEDA |
| Ancestry analysis | Consent | All |
| Security measures | Legitimate interest | All |
| Research participation | Consent | All |
| Marketing | Consent | GDPR, CCPA, LGPD |

---

## Data Subject Rights

### GDPR Rights (Articles 15-22)

We support all GDPR data subject rights:

#### 1. Right of Access (Article 15)

Users can request a complete copy of their personal data:

```bash
GET /api/export/gdpr
```

Returns JSON export including:
- User profile information
- Genetic data metadata (not raw files)
- Health and ancestry reports
- Activity logs
- Sharing permissions
- Consent records

**Timeline**: 30 days (free of charge)

#### 2. Right to Rectification (Article 16)

Users can update their profile information:

```bash
PUT /api/profile
PUT /api/user/profile
```

**Note**: Genetic data cannot be modified (it's read-only from the uploaded file).

#### 3. Right to Erasure ("Right to be Forgotten") (Article 17)

Two options available:

**Option A: Delete Genome Data Only**
```bash
DELETE /api/genomes/delete-all
```
- Removes all genetic data, reports, analyses
- Preserves account and settings
- User can upload new genomes later

**Option B: Complete Account Deletion**
```bash
DELETE /api/auth/delete-account
```
- Deletes entire account and all data
- Irreversible action

**Timeline**: Immediate for genome data, 30 days for backups

#### 4. Right to Restrict Processing (Article 18)

Users can request restriction of processing:

```bash
POST /api/privacy/rights
{
  "right": "RESTRICTION",
  "jurisdiction": "GDPR",
  "details": {
    "reason": "CONTEST_ACCURACY",
    "scope": ["HEALTH_INSIGHTS"]
  }
}
```

**Grounds for restriction**:
- Contesting accuracy of data
- Unlawful processing but user opposes erasure
- Controller no longer needs data but user needs it for legal claims
- Pending verification of objection

#### 5. Right to Data Portability (Article 20)

Export data in machine-readable format:

```bash
GET /api/export/gdpr
Content-Type: application/json
```

Format: Standardized JSON schema

#### 6. Right to Object (Article 21)

Object to processing based on legitimate interests:

```bash
POST /api/privacy/rights
{
  "right": "OBJECTION",
  "jurisdiction": "GDPR",
  "details": {
    "processingActivity": "MARKETING"
  }
}
```

#### 7. Rights Related to Automated Decision-Making (Article 22)

Genetic Explorer does **not** make fully automated decisions with legal or significant effects. All health insights are for informational purposes only and include disclaimers.

### CCPA/CPRA Rights

California consumers have additional rights:

#### Right to Know
```bash
GET /api/privacy/ccpa-disclosure
```

#### Right to Delete
Same as GDPR erasure

#### Right to Opt-Out of Sale
```bash
POST /api/privacy/opt-out
{
  "type": "SALE"
}
```

**Note**: Genetic Explorer does not sell personal information.

#### Right to Non-Discrimination
We never discriminate against users for exercising privacy rights.

### LGPD Rights (Brazil)

Similar to GDPR with some differences:
- **Response time**: 15 days (vs GDPR's 30)
- **Anonymization right**: Right to request anonymization

### Other Jurisdictions

| Jurisdiction | Key Rights | Response Time |
|--------------|-----------|---------------|
| PIPEDA (Canada) | Access, correction | 30 days |
| POPIA (South Africa) | Access, correction, deletion | 30 days |
| Australian Privacy Act | Access, correction | 30 days |
| PIPL (China) | Access, correction, deletion | 15 days |
| APPI (Japan) | Access, correction, deletion | 30 days |
| DPDP (India) | Access, correction, deletion | 30 days |

---

## Consent Management

### Granular Consent

We implement granular consent for each processing purpose:

```typescript
interface ConsentPurpose {
  CORE_SERVICES: Required
  GENETIC_ANALYSIS: Required
  HEALTH_INSIGHTS: Optional
  ANCESTRY_ANALYSIS: Optional
  RELATIVE_MATCHING: Optional
  RESEARCH_PARTICIPATION: Optional
  MARKETING: Optional
  PRODUCT_UPDATES: Optional
  THIRD_PARTY_SHARING: Optional
}
```

### Consent Requirements

- **Clear affirmative action**: Checkbox or toggle, not pre-ticked
- **Granular**: Separate consent for each purpose
- **Documented**: Timestamp, IP, user agent recorded
- **Withdrawable**: Easy withdrawal mechanism
- **Versioned**: Consent version tracked

### Withdrawing Consent

Users can withdraw consent at any time:

```bash
POST /api/user/consent
{
  "purpose": "MARKETING",
  "granted": false
}
```

**Effect**: Processing stops immediately for that purpose.

---

## Data Retention

### Retention Schedule

| Data Type | Retention Period | Legal Basis |
|-----------|-----------------|-------------|
| Genetic data | Until account deletion | User consent |
| Account data | Until account deletion + 30 days | Contract |
| Activity logs | 90 days | Legitimate interest (security) |
| Consent records | Until account deletion + 7 years | Legal obligation |
| Backup data | 30 days after deletion | Disaster recovery |
| Failed login attempts | 30 days | Security |

### Automatic Deletion

- Daily cleanup job removes expired data
- Users can trigger early deletion via account settings
- Backups purged on schedule

---

## Security Measures

### Technical Measures

1. **Encryption at Rest**: AES-256-GCM for all genetic data
2. **Encryption in Transit**: TLS 1.3 for all connections
3. **Key Management**: Cloud KMS (AWS/Azure/GCP) or environment keys
4. **Access Control**: Role-based with principle of least privilege
5. **Audit Logging**: All access logged with user, timestamp, action
6. **Anonymization**: Research data anonymized before use

### Organizational Measures

1. **Staff Training**: Annual privacy training
2. **Access Reviews**: Quarterly access audits
3. **Incident Response**: Documented breach procedures
4. **DPO**: Data Protection Officer designated
5. **Privacy Impact Assessments**: Conducted for new features

---

## International Data Transfers

### Transfer Mechanisms

We use appropriate safeguards for international transfers:

| Mechanism | Use Case |
|-----------|----------|
| Standard Contractual Clauses (SCCs) | EU → Non-adequate countries |
| Adequacy Decisions | EU → UK, Canada, Japan, etc. |
| Binding Corporate Rules | Intra-group transfers |
| Consent | Specific one-time transfers |

### Geographic Data Storage

Users can select data residency:
- **EU**: Frankfurt (AWS eu-central-1)
- **US**: Virginia (AWS us-east-1)
- **Asia**: Singapore (AWS ap-southeast-1)

---

## Data Breach Procedures

### Detection & Response

1. **Automated monitoring**: Anomaly detection on access patterns
2. **24-hour assessment**: Determine if breach is reportable
3. **72-hour notification**: To supervisory authority if high risk
4. **Without undue delay**: Notify affected individuals

### Breach Notification Content

- Nature of breach
- Categories and approximate number of data subjects
- Likely consequences
- Measures taken/proposed
- Contact details for more information

---

## Jurisdiction-Specific Requirements

### GDPR (EU/EEA/UK)

- **DPO Required**: Yes (genetic data is special category)
- **Records of Processing**: Maintained
- **DPIA Required**: Yes for genetic data processing
- **Representative**: Needed if not EU-based

### CCPA/CPRA (California)

- **"Do Not Sell" Link**: On homepage
- **Privacy Policy**: Updated annually
- **Consumer Rights Page**: Dedicated page
- **Minors**: Opt-in required for <16 years

### LGPD (Brazil)

- **Legal Representative**: Required if not Brazil-based
- **Response Time**: 15 days
- **ANPD Registration**: May be required

### PIPL (China)

- **Separate Consent**: Required for sensitive personal info
- **Cross-border**: Security assessment or certification
- **Localization**: Consider data localization requirements

---

## Compliance Checklist

### For Development

- [ ] Privacy by design review for new features
- [ ] Data minimization assessment
- [ ] Security review
- [ ] DPIA if processing special categories

### For Operations

- [ ] Regular access reviews
- [ ] Backup testing
- [ ] Incident response drills
- [ ] Third-party vendor assessments

### For Legal

- [ ] Privacy policy updates
- [ ] Cookie policy compliance
- [ ] Data processing agreements with vendors
- [ ] Cross-border transfer documentation

### For Users

- [ ] Clear privacy notices
- [ ] Easy rights exercise mechanisms
- [ ] Granular consent options
- [ ] Transparent data use information

---

## Contact Information

**Data Protection Officer**
- Email: dpo@geneticexplorer.com
- Address: [Company Address]

**Supervisory Authority**
Users can lodge complaints with their local data protection authority:
- EU: [EDPB](https://edpb.europa.eu/)
- UK: [ICO](https://ico.org.uk/)
- Other jurisdictions: Local DPAs

---

## Updates

This document is reviewed quarterly. Last updated: 2024

For the complete privacy policy, see: https://geneticexplorer.com/privacy
