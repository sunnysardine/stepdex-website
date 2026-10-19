# Browser checks

GitHub Actions runs Chromium checks on pull requests and pushes to main.
The workflow installs its own pinned Playwright version, leaving the website dependencies unchanged.

Coverage: home, Programs, STEP Up Your Performance and Contact at widths 360, 390, 768 and 1440 pixels.
Checks cover mobile menu opening/closing/navigation, main heading bounds, horizontal overflow, gallery images and both session enquiry links.
Contact checks stop before submission: delivery to the CRM or email is not verified.
Chatbase is excluded so that an unrelated third-party widget cannot make these checks unreliable.
The local static server applies the repository's exact Vercel rewrite rules; backend functions, Vercel middleware and domain configuration require separate deployment checks.
Screenshots and the result table are available in the Browser checks run.

To run locally:
```sh
npm install --prefix qa --no-save --package-lock=false playwright@1.58.2
./qa/node_modules/.bin/playwright install chromium
node qa/browser-checks.cjs
```
