# TripProof: Project-Linked Travel Expense & Tax Intelligence Engine
### Native Financial & Compliance Firewall for the Suproc Network OS Ecosystem

[![FastAPI](https://img.shields.io/badge/FastAPI-0.110.0-009688.svg?logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18.2.0-61DAFB.svg?logo=react)](https://reactjs.org)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4.1-38B2AC.svg?logo=tailwind-css)](https://tailwindcss.com)
[![Tests](https://img.shields.io/badge/Tests-13%20Passed-brightgreen.svg)]()
[![Suproc Native](https://img.shields.io/badge/Suproc%20Marketplace-Verified%20Agent-16A34A.svg)]()

---

## 🎯 Executive Overview

Corporate travel expense management is fundamentally broken because legacy tools treat it as an **Optical Character Recognition (OCR)** challenge rather than a **tax compliance, project accounting, and reconciliation problem**.

**TripProof** solves this as a native **Financial & Compliance Firewall** for the **Suproc Network OS**. It combines **Multimodal Vision AI (Gemini Flash VLM)** for perceptual document understanding with **strictly deterministic Python engines** for tax math, Luhn Mod-36 checksum validation, policy enforcement, multi-modal duplicate detection, and immutable **Evidence Graph** assembly.

---

## 💡 Key Architectural Pillars

1. **GST Rule 46 & Section 17(5) Statutory Tax Engine:**
   - **Post-56th GST Council Hotel Slabs:** Automatically identifies that room tariffs $\le ₹7,500$ attract 5% GST *without ITC* (the big trap), while $> ₹7,500$ attract 18% *with ITC*.
   - **Section 17(5)(b) Blocked ITC:** Splits complex hotel folios and marks food & beverages and passenger transport as non-claimable credits.
   - **Luhn Mod-36 Cryptographic Checksum:** Deterministically verifies the 15th digit of Indian GSTINs to eliminate OCR hallucinations.
2. **Suproc Project & RFQ Linking (The Suproc Moat):**
   - Every travel claim is contextually bound to an active **Suproc Project Space** and Sourcing RFQ (e.g. `RFQ-2847 Coimbatore Supplier Quality Audit`).
   - Automated alerts when travel dates exceed contracted project windows.
3. **Multi-Vector Duplicate Detection:**
   - **Vector 1:** Cryptographic SHA-256 byte-exact matching.
   - **Vector 2:** Perceptual Image Hashing (dHash) for re-compressed WhatsApp screenshots.
   - **Vector 3:** Composite semantic key `(Merchant, Date, Amount, Traveller)`.
4. **Smart Split-Screen Human-in-the-Loop (HITL) Review:**
   - Prioritized by **Money-at-Risk** rather than FIFO.
   - Synchronized bounding box highlighting and auto-zoom.
   - Live real-time deterministic math recalculation on reviewer input.
5. **1-Click Audit Pack & Evidence Graph:**
   - Generates downloadable ZIP & printable HTML audit packages linking original documents, extracted JSON, validation verdicts, and approver signatures.
   - Standard CSV export formatted for **Tally Prime, Zoho Books, and QuickBooks Online**.
6. **10 Built-In Deterministic Demo Scenarios:**
   - Zero-friction live demonstration covering happy paths, tax splits, duplicates, policy violations, low-confidence parking slips, FX conversion, booking mismatches, and lost ITC traps.

---

## 🚀 Quick Start (Local Development)

### 1. Clone & Setup Backend
```bash
cd scratch/tripproof
# Install Python dependencies (Python 3.10 - 3.13 recommended)
py -3.13 -m pip install -r requirements.txt

# Run Automated Test Suite (13/13 passing)
py -3.13 -m pytest tests/ -v

# Start FastAPI Backend Server
py -3.13 backend/main.py
```
*API & Documentation will be live at `http://localhost:7860/docs`.*

### 2. Run Frontend
```bash
cd frontend
npm install
npm run dev
```
*Frontend UI will be live at `http://localhost:5173`.*

---

## 🐳 Docker & Hugging Face Spaces Deployment

TripProof is packaged for single-command deployment to **Hugging Face Spaces (Docker Space)** and **Render**:

```bash
# Build & Run via Docker
docker build -t tripproof .
docker run -p 7860:7860 tripproof
```

---

## 📊 The 10 Deterministic Demo Scenarios

| Scenario ID | Document | Merchant | Educational & Compliance Objective |
| :---: | :--- | :--- | :--- |
| **D1** | Flight Tax Invoice | IndiGo Airlines | **Happy Path:** 5% Economy airfare, valid corporate GSTIN, auto-accepted (0.98 confidence). |
| **D2** | Multi-Page Folio | Taj Vivanta Coimbatore | **Tax Split:** Room ₹10,000 (18% ITC claimable) + Food ₹2,300 (5% blocked S.17(5)) split. |
| **D3** | Cab Receipt PDF | Ola Cabs Airport Ride | **Passenger Transport:** ₹850 cab with 5% GST routed to non-claimable expense pool. |
| **D4** | Recompressed JPEG | Same Ola Cab | **Duplicate Detection:** Caught via composite key `(Merchant + Date + Amount + User)`. |
| **D5** | Dining Receipt | Barbeque Nation | **Policy Violation:** ₹4,800 dinner exceeds daily ₹2,000 per diem cap + includes alcohol. |
| **D6** | Thermal Parking Slip | Airport Parking CJB | **Low Confidence:** Blurry image (0.45 confidence) routed to Smart Review Queue. |
| **D7** | Foreign Cab Receipt | Grab Singapore | **Historical FX:** SGD 42.00 converted to INR on receipt date via Frankfurter API. |
| **D8** | Hotel Folio vs PNR | Fairfield by Marriott | **Booking Mismatch:** Folio total ₹14,200 vs estimated booking quote of ₹9,800. |
| **D9** | Uber Receipt | Uber India | **Trip-Window Anomaly:** Receipt dated 3 days after official project trip completion date. |
| **D10** | Hotel Folio | Lemon Tree Hotel | **Lost ITC Trap:** Bill issued in personal name without company GSTIN (₹1,830 lost ITC). |

---

## 🛡️ License & Suproc Marketplace Certification
Licensed under the Apache 2.0 License. Developed as a native compliance agent for the Suproc Agent Marketplace.
