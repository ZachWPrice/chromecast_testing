import './style.css'

const DEFAULT_RECEIVER_APP_ID = 'CC1AD845'
const CUSTOM_NAMESPACE = 'urn:x-cast:com.zachwprice.chromecast'

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
    <button id="start-cast" class="start-cast-button" type="button">
      Start Cast
    </button>
    <button id="random-color" class="random-color-button" type="button">
      Random Color
    </button>
    <google-cast-launcher class="cast-button"></google-cast-launcher>
    <p class="hint">
      Set <code>VITE_CAST_APP_ID</code> in <code>.env.local</code> once your
      custom receiver is registered.
    </p>
  </main>
`

const statusEl = document.querySelector<HTMLSpanElement>('#cast-status')
const startCastButton = document.querySelector<HTMLButtonElement>('#start-cast')
const randomColorButton = document.querySelector<HTMLButtonElement>('#random-color')

interface SetBackgroundColorMessage {
  type: 'SET_BACKGROUND_COLOR'
  color: string
}

function setStatus(text: string): void {
  if (statusEl) {
    statusEl.textContent = text
  }
}

function randomHexColor(): string {
  return `#${Math.floor(Math.random() * 0xffffff)
    .toString(16)
    .padStart(6, '0')
    .toUpperCase()}`
}

function formatCastError(error: unknown): string {
  if (!error || typeof error !== 'object') {
    return String(error)
  }

  const maybeError = error as { code?: string; description?: string; message?: string }
  const code = maybeError.code ? `code=${maybeError.code}` : 'code=unknown'
  const description = maybeError.description || maybeError.message || 'no description'
  return `${code}; ${description}`
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

  if (startCastButton) {
    startCastButton.disabled = false
    startCastButton.addEventListener('click', async () => {
      try {
        await context.requestSession()
      } catch (error) {
        setStatus(`Cast session failed: ${formatCastError(error)}`)
      }
    })
  }

  if (randomColorButton) {
    randomColorButton.disabled = true
    randomColorButton.addEventListener('click', async () => {
      const session = context.getCurrentSession()
      if (!session) {
        setStatus('No active session. Start casting first.')
        randomColorButton.disabled = true
        return
      }

      const color = randomHexColor()
      const message: SetBackgroundColorMessage = {
        type: 'SET_BACKGROUND_COLOR',
        color,
      }

      try {
        await session.sendMessage(CUSTOM_NAMESPACE, message)
        setStatus(`Sent new color to receiver: ${color}`)
      } catch (error) {
        setStatus(`Color message failed: ${formatCastError(error)}`)
      }
    })
  }

  context.addEventListener(
    castFramework.CastContextEventType.SESSION_STATE_CHANGED,
    (event: CastSessionStateChangedEvent) => {
      switch (event.sessionState) {
        case castFramework.SessionState.SESSION_STARTING:
          setStatus('Starting cast session...')
          break
        case castFramework.SessionState.SESSION_STARTED:
          setStatus('Cast session started.')
          if (randomColorButton) {
            randomColorButton.disabled = false
          }
          break
        case castFramework.SessionState.SESSION_START_FAILED:
          setStatus('Cast session failed to start.')
          break
        case castFramework.SessionState.SESSION_ENDING:
          setStatus('Ending cast session...')
          break
        case castFramework.SessionState.SESSION_ENDED:
          setStatus('Cast session ended.')
          if (randomColorButton) {
            randomColorButton.disabled = true
          }
          break
        case castFramework.SessionState.NO_SESSION:
          setStatus('No active cast session.')
          if (randomColorButton) {
            randomColorButton.disabled = true
          }
          break
        default:
          setStatus(`Session update: ${event.sessionState}`)
      }
    },
  )
}

if (startCastButton) {
  startCastButton.disabled = true
}
if (randomColorButton) {
  randomColorButton.disabled = true
}

window.__onGCastApiAvailable = (isAvailable: boolean) => {
  if (isAvailable) {
    initializeCast()
    return
  }
  setStatus('Cast API is not available in this browser.')
}

if (window.cast?.framework) {
  initializeCast()
}
