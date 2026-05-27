import './style.css'

const DEFAULT_RECEIVER_APP_ID = 'CC1AD845'

const appId = (
  import.meta.env.VITE_CAST_APP_ID || DEFAULT_RECEIVER_APP_ID
).trim()

const appRoot = document.querySelector<HTMLDivElement>('#app')

if (!appRoot) {
  throw new Error('Unable to find #app root container.')
}

appRoot.innerHTML = `
  <main class="shell">
    <h1>Cast Hello World Sender</h1>
    <p class="subhead">
      Launch your custom receiver and show "Hello World" on the TV.
    </p>
    <p class="status-line">
      Status: <span id="cast-status">Waiting for Cast framework...</span>
    </p>
    <google-cast-launcher class="cast-button"></google-cast-launcher>
    <p class="hint">
      Set <code>VITE_CAST_APP_ID</code> in <code>.env.local</code> once your
      custom receiver is registered.
    </p>
  </main>
`

const statusEl = document.querySelector<HTMLSpanElement>('#cast-status')

function setStatus(text: string): void {
  if (statusEl) {
    statusEl.textContent = text
  }
}

function initializeCast(): void {
  const castFramework = window.cast?.framework
  if (!castFramework) {
    setStatus('Cast framework unavailable in this browser.')
    return
  }

  const context = castFramework.CastContext.getInstance()
  context.setOptions({
    receiverApplicationId: appId,
    autoJoinPolicy: window.chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED,
  })

  setStatus(`Ready to cast (App ID: ${appId}).`)

  context.addEventListener(
    castFramework.CastContextEventType.SESSION_STATE_CHANGED,
    (event: CastSessionStateChangedEvent) => {
      switch (event.sessionState) {
        case castFramework.SessionState.SESSION_STARTING:
          setStatus('Starting cast session...')
          break
        case castFramework.SessionState.SESSION_STARTED:
          setStatus('Cast session started.')
          break
        case castFramework.SessionState.SESSION_START_FAILED:
          setStatus('Cast session failed to start.')
          break
        case castFramework.SessionState.SESSION_ENDING:
          setStatus('Ending cast session...')
          break
        case castFramework.SessionState.SESSION_ENDED:
          setStatus('Cast session ended.')
          break
        case castFramework.SessionState.NO_SESSION:
          setStatus('No active cast session.')
          break
        default:
          setStatus(`Session update: ${event.sessionState}`)
      }
    },
  )
}

if ('__onGCastApiAvailable' in window) {
  window.__onGCastApiAvailable = (isAvailable: boolean) => {
    if (isAvailable) {
      initializeCast()
      return
    }
    setStatus('Cast API is not available.')
  }
} else {
  setStatus('Cast script callback not registered.')
}
