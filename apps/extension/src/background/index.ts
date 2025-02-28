/**
 * Background Service Worker
 *
 * This script runs in the background and handles:
 * - Communication between content scripts and the popup
 * - Authentication state management
 * - Database operations
 * - Extension lifecycle events
 */

import { Storage } from "@plasmohq/storage"

import { MessageType } from "../lib/types"

// Initialize storage
const storage = new Storage()

/**
 * Initialize the background service
 */
function initialize() {
  console.log("Papercut background service initialized")

  // Set up message listeners
  chrome.runtime.onMessage.addListener(handleMessage)

  // Set up tab update listener to inject content script when needed
  chrome.tabs.onUpdated.addListener(handleTabUpdate)

  // Set up installation and update handlers
  chrome.runtime.onInstalled.addListener(handleInstalled)
}

/**
 * Handle messages from content scripts and popup
 */
function handleMessage(
  message: any,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response: any) => void
) {
  console.log("Background received message:", message, "from:", sender)

  // Handle different message types
  switch (message.type) {
    case "ELEMENT_SELECTED":
      // Forward element selection to popup if it's open
      forwardToPopup(message)
      sendResponse({ success: true })
      break

    case "AUTH_STATE_CHANGED":
      // Store auth state
      handleAuthStateChange(message.payload)
      sendResponse({ success: true })
      break

    case "GET_AUTH_STATE":
      // Return current auth state
      getAuthState().then((authState) => {
        sendResponse({ success: true, authState })
      })
      return true // Keep the message channel open for async response

    case "CLEAR_AUTH_STATE":
      // Clear auth state
      clearAuthState().then(() => {
        sendResponse({ success: true })
      })
      return true // Keep the message channel open for async response

    default:
      console.log("Unknown message type:", message.type)
      sendResponse({ success: false, error: "Unknown message type" })
  }

  return true // Keep the message channel open for async response
}

/**
 * Forward a message to the popup if it's open
 */
function forwardToPopup(message: any) {
  chrome.runtime.sendMessage(message).catch((error) => {
    // This error is expected if the popup is not open
    if (!error.message.includes("Could not establish connection")) {
      console.error("Error forwarding message to popup:", error)
    }
  })
}

/**
 * Handle tab updates to inject content script when needed
 */
function handleTabUpdate(
  tabId: number,
  changeInfo: chrome.tabs.TabChangeInfo,
  tab: chrome.tabs.Tab
) {
  // Only inject when the tab has completed loading
  if (changeInfo.status !== "complete" || !tab.url) return

  // Skip non-http(s) URLs
  if (!tab.url.startsWith("http")) return

  // Skip extension pages
  if (tab.url.startsWith(chrome.runtime.getURL(""))) return

  // Check if we should inject the content script
  shouldInjectContentScript(tab.url).then((shouldInject) => {
    if (shouldInject) {
      injectContentScript(tabId)
    }
  })
}

/**
 * Determine if we should inject the content script for a given URL
 */
async function shouldInjectContentScript(url: string): Promise<boolean> {
  // Get the list of domains where the content script should be automatically injected
  const autoInjectDomains =
    ((await storage.get("autoInjectDomains")) as string[]) || []

  // Check if the URL matches any of the domains
  return autoInjectDomains.some((domain) => url.includes(domain))
}

/**
 * Inject the content script into a tab
 */
function injectContentScript(tabId: number) {
  chrome.scripting
    .executeScript({
      target: { tabId },
      files: ["content.js"]
    })
    .catch((error) => {
      console.error("Error injecting content script:", error)
    })
}

/**
 * Handle extension installation or update
 */
function handleInstalled(details: chrome.runtime.InstalledDetails) {
  if (details.reason === "install") {
    // First installation
    console.log("Extension installed")

    // Set default settings
    storage.set("autoInjectDomains", [])

    // Open onboarding page
    chrome.tabs.create({
      url: chrome.runtime.getURL("onboarding.html")
    })
  } else if (details.reason === "update") {
    // Extension updated
    console.log("Extension updated from version", details.previousVersion)

    // Perform any necessary data migrations
    migrateDataIfNeeded(details.previousVersion)
  }
}

/**
 * Migrate data when updating from previous versions
 */
function migrateDataIfNeeded(previousVersion: string | undefined) {
  // Example migration logic
  if (previousVersion && previousVersion.startsWith("0.1")) {
    // Migrate from 0.1.x to newer version
    console.log("Migrating data from version", previousVersion)

    // Perform migration tasks
    // ...
  }
}

/**
 * Handle authentication state changes
 */
async function handleAuthStateChange(authState: any) {
  await storage.set("authState", authState)

  // Notify any open extension pages about the auth state change
  chrome.runtime
    .sendMessage({
      type: "AUTH_STATE_UPDATED",
      payload: authState
    })
    .catch(() => {
      // Ignore errors if no listeners
    })
}

/**
 * Get the current authentication state
 */
async function getAuthState() {
  return await storage.get("authState")
}

/**
 * Clear the authentication state
 */
async function clearAuthState() {
  await storage.remove("authState")
}

// Initialize the background service
initialize()
