/**
 * Popup Component
 *
 * This is the main entry point for the extension popup.
 * It provides authentication and project management functionality.
 */

import React from "react"

function IndexPopup() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        padding: 16,
        width: 300,
        height: 200
      }}>
      <h2>Papercut Extension</h2>
      <p>This is a test popup.</p>
    </div>
  )
}

export default IndexPopup
