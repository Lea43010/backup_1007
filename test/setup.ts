import '@testing-library/jest-dom'
import { beforeAll, afterEach, afterAll } from 'vitest'
import { cleanup } from '@testing-library/react'

// Setup jsdom environment
beforeAll(() => {
  // Mock window.matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => {},
    }),
  })

  // Mock IntersectionObserver
  global.IntersectionObserver = class IntersectionObserver {
    constructor() {}
    observe() {}
    unobserve() {}
    disconnect() {}
  }

  // Mock ResizeObserver
  global.ResizeObserver = class ResizeObserver {
    constructor() {}
    observe() {}
    unobserve() {}
    disconnect() {}
  }

  // Mock Google Maps
  global.google = {
    maps: {
      Map: class MockMap {
        constructor() {}
        setCenter() {}
        setZoom() {}
        addListener() {}
      },
      Marker: class MockMarker {
        constructor() {}
        setMap() {}
        addListener() {}
      },
      InfoWindow: class MockInfoWindow {
        constructor() {}
        open() {}
        close() {}
      },
      LatLng: class MockLatLng {
        constructor(lat: number, lng: number) {
          this.lat = () => lat
          this.lng = () => lng
        }
        lat: () => number
        lng: () => number
      },
      event: {
        addListener: () => {},
        removeListener: () => {},
      },
      places: {
        Autocomplete: class MockAutocomplete {
          constructor() {}
          addListener() {}
        },
      },
    },
  } as any

  // Mock navigator.geolocation
  Object.defineProperty(global.navigator, 'geolocation', {
    value: {
      getCurrentPosition: (success: any) => {
        success({
          coords: {
            latitude: 48.1351,
            longitude: 11.5820,
            accuracy: 10,
          },
        })
      },
      watchPosition: () => 1,
      clearWatch: () => {},
    },
    writable: true,
  })

  // Mock URL.createObjectURL
  global.URL.createObjectURL = () => 'mock-url'
  global.URL.revokeObjectURL = () => {}

  // Mock HTMLMediaElement
  window.HTMLMediaElement.prototype.play = () => Promise.resolve()
  window.HTMLMediaElement.prototype.pause = () => {}
  window.HTMLMediaElement.prototype.load = () => {}
})

// Cleanup after each test case
afterEach(() => {
  cleanup()
})

// Cleanup after all tests
afterAll(() => {
  // Any global cleanup
})