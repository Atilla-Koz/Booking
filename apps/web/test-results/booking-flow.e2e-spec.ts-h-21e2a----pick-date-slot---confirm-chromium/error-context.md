# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: booking-flow.e2e-spec.ts >> happy path: login -> pick date/slot -> confirm
- Location: tests/booking-flow.e2e-spec.ts:5:5

# Error details

```
Error: browserType.launch: Target page, context or browser has been closed
Browser logs:

<launching> /var/folders/y3/9fxn693x0n912q3t5zc878x40000gn/T/cursor-sandbox-cache/bbaaa10103c234c63b699a56403a1691/playwright/chromium_headless_shell-1217/chrome-headless-shell-mac-x64/chrome-headless-shell --disable-field-trial-config --disable-background-networking --disable-background-timer-throttling --disable-backgrounding-occluded-windows --disable-back-forward-cache --disable-breakpad --disable-client-side-phishing-detection --disable-component-extensions-with-background-pages --disable-component-update --no-default-browser-check --disable-default-apps --disable-dev-shm-usage --disable-extensions --disable-features=AvoidUnnecessaryBeforeUnloadCheckSync,BoundaryEventDispatchTracksNodeRemoval,DestroyProfileOnBrowserClose,DialMediaRouteProvider,GlobalMediaControls,HttpsUpgrades,LensOverlay,MediaRouter,PaintHolding,ThirdPartyStoragePartitioning,Translate,AutoDeElevate,RenderDocument,OptimizationHints --enable-features=CDPScreenshotNewSurface --allow-pre-commit-input --disable-hang-monitor --disable-ipc-flooding-protection --disable-popup-blocking --disable-prompt-on-repost --disable-renderer-backgrounding --force-color-profile=srgb --metrics-recording-only --no-first-run --password-store=basic --use-mock-keychain --no-service-autorun --export-tagged-pdf --disable-search-engine-choice-screen --unsafely-disable-devtools-self-xss-warnings --edge-skip-compat-layer-relaunch --enable-automation --disable-infobars --disable-search-engine-choice-screen --disable-sync --enable-unsafe-swiftshader --headless --hide-scrollbars --mute-audio --blink-settings=primaryHoverType=2,availableHoverTypes=2,primaryPointerType=4,availablePointerTypes=4 --no-sandbox --user-data-dir=/var/folders/y3/9fxn693x0n912q3t5zc878x40000gn/T/playwright_chromiumdev_profile-Hd9V0v --remote-debugging-pipe --no-startup-window
<launched> pid=27110
[pid=27110][err] Received signal 11 SEGV_MAPERR 000000000010
[pid=27110][err]  [0x0001064692c3]
[pid=27110][err]  [0x00010646d103]
[pid=27110][err]  [0x7ff806cc037d]
[pid=27110][err]  [0x00000000010b]
[pid=27110][err]  [0x00010311b065]
[pid=27110][err]  [0x000102ade061]
[pid=27110][err]  [0x000102cf4176]
[pid=27110][err]  [0x00010448c9b2]
[pid=27110][err]  [0x00010448d9dc]
[pid=27110][err]  [0x00020b1d6781]
[pid=27110][err] [end of stack trace]
Call log:
  - <launching> /var/folders/y3/9fxn693x0n912q3t5zc878x40000gn/T/cursor-sandbox-cache/bbaaa10103c234c63b699a56403a1691/playwright/chromium_headless_shell-1217/chrome-headless-shell-mac-x64/chrome-headless-shell --disable-field-trial-config --disable-background-networking --disable-background-timer-throttling --disable-backgrounding-occluded-windows --disable-back-forward-cache --disable-breakpad --disable-client-side-phishing-detection --disable-component-extensions-with-background-pages --disable-component-update --no-default-browser-check --disable-default-apps --disable-dev-shm-usage --disable-extensions --disable-features=AvoidUnnecessaryBeforeUnloadCheckSync,BoundaryEventDispatchTracksNodeRemoval,DestroyProfileOnBrowserClose,DialMediaRouteProvider,GlobalMediaControls,HttpsUpgrades,LensOverlay,MediaRouter,PaintHolding,ThirdPartyStoragePartitioning,Translate,AutoDeElevate,RenderDocument,OptimizationHints --enable-features=CDPScreenshotNewSurface --allow-pre-commit-input --disable-hang-monitor --disable-ipc-flooding-protection --disable-popup-blocking --disable-prompt-on-repost --disable-renderer-backgrounding --force-color-profile=srgb --metrics-recording-only --no-first-run --password-store=basic --use-mock-keychain --no-service-autorun --export-tagged-pdf --disable-search-engine-choice-screen --unsafely-disable-devtools-self-xss-warnings --edge-skip-compat-layer-relaunch --enable-automation --disable-infobars --disable-search-engine-choice-screen --disable-sync --enable-unsafe-swiftshader --headless --hide-scrollbars --mute-audio --blink-settings=primaryHoverType=2,availableHoverTypes=2,primaryPointerType=4,availablePointerTypes=4 --no-sandbox --user-data-dir=/var/folders/y3/9fxn693x0n912q3t5zc878x40000gn/T/playwright_chromiumdev_profile-Hd9V0v --remote-debugging-pipe --no-startup-window
  - <launched> pid=27110
  - [pid=27110][err] Received signal 11 SEGV_MAPERR 000000000010
  - [pid=27110][err]  [0x0001064692c3]
  - [pid=27110][err]  [0x00010646d103]
  - [pid=27110][err]  [0x7ff806cc037d]
  - [pid=27110][err]  [0x00000000010b]
  - [pid=27110][err]  [0x00010311b065]
  - [pid=27110][err]  [0x000102ade061]
  - [pid=27110][err]  [0x000102cf4176]
  - [pid=27110][err]  [0x00010448c9b2]
  - [pid=27110][err]  [0x00010448d9dc]
  - [pid=27110][err]  [0x00020b1d6781]
  - [pid=27110][err] [end of stack trace]
  - [pid=27110] <gracefully close start>
  - [pid=27110] <kill>
  - [pid=27110] <will force kill>
  - [pid=27110] exception while trying to kill process: Error: kill EPERM
  - [pid=27110] <process did exit: exitCode=null, signal=SIGSEGV>
  - [pid=27110] starting temporary directories cleanup
  - [pid=27110] finished temporary directories cleanup
  - [pid=27110] <gracefully close end>

```