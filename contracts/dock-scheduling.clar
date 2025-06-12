;; Dock Scheduling Contract
;; Schedules cross-docking operations and manages dock availability

(define-constant CONTRACT_OWNER tx-sender)
(define-constant ERR_UNAUTHORIZED (err u300))
(define-constant ERR_DOCK_NOT_FOUND (err u301))
(define-constant ERR_DOCK_OCCUPIED (err u302))
(define-constant ERR_INVALID_TIME_SLOT (err u303))

;; Dock data structure
(define-map docks
  { dock-id: uint }
  {
    name: (string-ascii 20),
    capacity: uint,
    available: bool,
    current-shipment: (optional uint),
    scheduled-until: uint
  }
)

;; Time slot reservations
(define-map dock-schedule
  { dock-id: uint, time-slot: uint }
  {
    shipment-id: uint,
    reserved-by: principal,
    duration: uint
  }
)

(define-data-var next-dock-id uint u1)

;; Initialize a dock
(define-public (initialize-dock (name (string-ascii 20)) (capacity uint))
  (let ((dock-id (var-get next-dock-id)))
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_UNAUTHORIZED)

    (map-set docks
      { dock-id: dock-id }
      {
        name: name,
        capacity: capacity,
        available: true,
        current-shipment: none,
        scheduled-until: u0
      }
    )

    (var-set next-dock-id (+ dock-id u1))
    (ok dock-id)
  )
)

;; Reserve dock time slot
(define-public (reserve-dock-slot
  (dock-id uint)
  (time-slot uint)
  (shipment-id uint)
  (duration uint))

  (let ((dock (unwrap! (map-get? docks { dock-id: dock-id }) ERR_DOCK_NOT_FOUND)))
    (asserts! (is-none (map-get? dock-schedule { dock-id: dock-id, time-slot: time-slot }))
              ERR_DOCK_OCCUPIED)
    (asserts! (> time-slot block-height) ERR_INVALID_TIME_SLOT)

    (map-set dock-schedule
      { dock-id: dock-id, time-slot: time-slot }
      {
        shipment-id: shipment-id,
        reserved-by: tx-sender,
        duration: duration
      }
    )
    (ok true)
  )
)

;; Occupy dock for current shipment
(define-public (occupy-dock (dock-id uint) (shipment-id uint) (duration uint))
  (let ((dock (unwrap! (map-get? docks { dock-id: dock-id }) ERR_DOCK_NOT_FOUND)))
    (asserts! (get available dock) ERR_DOCK_OCCUPIED)

    (map-set docks
      { dock-id: dock-id }
      (merge dock {
        available: false,
        current-shipment: (some shipment-id),
        scheduled-until: (+ block-height duration)
      })
    )
    (ok true)
  )
)

;; Release dock
(define-public (release-dock (dock-id uint))
  (let ((dock (unwrap! (map-get? docks { dock-id: dock-id }) ERR_DOCK_NOT_FOUND)))
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_UNAUTHORIZED)

    (map-set docks
      { dock-id: dock-id }
      (merge dock {
        available: true,
        current-shipment: none,
        scheduled-until: u0
      })
    )
    (ok true)
  )
)

;; Get dock details
(define-read-only (get-dock (dock-id uint))
  (map-get? docks { dock-id: dock-id })
)

;; Check dock availability
(define-read-only (is-dock-available (dock-id uint))
  (match (map-get? docks { dock-id: dock-id })
    dock (get available dock)
    false
  )
)

;; Get dock schedule
(define-read-only (get-dock-schedule (dock-id uint) (time-slot uint))
  (map-get? dock-schedule { dock-id: dock-id, time-slot: time-slot })
)
