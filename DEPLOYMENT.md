# DrainSense Deployment Guide

Use this after GitHub authentication is fixed.

## 1. Push to GitHub

```powershell
cd C:\Users\anand\DrainSense
gh auth login -h github.com -w --git-protocol https
gh auth setup-git
git push -u origin main
```

Target repository:

```text
https://github.com/DarkCrossDungen/Hack-step.git
```

If `gh auth status` still says the token is invalid, logout and login again:

```powershell
gh auth logout -h github.com -u DarkCrossDungen
gh auth login -h github.com -w --git-protocol https
gh auth setup-git
git push -u origin main
```

## 2. Deploy on Vercel

1. Open Vercel.
2. Choose **Add New Project**.
3. Import `DarkCrossDungen/Hack-step`.
4. Keep the framework preset as **Next.js**.
5. Build command: `npm run build`.
6. Output directory: leave default.
7. Deploy.

No production environment variables are required for the current prototype.

## 3. Smoke Test the Live URL

After deployment, test:

- Home page loads.
- **Run judge demo** moves the product to the evidence state.
- **Report Intake** can submit after adding a sample photo, place, and issue note.
- **Weak Points** shows the new report in the ranked list and sample map.
- **Action Plan** shows prioritized cleanup stops, manual team invite copy, calendar download, and proof upload.
- **Proof Review** can submit after-proof and review a point as resolved.
- **Demo Evidence** updates only after reviewed proof.
- **Reset** returns the app to a clean demo state.

## 4. Devpost Links

Add these to Devpost:

- Live app: Vercel production URL
- Source code: `https://github.com/DarkCrossDungen/Hack-step`
- Demo video: uploaded video link
