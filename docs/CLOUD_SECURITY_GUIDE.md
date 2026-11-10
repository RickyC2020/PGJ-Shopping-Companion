# Google Cloud Platform & Firebase Key Hardening Guide
## Progressive Foods Jamaica Mobile Companion

### 1. Overview
In accordance with retail cloud security best practices and the Jamaica Data Protection Act (JDPA 2020), all client-side Firebase API keys (`VITE_FIREBASE_API_KEY`) must be strictly scoped in the **Google Cloud Console (APIs & Services > Credentials)**. 

Because client-side keys are bundled in browser scripts, security must rely on **Application Restrictions** and **API Restrictions**, supplemented by **Firebase App Check**.

---

### 2. Google Cloud Console Key Restrictions

Navigate to: `https://console.cloud.google.com/apis/credentials?project=progressive-foods-retail`  
Select the Web Client API Key (corresponding to `VITE_FIREBASE_API_KEY`).

#### A. Set Application Restrictions (HTTP Referrers)
Under **Application restrictions**, select **Web sites (HTTP referrers)** and add the following authorized origin patterns:

1. **Production Web Application**:
   ```
   https://app.progressivefoods.com.jm/*
   ```
2. **Firebase Hosting Domains**:
   ```
   https://progressive-foods-retail.firebaseapp.com/*
   https://progressive-foods-retail.web.app/*
   ```
3. **Local Development (Dedicated Dev Key Only)**:
   > ⚠️ *Never add `localhost` to the production key! Create a separate development key restricted to:*
   ```
   http://localhost:*
   http://127.0.0.1:*
   ```

#### B. Set API Restrictions
Under **API restrictions**, select **Restrict key**, and whitelist ONLY the following client-facing APIs:

| Permitted API | Purpose |
| :--- | :--- |
| **Cloud Firestore API** | Client-side read of in-store products catalog (`/products/{id}`). |
| **Firebase Installations API** | Client device registration and session identification. |
| **Token Service API** | Auth token generation and refreshing. |
| **reCAPTCHA Enterprise API** | Attestation token validation for Firebase App Check. |

**Strictly Forbidden APIs on this Key**:
- ❌ Cloud IAM / Resource Manager API
- ❌ Cloud Compute Engine API
- ❌ Cloud Storage Management (admin)
- ❌ Secret Manager API
- ❌ BigQuery API

---

### 3. Firebase App Check Attestation
To prevent automated headless scrapers or botnets from querying Firestore even with a valid referrer:
1. Open **Firebase Console > App Check**.
2. Register the Web App with **reCAPTCHA Enterprise** using Site Key: `VITE_FIREBASE_APP_CHECK_KEY`.
3. Set Firestore Enforcement to **Enforce**.
4. In staging/local testing, register debug tokens (`FIREBASE_APPCHECK_DEBUG_TOKEN`).

---

### 4. Build Hygiene Verification
To verify no internal staging credentials or private backend keys are packaged:
```bash
npm run audit:env
npm run build
```
The automated pre-build audit blocks any build containing un-prefixed secrets.
