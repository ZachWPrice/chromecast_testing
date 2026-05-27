interface CastSessionStateChangedEvent {
  sessionState: string
}

interface CastSession {
  sendMessage(namespace: string, data: unknown): Promise<void>
}

interface Window {
  cast?: {
    framework: {
      CastContext: {
        getInstance(): {
          setOptions(options: {
            receiverApplicationId: string
            autoJoinPolicy: string
          }): void
          getCurrentSession(): CastSession | null
          requestSession(): Promise<void>
          addEventListener(
            eventType: string,
            handler: (event: CastSessionStateChangedEvent) => void,
          ): void
        }
      }
      CastContextEventType: {
        SESSION_STATE_CHANGED: string
      }
      SessionState: {
        SESSION_STARTING: string
        SESSION_STARTED: string
        SESSION_START_FAILED: string
        SESSION_ENDING: string
        SESSION_ENDED: string
        NO_SESSION: string
      }
    }
  }
  chrome: {
    cast: {
      AutoJoinPolicy: {
        ORIGIN_SCOPED: string
      }
    }
  }
  __onGCastApiAvailable?: (isAvailable: boolean) => void
}
