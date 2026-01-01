/**
 * EmptyState Component - Stub for TDD
 *
 * This is a minimal stub that allows tests to import the component.
 * The actual implementation will be added during Phase 1b (AC4).
 *
 * Expected props:
 * - title: string
 * - description?: string
 * - icon?: React.ReactNode
 * - action?: { label: string; onClick: () => void }
 */

import * as React from "react"

export interface EmptyStateProps {
  title: string
  description?: string
  icon?: React.ReactNode
  action?: {
    label: string
    onClick: () => void
  }
}

export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  // Stub implementation - will be enhanced during AC4 implementation
  return (
    <div className="empty-state">
      {icon && <div className="empty-state-icon">{icon}</div>}
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {action && (
        <button onClick={action.onClick}>{action.label}</button>
      )}
    </div>
  )
}
